import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Eye,
  Images,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

import { AdminLayout } from '../../components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';

interface GalleryImage {
  id: string;
  image_url: string;
  caption_ar: string | null;
  caption_en: string | null;
  display_order: number;
  created_at?: string;
}

interface GalleryForm {
  caption_ar: string;
  caption_en: string;
  display_order: number;
}

const emptyForm: GalleryForm = {
  caption_ar: '',
  caption_en: '',
  display_order: 0,
};

function getStoragePathFromPublicUrl(url: string | null) {
  if (!url) return null;

  try {
    const decoded = decodeURIComponent(url);
    const marker = '/gallery-images/';
    const index = decoded.indexOf(marker);

    if (index === -1) return null;

    return decoded.slice(index + marker.length);
  } catch {
    return null;
  }
}

export function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryImage[]>([]);
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryImage | null>(null);

  const [form, setForm] = useState<GalleryForm>(emptyForm);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadGallery = async () => {
    setLoading(true);
    setError('');

    const { data, error: loadError } = await supabase
      .from('gallery_images')
      .select('id,image_url,caption_ar,caption_en,display_order,created_at')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (loadError) {
      console.error('LOAD GALLERY ERROR:', loadError);
      setError(loadError.message || 'Failed to load gallery.');
      setItems([]);
    } else {
      setItems((data as GalleryImage[]) || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadGallery();
  }, []);

  useEffect(() => {
    return () => {
      if (preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const resetForm = () => {
    if (preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }

    setEditingItem(null);
    setForm(emptyForm);
    setImage(null);
    setPreview('');
    setError('');
  };

  const openAddModal = () => {
    resetForm();
    setSuccess('');
    setShowModal(true);
  };

  const openEditModal = (item: GalleryImage) => {
    if (preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }

    setEditingItem(item);
    setForm({
      caption_ar: item.caption_ar || '',
      caption_en: item.caption_en || '',
      display_order: item.display_order ?? 0,
    });
    setImage(null);
    setPreview(item.image_url);
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === 'display_order' ? Number(value) : value,
    }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please upload a JPG, PNG, or WEBP image.');
      event.target.value = '';
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5 MB.');
      event.target.value = '';
      return;
    }

    if (preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }

    setImage(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setError('');
  };

  const uploadImage = async (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `gallery/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('gallery-images')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('gallery-images')
      .getPublicUrl(path);

    if (!data.publicUrl) {
      throw new Error('Could not create a public URL for the gallery image.');
    }

    return {
      publicUrl: data.publicUrl,
      path,
    };
  };

  const deleteStorageImage = async (url: string | null) => {
    const path = getStoragePathFromPublicUrl(url);

    if (!path) return;

    const { error: removeError } = await supabase.storage
      .from('gallery-images')
      .remove([path]);

    if (removeError) {
      console.warn('REMOVE GALLERY IMAGE ERROR:', removeError);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError('');
    setSuccess('');

    let newlyUploadedPath: string | null = null;

    try {
      let imageUrl = editingItem?.image_url || null;

      if (image) {
        const uploaded = await uploadImage(image);
        imageUrl = uploaded.publicUrl;
        newlyUploadedPath = uploaded.path;
      }

      if (!imageUrl) {
        throw new Error('Please select an image.');
      }

      const payload = {
        image_url: imageUrl,
        caption_ar: form.caption_ar.trim() || null,
        caption_en: form.caption_en.trim() || null,
        display_order: Number(form.display_order) || 0,
      };

      if (editingItem) {
        const oldImageUrl = editingItem.image_url;

        const { error: updateError } = await supabase
          .from('gallery_images')
          .update(payload)
          .eq('id', editingItem.id);

        if (updateError) throw updateError;

        if (image && oldImageUrl !== imageUrl) {
          await deleteStorageImage(oldImageUrl);
        }

        setSuccess('Gallery image updated successfully.');
      } else {
        const { error: insertError } = await supabase
          .from('gallery_images')
          .insert(payload);

        if (insertError) throw insertError;

        setSuccess('Gallery image added successfully.');
      }

      await loadGallery();
      setShowModal(false);
      resetForm();
    } catch (saveError: any) {
      console.error('SAVE GALLERY ERROR:', saveError);

      if (newlyUploadedPath) {
        await supabase.storage
          .from('gallery-images')
          .remove([newlyUploadedPath]);
      }

      setError(
        saveError?.message ||
          'Failed to save gallery image. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: GalleryImage) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this gallery image?'
    );

    if (!confirmed) return;

    setDeletingId(item.id);
    setError('');
    setSuccess('');

    try {
      const { error: deleteError } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', item.id);

      if (deleteError) throw deleteError;

      await deleteStorageImage(item.image_url);

      setItems((previous) =>
        previous.filter((galleryItem) => galleryItem.id !== item.id)
      );

      setSuccess('Gallery image deleted successfully.');
    } catch (deleteError: any) {
      console.error('DELETE GALLERY ERROR:', deleteError);
      setError(
        deleteError?.message ||
          'Failed to delete gallery image. Please try again.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return items;

    return items.filter((item) => {
      return (
        item.caption_en?.toLowerCase().includes(term) ||
        item.caption_ar?.toLowerCase().includes(term)
      );
    });
  }, [items, search]);

  return (
    <AdminLayout title="Gallery">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Manage Gallery
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Upload, edit and organize images displayed on the website.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-[#0C4A2E] text-white px-5 py-3 rounded-xl hover:bg-[#083A24] transition"
        >
          <Plus size={18} />
          Add Image
        </button>
      </div>

      {success && !showModal && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {error && !showModal && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search gallery..."
              className="w-full border border-gray-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-[#0C4A2E] focus:ring-2 focus:ring-[#0C4A2E]/10"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Loading gallery...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#0C4A2E]/10 flex items-center justify-center">
              <Images className="text-[#0C4A2E]" size={26} />
            </div>
            <h3 className="font-semibold text-gray-800 mt-4">
              No gallery images found
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Add your first image to start building the website gallery.
            </p>
          </div>
        ) : (
          <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                className="group border border-gray-100 rounded-2xl overflow-hidden bg-white hover:shadow-md transition"
              >
                <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.caption_en || item.caption_ar || 'Gallery'}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-300"
                    loading="lazy"
                  />
                </div>

                <div className="p-4">
                  <p className="font-medium text-gray-800 line-clamp-1">
                    {item.caption_en || 'Untitled image'}
                  </p>

                  <p
                    dir="rtl"
                    className="text-xs text-gray-400 mt-1 line-clamp-1"
                  >
                    {item.caption_ar || 'بدون عنوان'}
                  </p>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-gray-400">
                      Order: {item.display_order ?? 0}
                    </span>

                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          window.open(
                            item.image_url,
                            '_blank',
                            'noopener,noreferrer'
                          )
                        }
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                        title="View image"
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                        title="Edit image"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        disabled={deletingId === item.id}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-40"
                        title="Delete image"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#073B2A]">
                  {editingItem ? 'Edit Gallery Image' : 'Add Gallery Image'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {editingItem
                    ? 'Update the image details or replace the current image.'
                    : 'Upload an image and add optional bilingual captions.'}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image
                </label>

                <label className="border-2 border-dashed border-gray-200 rounded-2xl min-h-52 flex items-center justify-center cursor-pointer hover:border-[#0C4A2E] transition overflow-hidden bg-gray-50/40">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Gallery preview"
                      className="w-full max-h-80 object-cover"
                    />
                  ) : (
                    <div className="text-center p-8">
                      <Upload
                        size={30}
                        className="mx-auto text-[#073B2A]"
                      />
                      <p className="font-medium text-gray-700 mt-3">
                        Select gallery image
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        JPG, PNG or WEBP · Maximum 5 MB
                      </p>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {editingItem && !image && (
                  <p className="text-xs text-gray-400 mt-2">
                    The current image will remain unless you choose a new one.
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    English Caption
                  </label>
                  <input
                    name="caption_en"
                    value={form.caption_en}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E] focus:ring-2 focus:ring-[#0C4A2E]/10"
                    placeholder="Optional caption"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arabic Caption
                  </label>
                  <input
                    name="caption_ar"
                    value={form.caption_ar}
                    onChange={handleChange}
                    dir="rtl"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E] focus:ring-2 focus:ring-[#0C4A2E]/10"
                    placeholder="وصف اختياري"
                  />
                </div>
              </div>

              <div className="max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  name="display_order"
                  value={form.display_order}
                  onChange={handleChange}
                  min={0}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E] focus:ring-2 focus:ring-[#0C4A2E]/10"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-4 text-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-5 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-xl bg-[#0C4A2E] text-white font-medium hover:bg-[#083A24] disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : editingItem
                      ? 'Update Image'
                      : 'Save Image'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}