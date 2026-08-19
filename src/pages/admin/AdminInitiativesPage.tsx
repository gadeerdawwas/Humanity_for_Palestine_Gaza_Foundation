import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  CalendarDays,
  Eye,
  ImagePlus,
  Link2,
  MapPin,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  Upload,
  Users,
  Video,
  X,
} from 'lucide-react';

import { AdminLayout } from '../../components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';

interface Initiative {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  cover_image_url: string | null;
  category: string;
  status: string;
  beneficiaries: number;
  implementation_date: string | null;
  location_ar: string | null;
  location_en: string | null;
  display_order: number;
  featured: boolean;
  created_at?: string;
}

interface InitiativeForm {
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  category: string;
  status: string;
  beneficiaries: number;
  implementation_date: string;
  location_ar: string;
  location_en: string;
  display_order: number;
  featured: boolean;
}

interface InitiativeImage {
  id: string;
  initiative_id: string;
  image_url: string;
  caption_ar: string | null;
  caption_en: string | null;
  display_order: number;
  created_at?: string;
}

interface InitiativeVideo {
  id: string;
  initiative_id: string;
  video_url: string;
  video_type: 'youtube' | 'vimeo' | 'direct';
  title_ar: string | null;
  title_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  thumbnail_url: string | null;
  display_order: number;
  created_at?: string;
}

interface VideoForm {
  video_url: string;
  video_type: 'youtube' | 'vimeo' | 'direct';
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  thumbnail_url: string;
  display_order: number;
}

const emptyVideoForm: VideoForm = {
  video_url: '',
  video_type: 'youtube',
  title_ar: '',
  title_en: '',
  description_ar: '',
  description_en: '',
  thumbnail_url: '',
  display_order: 0,
};

const emptyForm: InitiativeForm = {
  title_ar: '',
  title_en: '',
  description_ar: '',
  description_en: '',
  category: 'relief',
  status: 'ongoing',
  beneficiaries: 0,
  implementation_date: '',
  location_ar: '',
  location_en: '',
  display_order: 0,
  featured: false,
};

function getStoragePathFromPublicUrl(url: string | null) {
  if (!url) return null;

  try {
    const decodedUrl = decodeURIComponent(url);
    const marker = '/initiative-images/';
    const markerIndex = decodedUrl.indexOf(marker);

    if (markerIndex === -1) return null;

    return decodedUrl.slice(markerIndex + marker.length);
  } catch {
    return null;
  }
}

export function AdminInitiativesPage() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingInitiative, setEditingInitiative] =
    useState<Initiative | null>(null);

  const [form, setForm] = useState<InitiativeForm>(emptyForm);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [mediaInitiative, setMediaInitiative] =
    useState<Initiative | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaTab, setMediaTab] = useState<'images' | 'videos'>('images');

  const [mediaImages, setMediaImages] =
    useState<InitiativeImage[]>([]);
  const [mediaVideos, setMediaVideos] =
    useState<InitiativeVideo[]>([]);

  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaSaving, setMediaSaving] = useState(false);

  const [videoForm, setVideoForm] =
    useState<VideoForm>(emptyVideoForm);

  const loadInitiatives = async () => {
    setLoading(true);
    setError('');

    const { data, error: loadError } = await supabase
      .from('initiatives')
      .select(
        `
          id,
          title_ar,
          title_en,
          description_ar,
          description_en,
          cover_image_url,
          category,
          status,
          beneficiaries,
          implementation_date,
          location_ar,
          location_en,
          display_order,
          featured,
          created_at
        `
      )
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (loadError) {
      console.error('LOAD INITIATIVES ERROR:', loadError);
      setError(loadError.message || 'Failed to load initiatives.');
      setInitiatives([]);
    } else {
      setInitiatives((data as Initiative[]) || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadInitiatives();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const resetForm = () => {
    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    setEditingInitiative(null);
    setForm(emptyForm);
    setImage(null);
    setImagePreview('');
    setError('');
  };

  const openAddModal = () => {
    resetForm();
    setSuccess('');
    setShowModal(true);
  };

  const openEditModal = (initiative: Initiative) => {
    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    setEditingInitiative(initiative);

    setForm({
      title_ar: initiative.title_ar || '',
      title_en: initiative.title_en || '',
      description_ar: initiative.description_ar || '',
      description_en: initiative.description_en || '',
      category: initiative.category || 'relief',
      status: initiative.status || 'ongoing',
      beneficiaries: initiative.beneficiaries ?? 0,
      implementation_date: initiative.implementation_date || '',
      location_ar: initiative.location_ar || '',
      location_en: initiative.location_en || '',
      display_order: initiative.display_order ?? 0,
      featured: initiative.featured ?? false,
    });

    setImage(null);
    setImagePreview(initiative.cover_image_url || '');
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
    const { name, value, type } = event.target;

    if (type === 'checkbox') {
      const target = event.target as HTMLInputElement;

      setForm((previous) => ({
        ...previous,
        [name]: target.checked,
      }));

      return;
    }

    setForm((previous) => ({
      ...previous,
      [name]:
        name === 'beneficiaries' || name === 'display_order'
          ? Number(value)
          : value,
    }));
  };

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError(
        'Please upload a JPG, PNG, or WEBP image.'
      );
      event.target.value = '';
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5 MB.');
      event.target.value = '';
      return;
    }

    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(selectedFile);
    setImagePreview(
      URL.createObjectURL(selectedFile)
    );
    setError('');
  };

  const uploadImage = async (file: File) => {
    const extension =
      file.name.split('.').pop()?.toLowerCase() || 'jpg';

    const filePath = `initiatives/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } =
      await supabase.storage
        .from('initiative-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('initiative-images')
      .getPublicUrl(filePath);

    if (!data.publicUrl) {
      throw new Error(
        'Could not create a public URL for the initiative image.'
      );
    }

    return {
      publicUrl: data.publicUrl,
      filePath,
    };
  };

  const deleteStorageImage = async (
    url: string | null
  ) => {
    const path = getStoragePathFromPublicUrl(url);

    if (!path) return;

    const { error: removeError } =
      await supabase.storage
        .from('initiative-images')
        .remove([path]);

    if (removeError) {
      console.warn(
        'REMOVE INITIATIVE IMAGE ERROR:',
        removeError
      );
    }
  };

  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError('');
    setSuccess('');

    let uploadedNewImagePath: string | null = null;

    try {
      let coverImageUrl =
        editingInitiative?.cover_image_url || null;

      if (image) {
        const uploaded = await uploadImage(image);
        coverImageUrl = uploaded.publicUrl;
        uploadedNewImagePath = uploaded.filePath;
      }

      const initiativeData = {
        title_ar: form.title_ar.trim(),
        title_en: form.title_en.trim(),
        description_ar: form.description_ar.trim(),
        description_en: form.description_en.trim(),
        cover_image_url: coverImageUrl,
        category: form.category,
        status: form.status,
        beneficiaries:
          Number(form.beneficiaries) || 0,
        implementation_date:
          form.implementation_date || null,
        location_ar:
          form.location_ar.trim() || null,
        location_en:
          form.location_en.trim() || null,
        display_order:
          Number(form.display_order) || 0,
        featured: form.featured,
      };

      if (editingInitiative) {
        const oldImageUrl =
          editingInitiative.cover_image_url;

        const { error: updateError } =
          await supabase
            .from('initiatives')
            .update(initiativeData)
            .eq('id', editingInitiative.id);

        if (updateError) throw updateError;

        if (
          image &&
          oldImageUrl &&
          oldImageUrl !== coverImageUrl
        ) {
          await deleteStorageImage(oldImageUrl);
        }

        setSuccess(
          'Initiative updated successfully.'
        );
      } else {
        const { error: insertError } =
          await supabase
            .from('initiatives')
            .insert(initiativeData);

        if (insertError) throw insertError;

        setSuccess(
          'Initiative added successfully.'
        );
      }

      await loadInitiatives();
      setShowModal(false);
      resetForm();
    } catch (saveError: any) {
      console.error(
        'INITIATIVE SAVE ERROR:',
        saveError
      );

      if (uploadedNewImagePath) {
        await supabase.storage
          .from('initiative-images')
          .remove([uploadedNewImagePath]);
      }

      setError(
        saveError?.message ||
          'Failed to save initiative.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    initiative: Initiative
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${initiative.title_en}"?`
    );

    if (!confirmed) return;

    setDeletingId(initiative.id);
    setError('');
    setSuccess('');

    try {
      const { error: deleteError } =
        await supabase
          .from('initiatives')
          .delete()
          .eq('id', initiative.id);

      if (deleteError) throw deleteError;

      await deleteStorageImage(
        initiative.cover_image_url
      );

      setInitiatives((previous) =>
        previous.filter(
          (item) => item.id !== initiative.id
        )
      );

      setSuccess(
        'Initiative deleted successfully.'
      );
    } catch (deleteError: any) {
      console.error(
        'DELETE INITIATIVE ERROR:',
        deleteError
      );

      setError(
        deleteError?.message ||
          'Failed to delete initiative.'
      );
    } finally {
      setDeletingId(null);
    }
  };


  const loadInitiativeMedia = async (initiativeId: string) => {
    setMediaLoading(true);
    setError('');

    const [imagesResult, videosResult] = await Promise.all([
      supabase
        .from('initiative_images')
        .select('*')
        .eq('initiative_id', initiativeId)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true }),

      supabase
        .from('initiative_videos')
        .select('*')
        .eq('initiative_id', initiativeId)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true }),
    ]);

    if (imagesResult.error) {
      console.error('LOAD INITIATIVE IMAGES ERROR:', imagesResult.error);
      setError(imagesResult.error.message);
      setMediaImages([]);
    } else {
      setMediaImages((imagesResult.data as InitiativeImage[]) || []);
    }

    if (videosResult.error) {
      console.error('LOAD INITIATIVE VIDEOS ERROR:', videosResult.error);
      setError(videosResult.error.message);
      setMediaVideos([]);
    } else {
      setMediaVideos((videosResult.data as InitiativeVideo[]) || []);
    }

    setMediaLoading(false);
  };

  const openMediaModal = async (initiative: Initiative) => {
    setMediaInitiative(initiative);
    setMediaTab('images');
    setVideoForm(emptyVideoForm);
    setError('');
    setSuccess('');
    setShowMediaModal(true);
    await loadInitiativeMedia(initiative.id);
  };

  const closeMediaModal = () => {
    if (mediaSaving) return;

    setShowMediaModal(false);
    setMediaInitiative(null);
    setMediaImages([]);
    setMediaVideos([]);
    setVideoForm(emptyVideoForm);
    setError('');
  };

  const handleGalleryImagesUpload = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';

    if (!mediaInitiative || files.length === 0 || mediaSaving) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    const invalid = files.find(
      (file) =>
        !allowedTypes.includes(file.type) ||
        file.size > 5 * 1024 * 1024
    );

    if (invalid) {
      setError('Each image must be JPG, PNG or WEBP and smaller than 5 MB.');
      return;
    }

    setMediaSaving(true);
    setError('');

    const uploadedPaths: string[] = [];

    try {
      const startOrder = mediaImages.length;

      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const extension =
          file.name.split('.').pop()?.toLowerCase() || 'jpg';

        const filePath =
          `gallery/${mediaInitiative.id}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from('initiative-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        uploadedPaths.push(filePath);

        const { data: publicData } = supabase.storage
          .from('initiative-images')
          .getPublicUrl(filePath);

        const { error: insertError } = await supabase
          .from('initiative_images')
          .insert({
            initiative_id: mediaInitiative.id,
            image_url: publicData.publicUrl,
            caption_ar: null,
            caption_en: null,
            display_order: startOrder + index,
          });

        if (insertError) throw insertError;
      }

      await loadInitiativeMedia(mediaInitiative.id);
      setSuccess('Initiative images uploaded successfully.');
      window.setTimeout(() => setSuccess(''), 3000);
    } catch (uploadError: any) {
      console.error('UPLOAD INITIATIVE GALLERY ERROR:', uploadError);

      if (uploadedPaths.length > 0) {
        await supabase.storage
          .from('initiative-images')
          .remove(uploadedPaths);
      }

      setError(
        uploadError?.message ||
          'Failed to upload initiative images.'
      );
    } finally {
      setMediaSaving(false);
    }
  };

  const deleteInitiativeGalleryImage = async (
    imageItem: InitiativeImage
  ) => {
    if (!mediaInitiative || mediaSaving) return;

    const confirmed = window.confirm('Delete this initiative image?');
    if (!confirmed) return;

    setMediaSaving(true);
    setError('');

    try {
      const { error: deleteError } = await supabase
        .from('initiative_images')
        .delete()
        .eq('id', imageItem.id);

      if (deleteError) throw deleteError;

      await deleteStorageImage(imageItem.image_url);

      setMediaImages((previous) =>
        previous.filter((item) => item.id !== imageItem.id)
      );
    } catch (deleteError: any) {
      console.error('DELETE INITIATIVE GALLERY IMAGE ERROR:', deleteError);
      setError(
        deleteError?.message ||
          'Failed to delete initiative image.'
      );
    } finally {
      setMediaSaving(false);
    }
  };

  const updateImageCaption = async (
    imageItem: InitiativeImage,
    key: 'caption_ar' | 'caption_en',
    value: string
  ) => {
    const { error: updateError } = await supabase
      .from('initiative_images')
      .update({ [key]: value.trim() || null })
      .eq('id', imageItem.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMediaImages((previous) =>
      previous.map((item) =>
        item.id === imageItem.id
          ? { ...item, [key]: value.trim() || null }
          : item
      )
    );
  };

  const handleVideoFormChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setVideoForm((previous) => ({
      ...previous,
      [name]:
        name === 'display_order'
          ? Number(value)
          : value,
    }));
  };

  const addInitiativeVideo = async () => {
    if (!mediaInitiative || mediaSaving) return;

    if (!videoForm.video_url.trim()) {
      setError('Video URL is required.');
      return;
    }

    setMediaSaving(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('initiative_videos')
        .insert({
          initiative_id: mediaInitiative.id,
          video_url: videoForm.video_url.trim(),
          video_type: videoForm.video_type,
          title_ar: videoForm.title_ar.trim() || null,
          title_en: videoForm.title_en.trim() || null,
          description_ar:
            videoForm.description_ar.trim() || null,
          description_en:
            videoForm.description_en.trim() || null,
          thumbnail_url:
            videoForm.thumbnail_url.trim() || null,
          display_order:
            Number(videoForm.display_order) || 0,
        });

      if (insertError) throw insertError;

      setVideoForm(emptyVideoForm);
      await loadInitiativeMedia(mediaInitiative.id);
      setSuccess('Initiative video added successfully.');
      window.setTimeout(() => setSuccess(''), 3000);
    } catch (insertError: any) {
      console.error('ADD INITIATIVE VIDEO ERROR:', insertError);
      setError(
        insertError?.message ||
          'Failed to add initiative video.'
      );
    } finally {
      setMediaSaving(false);
    }
  };

  const deleteInitiativeVideo = async (
    videoItem: InitiativeVideo
  ) => {
    if (mediaSaving) return;

    const confirmed = window.confirm('Delete this initiative video?');
    if (!confirmed) return;

    setMediaSaving(true);
    setError('');

    try {
      const { error: deleteError } = await supabase
        .from('initiative_videos')
        .delete()
        .eq('id', videoItem.id);

      if (deleteError) throw deleteError;

      setMediaVideos((previous) =>
        previous.filter((item) => item.id !== videoItem.id)
      );
    } catch (deleteError: any) {
      console.error('DELETE INITIATIVE VIDEO ERROR:', deleteError);
      setError(
        deleteError?.message ||
          'Failed to delete initiative video.'
      );
    } finally {
      setMediaSaving(false);
    }
  };

  const filteredInitiatives = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return initiatives;

    return initiatives.filter((initiative) => {
      return (
        initiative.title_en
          ?.toLowerCase()
          .includes(term) ||
        initiative.title_ar
          ?.toLowerCase()
          .includes(term) ||
        initiative.category
          ?.toLowerCase()
          .includes(term) ||
        initiative.status
          ?.toLowerCase()
          .includes(term)
      );
    });
  }, [initiatives, search]);

  const formatDate = (value: string | null) => {
    if (!value) return 'No date';

    return new Intl.DateTimeFormat('en', {
      dateStyle: 'medium',
    }).format(new Date(value));
  };

  return (
    <AdminLayout title="Initiatives">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Manage Initiatives
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Manage ongoing and completed humanitarian initiatives.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-[#0C4A2E] text-white px-5 py-3 rounded-xl hover:bg-[#083A24] transition"
        >
          <Plus size={18} />
          Add Initiative
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
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search initiatives..."
              className="w-full border border-gray-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-[#0C4A2E] focus:ring-2 focus:ring-[#0C4A2E]/10"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Loading initiatives...
          </div>
        ) : filteredInitiatives.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#0C4A2E]/10 flex items-center justify-center">
              <Star
                className="text-[#0C4A2E]"
                size={26}
              />
            </div>

            <h3 className="font-semibold text-gray-800 mt-4">
              No initiatives found
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Add your first initiative to start documenting your work.
            </p>
          </div>
        ) : (
          <div className="p-5 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredInitiatives.map(
              (initiative) => (
                <article
                  key={initiative.id}
                  className="border border-gray-100 rounded-2xl overflow-hidden bg-white hover:shadow-md transition"
                >
                  <div className="aspect-[16/10] bg-gray-100 overflow-hidden relative">
                    {initiative.cover_image_url ? (
                      <img
                        src={
                          initiative.cover_image_url
                        }
                        alt={initiative.title_en}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}

                    {initiative.featured && (
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-[#0C4A2E] text-white text-xs px-3 py-1 rounded-full">
                        <Star size={12} />
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-800 truncate">
                          {initiative.title_en}
                        </h3>

                        <p
                          dir="rtl"
                          className="text-xs text-gray-400 mt-1 truncate"
                        >
                          {initiative.title_ar}
                        </p>
                      </div>

                      <span
                        className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
                          initiative.status ===
                          'ongoing'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {initiative.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mt-4 line-clamp-2">
                      {initiative.description_en}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-5">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Users size={15} />
                        {initiative.beneficiaries || 0}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <CalendarDays size={15} />
                        {formatDate(
                          initiative.implementation_date
                        )}
                      </div>

                      <div className="col-span-2 flex items-center gap-2 text-xs text-gray-500">
                        <MapPin size={15} />
                        {initiative.location_en ||
                          'No location'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-400 capitalize">
                        {initiative.category.replace(
                          '_',
                          ' '
                        )}
                      </span>

                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            openMediaModal(initiative)
                          }
                          className="p-2 rounded-lg text-[#0C4A2E] hover:bg-green-50"
                          title="Manage photos & videos"
                        >
                          <ImagePlus size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(
                              initiative
                            )
                          }
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                          title="Edit initiative"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              initiative
                            )
                          }
                          disabled={
                            deletingId ===
                            initiative.id
                          }
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-40"
                          title="Delete initiative"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#073B2A]">
                  {editingInitiative
                    ? 'Edit Initiative'
                    : 'Add Initiative'}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Add bilingual initiative details and implementation information.
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

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    English Title
                  </label>

                  <input
                    name="title_en"
                    value={form.title_en}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arabic Title
                  </label>

                  <input
                    name="title_ar"
                    value={form.title_ar}
                    onChange={handleChange}
                    required
                    dir="rtl"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    English Description
                  </label>

                  <textarea
                    name="description_en"
                    value={
                      form.description_en
                    }
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none resize-none focus:border-[#0C4A2E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arabic Description
                  </label>

                  <textarea
                    name="description_ar"
                    value={
                      form.description_ar
                    }
                    onChange={handleChange}
                    required
                    rows={5}
                    dir="rtl"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none resize-none focus:border-[#0C4A2E]"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white outline-none focus:border-[#0C4A2E]"
                  >
                    <option value="relief">
                      Relief
                    </option>
                    <option value="education">
                      Education
                    </option>
                    <option value="health">
                      Health
                    </option>
                    <option value="women_child">
                      Women & Child
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white outline-none focus:border-[#0C4A2E]"
                  >
                    <option value="ongoing">
                      Ongoing
                    </option>
                    <option value="completed">
                      Completed
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beneficiaries
                  </label>

                  <input
                    type="number"
                    name="beneficiaries"
                    min={0}
                    value={
                      form.beneficiaries
                    }
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>

                  <input
                    type="number"
                    name="display_order"
                    min={0}
                    value={
                      form.display_order
                    }
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Implementation Date
                  </label>

                  <input
                    type="date"
                    name="implementation_date"
                    value={
                      form.implementation_date
                    }
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    English Location
                  </label>

                  <input
                    name="location_en"
                    value={form.location_en}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arabic Location
                  </label>

                  <input
                    name="location_ar"
                    value={form.location_ar}
                    onChange={handleChange}
                    dir="rtl"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 border border-gray-100 rounded-xl px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={form.featured}
                  onChange={handleChange}
                  className="w-4 h-4"
                />

                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Featured Initiative
                  </p>

                  <p className="text-xs text-gray-400">
                    Highlight this initiative on the website.
                  </p>
                </div>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image
                </label>

                <label className="border-2 border-dashed border-gray-200 rounded-2xl min-h-52 flex items-center justify-center cursor-pointer hover:border-[#0C4A2E] transition overflow-hidden bg-gray-50/40">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Initiative preview"
                      className="w-full max-h-80 object-cover"
                    />
                  ) : (
                    <div className="text-center p-8">
                      <Upload
                        size={30}
                        className="mx-auto text-[#073B2A]"
                      />

                      <p className="font-medium text-gray-700 mt-3">
                        Upload initiative cover
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        JPG, PNG or WEBP · Maximum 5 MB
                      </p>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={
                      handleImageChange
                    }
                    className="hidden"
                  />
                </label>

                {editingInitiative &&
                  !image &&
                  editingInitiative.cover_image_url && (
                    <p className="text-xs text-gray-400 mt-2">
                      The current image will stay unchanged unless you select a new one.
                    </p>
                  )}
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
                    : editingInitiative
                      ? 'Update Initiative'
                      : 'Save Initiative'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMediaModal && mediaInitiative && (
        <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#073B2A]">
                  Initiative Media
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {mediaInitiative.title_en}
                </p>
              </div>

              <button
                type="button"
                onClick={closeMediaModal}
                disabled={mediaSaving}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 pt-5">
              <div className="inline-flex bg-gray-100 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setMediaTab('images')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                    mediaTab === 'images'
                      ? 'bg-white text-[#0C4A2E] shadow-sm'
                      : 'text-gray-500'
                  }`}
                >
                  <ImagePlus size={17} />
                  Photos ({mediaImages.length})
                </button>

                <button
                  type="button"
                  onClick={() => setMediaTab('videos')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                    mediaTab === 'videos'
                      ? 'bg-white text-[#0C4A2E] shadow-sm'
                      : 'text-gray-500'
                  }`}
                >
                  <Video size={17} />
                  Videos ({mediaVideos.length})
                </button>
              </div>
            </div>

            <div className="p-6">
              {success && (
                <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {success}
                </div>
              )}

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {mediaLoading ? (
                <div className="py-16 text-center text-gray-500">
                  Loading media...
                </div>
              ) : mediaTab === 'images' ? (
                <div>
                  <label className="border-2 border-dashed border-gray-200 rounded-2xl min-h-36 flex items-center justify-center cursor-pointer hover:border-[#0C4A2E] transition bg-gray-50/50">
                    <div className="text-center p-6">
                      <Upload
                        size={28}
                        className="mx-auto text-[#0C4A2E]"
                      />
                      <p className="font-medium text-gray-700 mt-3">
                        Upload initiative photos
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        You can select multiple JPG, PNG or WEBP images · Max 5 MB each
                      </p>
                    </div>

                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleGalleryImagesUpload}
                      disabled={mediaSaving}
                      className="hidden"
                    />
                  </label>

                  {mediaImages.length === 0 ? (
                    <div className="py-12 text-center text-gray-400">
                      No additional initiative photos yet.
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
                      {mediaImages.map((imageItem) => (
                        <article
                          key={imageItem.id}
                          className="border border-gray-100 rounded-2xl overflow-hidden"
                        >
                          <div className="aspect-[4/3] bg-gray-100">
                            <img
                              src={imageItem.image_url}
                              alt="Initiative"
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="p-4 space-y-3">
                            <input
                              defaultValue={imageItem.caption_en || ''}
                              onBlur={(event) =>
                                updateImageCaption(
                                  imageItem,
                                  'caption_en',
                                  event.target.value
                                )
                              }
                              placeholder="English caption"
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0C4A2E]"
                            />

                            <input
                              defaultValue={imageItem.caption_ar || ''}
                              onBlur={(event) =>
                                updateImageCaption(
                                  imageItem,
                                  'caption_ar',
                                  event.target.value
                                )
                              }
                              placeholder="وصف الصورة بالعربية"
                              dir="rtl"
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0C4A2E]"
                            />

                            <button
                              type="button"
                              disabled={mediaSaving}
                              onClick={() =>
                                deleteInitiativeGalleryImage(imageItem)
                              }
                              className="w-full flex items-center justify-center gap-2 text-sm text-red-500 border border-red-100 rounded-lg px-3 py-2 hover:bg-red-50 disabled:opacity-40"
                            >
                              <Trash2 size={15} />
                              Delete Photo
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="border border-gray-100 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-5">
                      <Link2 size={18} className="text-[#0C4A2E]" />
                      <h4 className="font-semibold text-gray-800">
                        Add Video
                      </h4>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Video Type
                        </label>
                        <select
                          name="video_type"
                          value={videoForm.video_type}
                          onChange={handleVideoFormChange}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white outline-none focus:border-[#0C4A2E]"
                        >
                          <option value="youtube">YouTube</option>
                          <option value="vimeo">Vimeo</option>
                          <option value="direct">Direct Video URL</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Video URL
                        </label>
                        <input
                          type="url"
                          name="video_url"
                          value={videoForm.video_url}
                          onChange={handleVideoFormChange}
                          placeholder="https://..."
                          dir="ltr"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          English Title
                        </label>
                        <input
                          name="title_en"
                          value={videoForm.title_en}
                          onChange={handleVideoFormChange}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Arabic Title
                        </label>
                        <input
                          name="title_ar"
                          value={videoForm.title_ar}
                          onChange={handleVideoFormChange}
                          dir="rtl"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          English Description
                        </label>
                        <textarea
                          name="description_en"
                          value={videoForm.description_en}
                          onChange={handleVideoFormChange}
                          rows={3}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none resize-none focus:border-[#0C4A2E]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Arabic Description
                        </label>
                        <textarea
                          name="description_ar"
                          value={videoForm.description_ar}
                          onChange={handleVideoFormChange}
                          rows={3}
                          dir="rtl"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none resize-none focus:border-[#0C4A2E]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Thumbnail URL (optional)
                        </label>
                        <input
                          type="url"
                          name="thumbnail_url"
                          value={videoForm.thumbnail_url}
                          onChange={handleVideoFormChange}
                          placeholder="https://..."
                          dir="ltr"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Display Order
                        </label>
                        <input
                          type="number"
                          name="display_order"
                          min={0}
                          value={videoForm.display_order}
                          onChange={handleVideoFormChange}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end mt-5">
                      <button
                        type="button"
                        onClick={addInitiativeVideo}
                        disabled={mediaSaving}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0C4A2E] text-white font-medium hover:bg-[#083A24] disabled:opacity-50"
                      >
                        <Plus size={17} />
                        {mediaSaving ? 'Saving...' : 'Add Video'}
                      </button>
                    </div>
                  </div>

                  {mediaVideos.length === 0 ? (
                    <div className="py-10 text-center text-gray-400">
                      No initiative videos yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {mediaVideos.map((videoItem) => (
                        <div
                          key={videoItem.id}
                          className="border border-gray-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Video size={16} className="text-[#0C4A2E]" />
                              <span className="text-xs uppercase font-semibold text-[#0C4A2E]">
                                {videoItem.video_type}
                              </span>
                            </div>

                            <p className="font-medium text-gray-800 mt-2">
                              {videoItem.title_en ||
                                videoItem.title_ar ||
                                'Untitled video'}
                            </p>

                            <p className="text-xs text-gray-400 mt-1 truncate max-w-2xl">
                              {videoItem.video_url}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              deleteInitiativeVideo(videoItem)
                            }
                            disabled={mediaSaving}
                            className="flex items-center justify-center gap-2 text-sm text-red-500 border border-red-100 rounded-lg px-4 py-2 hover:bg-red-50 disabled:opacity-40"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}