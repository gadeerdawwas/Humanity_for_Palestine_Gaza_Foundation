import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from 'react';

import {
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';

type Partner = {
  id: string;
  type: 'organization' | 'person';

  name_ar: string | null;
  name_en: string | null;

  role_ar: string | null;
  role_en: string | null;

  image_url: string;

  website_url: string | null;

  display_order: number;
  enabled: boolean;
};

type PartnerForm = {
  type: 'organization' | 'person';

  name_ar: string;
  name_en: string;

  role_ar: string;
  role_en: string;

  image_url: string;
  website_url: string;

  display_order: number;
  enabled: boolean;
};

const emptyForm: PartnerForm = {
  type: 'organization',

  name_ar: '',
  name_en: '',

  role_ar: '',
  role_en: '',

  image_url: '',
  website_url: '',

  display_order: 0,
  enabled: true,
};

export function AdminPartnersPage() {
  const [partners, setPartners] =
    useState<Partner[]>([]);

  const [form, setForm] =
    useState<PartnerForm>(emptyForm);

  const [editing, setEditing] =
    useState<Partner | null>(null);

  const [showModal, setShowModal] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

  const loadPartners = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('display_order', {
        ascending: true,
      });

    if (error) {
      console.error(
        'LOAD PARTNERS ERROR:',
        error
      );

      setError(error.message);
      setPartners([]);
    } else {
      setPartners(
        (data as Partner[]) || []
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    loadPartners();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  };

  const openEdit = (
    partner: Partner
  ) => {
    setEditing(partner);

    setForm({
      type: partner.type,

      name_ar:
        partner.name_ar || '',

      name_en:
        partner.name_en || '',

      role_ar:
        partner.role_ar || '',

      role_en:
        partner.role_en || '',

      image_url:
        partner.image_url || '',

      website_url:
        partner.website_url || '',

      display_order:
        Number(
          partner.display_order || 0
        ),

      enabled:
        partner.enabled ?? true,
    });

    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving || uploading) return;

    setShowModal(false);
    setEditing(null);
    setForm(emptyForm);
    setError('');
  };

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement
    >
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target as HTMLInputElement;

    setForm((previous) => ({
      ...previous,

      [name]:
        type === 'checkbox'
          ? checked
          : name === 'display_order'
            ? Number(value)
            : value,
    }));
  };

  const handleImageUpload = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    event.target.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(
        'Please select a valid image.'
      );
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        'Partner image must be smaller than 5 MB.'
      );
      return;
    }

    setUploading(true);
    setError('');

    try {
      const extension =
        file.name
          .split('.')
          .pop()
          ?.toLowerCase() || 'png';

      const path =
        `partners/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } =
        await supabase.storage
          .from('hero-images')
          .upload(path, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type,
          });

      if (uploadError) {
        throw uploadError;
      }

      const { data } =
        supabase.storage
          .from('hero-images')
          .getPublicUrl(path);

      setForm((previous) => ({
        ...previous,
        image_url:
          data.publicUrl,
      }));
    } catch (uploadError: any) {
      console.error(
        'UPLOAD PARTNER IMAGE ERROR:',
        uploadError
      );

      setError(
        uploadError?.message ||
          'Failed to upload image.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (saving) return;

    if (!form.image_url) {
      setError(
        'Partner image or logo is required.'
      );
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const payload = {
      type: form.type,

      name_ar:
        form.name_ar.trim() ||
        null,

      name_en:
        form.name_en.trim() ||
        null,

      role_ar:
        form.role_ar.trim() ||
        null,

      role_en:
        form.role_en.trim() ||
        null,

      image_url:
        form.image_url,

      website_url:
        form.website_url.trim() ||
        null,

      display_order:
        Number(
          form.display_order
        ) || 0,

      enabled:
        form.enabled,
    };

    try {
      if (editing) {
        const { error } = await supabase
          .from('partners')
          .update(payload)
          .eq('id', editing.id);

        if (error) throw error;

        setSuccess(
          'Partner updated successfully.'
        );
      } else {
        const { error } = await supabase
          .from('partners')
          .insert(payload);

        if (error) throw error;

        setSuccess(
          'Partner added successfully.'
        );
      }

      await loadPartners();

      setShowModal(false);
      setEditing(null);
      setForm(emptyForm);

      window.setTimeout(
        () => setSuccess(''),
        3000
      );
    } catch (saveError: any) {
      setError(
        saveError?.message ||
          'Failed to save partner.'
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (
    partner: Partner
  ) => {
    const next =
      !partner.enabled;

    const { error } =
      await supabase
        .from('partners')
        .update({
          enabled: next,
        })
        .eq('id', partner.id);

    if (error) {
      setError(error.message);
      return;
    }

    setPartners(
      (previous) =>
        previous.map(
          (item) =>
            item.id ===
            partner.id
              ? {
                  ...item,
                  enabled: next,
                }
              : item
        )
    );
  };

  const deletePartner = async (
    partner: Partner
  ) => {
    if (
      !window.confirm(
        'Delete this partner?'
      )
    ) {
      return;
    }

    const { error } =
      await supabase
        .from('partners')
        .delete()
        .eq('id', partner.id);

    if (error) {
      setError(error.message);
      return;
    }

    setPartners(
      (previous) =>
        previous.filter(
          (item) =>
            item.id !== partner.id
        )
    );
  };

  return (
    <AdminLayout title="Partners">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Partners
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Manage partner organizations and individual supporters.
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0C4A2E] text-white"
        >
          <Plus size={18} />
          Add Partner
        </button>
      </div>

      {success && (
        <div className="mb-5 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          {success}
        </div>
      )}

      {error && !showModal && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-500">
          Loading partners...
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {partners.map(
            (partner) => (
              <article
                key={partner.id}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
              >
                <div className="h-32 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden">
                  <img
                    src={
                      partner.image_url
                    }
                    alt={
                      partner.name_en ||
                      'Partner'
                    }
                    className={
                      partner.type ===
                      'organization'
                        ? 'max-w-[80%] max-h-24 object-contain'
                        : 'w-24 h-24 rounded-full object-cover'
                    }
                  />
                </div>

                <div className="mt-4">
                  <span className="text-xs uppercase text-[#0C4A2E] font-semibold">
                    {partner.type}
                  </span>

                  <h3 className="font-semibold text-gray-800 mt-2">
                    {partner.name_en ||
                      partner.name_ar ||
                      'Unnamed Partner'}
                  </h3>

                  {partner.role_en && (
                    <p className="text-sm text-gray-500 mt-1">
                      {
                        partner.role_en
                      }
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-1 mt-5 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() =>
                      toggleEnabled(
                        partner
                      )
                    }
                    className={`p-2 rounded-lg ${
                      partner.enabled
                        ? 'text-green-700 bg-green-50'
                        : 'text-gray-400 bg-gray-100'
                    }`}
                  >
                    {partner.enabled ? (
                      <Eye size={17} />
                    ) : (
                      <EyeOff
                        size={17}
                      />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openEdit(
                        partner
                      )
                    }
                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deletePartner(
                        partner
                      )
                    }
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            )
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">

            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#073B2A]">
                {editing
                  ? 'Edit Partner'
                  : 'Add Partner'}
              </h3>

              <button
                type="button"
                onClick={
                  closeModal
                }
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="p-6 space-y-5"
            >

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partner Type
                </label>

                <select
                  name="type"
                  value={form.type}
                  onChange={
                    handleChange
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white outline-none focus:border-[#0C4A2E]"
                >
                  <option value="organization">
                    Organization
                  </option>

                  <option value="person">
                    Person
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image / Logo
                </label>

                {form.image_url && (
                  <div className="h-40 rounded-xl bg-gray-50 flex items-center justify-center mb-3 overflow-hidden">
                    <img
                      src={
                        form.image_url
                      }
                      alt="Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}

                <label
                  className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0C4A2E] text-white cursor-pointer ${
                    uploading
                      ? 'opacity-50 pointer-events-none'
                      : ''
                  }`}
                >
                  <Upload
                    size={17}
                  />

                  {uploading
                    ? 'Uploading...'
                    : 'Upload Image'}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={
                      handleImageUpload
                    }
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    English Name
                  </label>

                  <input
                    name="name_en"
                    value={
                      form.name_en
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arabic Name
                  </label>

                  <input
                    name="name_ar"
                    value={
                      form.name_ar
                    }
                    onChange={
                      handleChange
                    }
                    dir="rtl"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    English Role
                  </label>

                  <input
                    name="role_en"
                    value={
                      form.role_en
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arabic Role
                  </label>

                  <input
                    name="role_ar"
                    value={
                      form.role_ar
                    }
                    onChange={
                      handleChange
                    }
                    dir="rtl"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website / Profile URL
                </label>

                <input
                  type="url"
                  name="website_url"
                  value={
                    form.website_url
                  }
                  onChange={
                    handleChange
                  }
                  dir="ltr"
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
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
                    onChange={
                      handleChange
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3"
                  />
                </div>

                <label className="flex items-center gap-3 mt-7">
                  <input
                    type="checkbox"
                    name="enabled"
                    checked={
                      form.enabled
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <span className="text-sm font-medium text-gray-700">
                    Visible on Website
                  </span>
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-4 text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  className="px-5 py-3 rounded-xl border border-gray-200"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    uploading
                  }
                  className="px-6 py-3 rounded-xl bg-[#0C4A2E] text-white font-medium disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : editing
                      ? 'Update Partner'
                      : 'Save Partner'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </AdminLayout>
  );
}