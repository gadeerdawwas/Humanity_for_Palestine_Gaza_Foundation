import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  HeartHandshake,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import { AdminLayout } from '../../components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';

interface ServiceItem {
  id: string;
  number: number;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  accent_color: string;
  icon_name: string | null;
  category_slug: string;
  display_order: number;
}

interface ServiceForm {
  number: number;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  accent_color: string;
  icon_name: string;
  category_slug: string;
  display_order: number;
}

const emptyForm: ServiceForm = {
  number: 1,
  title_ar: '',
  title_en: '',
  description_ar: '',
  description_en: '',
  accent_color: '#0C4A2E',
  icon_name: 'heart',
  category_slug: 'general',
  display_order: 0,
};

export function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadServices = async () => {
    setLoading(true);
    setError('');

    const { data, error: loadError } = await supabase
      .from('services')
      .select(
        `
          id,
          number,
          title_ar,
          title_en,
          description_ar,
          description_en,
          accent_color,
          icon_name,
          category_slug,
          display_order
        `
      )
      .order('display_order', { ascending: true })
      .order('number', { ascending: true });

    if (loadError) {
      console.error('LOAD SERVICES ERROR:', loadError);
      setError(loadError.message || 'Failed to load services.');
      setServices([]);
    } else {
      setServices((data as ServiceItem[]) || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadServices();
  }, []);

  const resetForm = () => {
    setEditingService(null);
    setForm(emptyForm);
    setError('');
  };

  const openAddModal = () => {
    resetForm();
    setSuccess('');
    setShowModal(true);
  };

  const openEditModal = (service: ServiceItem) => {
    setEditingService(service);
    setForm({
      number: service.number ?? 1,
      title_ar: service.title_ar || '',
      title_en: service.title_en || '',
      description_ar: service.description_ar || '',
      description_en: service.description_en || '',
      accent_color: service.accent_color || '#0C4A2E',
      icon_name: service.icon_name || 'heart',
      category_slug: service.category_slug || 'general',
      display_order: service.display_order ?? 0,
    });
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
      [name]:
        name === 'number' || name === 'display_order'
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        number: Number(form.number) || 1,
        title_ar: form.title_ar.trim(),
        title_en: form.title_en.trim(),
        description_ar: form.description_ar.trim(),
        description_en: form.description_en.trim(),
        accent_color: form.accent_color || '#0C4A2E',
        icon_name: form.icon_name || 'heart',
        category_slug: form.category_slug.trim() || 'general',
        display_order: Number(form.display_order) || 0,
      };

      if (editingService) {
        const { error: updateError } = await supabase
          .from('services')
          .update(payload)
          .eq('id', editingService.id);

        if (updateError) throw updateError;

        setSuccess('Service updated successfully.');
      } else {
        const { error: insertError } = await supabase
          .from('services')
          .insert(payload);

        if (insertError) throw insertError;

        setSuccess('Service added successfully.');
      }

      await loadServices();
      setShowModal(false);
      resetForm();
    } catch (saveError: any) {
      console.error('SAVE SERVICE ERROR:', saveError);
      setError(
        saveError?.message ||
          'Failed to save service. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (service: ServiceItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${service.title_en}"?`
    );

    if (!confirmed) return;

    setDeletingId(service.id);
    setError('');
    setSuccess('');

    try {
      const { error: deleteError } = await supabase
        .from('services')
        .delete()
        .eq('id', service.id);

      if (deleteError) throw deleteError;

      setServices((previous) =>
        previous.filter((item) => item.id !== service.id)
      );

      setSuccess('Service deleted successfully.');
    } catch (deleteError: any) {
      console.error('DELETE SERVICE ERROR:', deleteError);
      setError(
        deleteError?.message ||
          'Failed to delete service. Please try again.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredServices = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return services;

    return services.filter((service) => {
      return (
        service.title_en?.toLowerCase().includes(term) ||
        service.title_ar?.toLowerCase().includes(term) ||
        service.description_en?.toLowerCase().includes(term) ||
        service.description_ar?.toLowerCase().includes(term)
      );
    });
  }, [services, search]);

  return (
    <AdminLayout title="Services">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Manage Services
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Add, edit and organize the main service areas displayed on the website.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-[#0C4A2E] text-white px-5 py-3 rounded-xl hover:bg-[#083A24] transition"
        >
          <Plus size={18} />
          Add Service
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
              placeholder="Search services..."
              className="w-full border border-gray-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-[#0C4A2E] focus:ring-2 focus:ring-[#0C4A2E]/10"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Loading services...
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#0C4A2E]/10 flex items-center justify-center">
              <HeartHandshake className="text-[#0C4A2E]" size={26} />
            </div>
            <h3 className="font-semibold text-gray-800 mt-4">
              No services found
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Add a service area to display it on the website.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead className="bg-gray-50 text-gray-500 text-sm">
                <tr>
                  <th className="text-left px-6 py-4 font-medium">
                    Service
                  </th>
                  <th className="text-left px-6 py-4 font-medium">
                    Number
                  </th>
                  <th className="text-left px-6 py-4 font-medium">
                    Icon
                  </th>
                  <th className="text-left px-6 py-4 font-medium">
                    Color
                  </th>
                  <th className="text-left px-6 py-4 font-medium">
                    Order
                  </th>
                  <th className="text-right px-6 py-4 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredServices.map((service) => (
                  <tr
                    key={service.id}
                    className="border-t border-gray-100 hover:bg-gray-50/70 transition"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {service.title_en}
                        </p>
                        <p
                          dir="rtl"
                          className="text-xs text-gray-400 mt-1"
                        >
                          {service.title_ar}
                        </p>
                        <p className="text-xs text-gray-400 mt-2 line-clamp-1 max-w-md">
                          {service.description_en}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {service.number}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {service.icon_name || 'heart'}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-7 h-7 rounded-full border"
                          style={{ backgroundColor: service.accent_color }}
                        />
                        <span className="text-xs text-gray-500">
                          {service.accent_color}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {service.display_order}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(service)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                          title="Edit service"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(service)}
                          disabled={deletingId === service.id}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-40"
                          title="Delete service"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#073B2A]">
                  {editingService ? 'Edit Service' : 'Add Service'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {editingService
                    ? 'Update the bilingual service details.'
                    : 'Add a new bilingual service area.'}
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
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E] focus:ring-2 focus:ring-[#0C4A2E]/10"
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
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E] focus:ring-2 focus:ring-[#0C4A2E]/10"
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
                    value={form.description_en}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none resize-none focus:border-[#0C4A2E] focus:ring-2 focus:ring-[#0C4A2E]/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arabic Description
                  </label>
                  <textarea
                    name="description_ar"
                    value={form.description_ar}
                    onChange={handleChange}
                    required
                    rows={5}
                    dir="rtl"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none resize-none focus:border-[#0C4A2E] focus:ring-2 focus:ring-[#0C4A2E]/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Slug
                </label>
                <select
                  name="category_slug"
                  value={form.category_slug}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none bg-white focus:border-[#0C4A2E] focus:ring-2 focus:ring-[#0C4A2E]/10"
                >
                  <option value="women-child">Women & Child</option>
                  <option value="relief">Relief</option>
                  <option value="education">Education</option>
                  <option value="health">Health</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div className="grid md:grid-cols-4 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number
                  </label>
                  <input
                    type="number"
                    name="number"
                    value={form.number}
                    onChange={handleChange}
                    min={1}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E] focus:ring-2 focus:ring-[#0C4A2E]/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon
                  </label>
                  <select
                    name="icon_name"
                    value={form.icon_name}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none bg-white focus:border-[#0C4A2E] focus:ring-2 focus:ring-[#0C4A2E]/10"
                  >
                    <option value="heart">Heart</option>
                    <option value="hands">Hands</option>
                    <option value="book">Book</option>
                    <option value="plus">Plus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accent Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      name="accent_color"
                      value={form.accent_color}
                      onChange={handleChange}
                      className="h-12 w-14 rounded-lg border border-gray-200 p-1 bg-white"
                    />
                    <input
                      name="accent_color"
                      value={form.accent_color}
                      onChange={handleChange}
                      className="min-w-0 flex-1 border border-gray-200 rounded-xl px-3 py-3 outline-none focus:border-[#0C4A2E]"
                    />
                  </div>
                </div>

                <div>
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
                    : editingService
                      ? 'Update Service'
                      : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}