import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';

type ImpactStat = {
  id: string;
  label_ar: string;
  label_en: string;
  value: number;
  suffix: string | null;
  display_order: number;
  enabled: boolean;
};

type ImpactForm = {
  label_ar: string;
  label_en: string;
  value: number;
  suffix: string;
  display_order: number;
  enabled: boolean;
};

const emptyForm: ImpactForm = {
  label_ar: '',
  label_en: '',
  value: 0,
  suffix: '+',
  display_order: 0,
  enabled: true,
};

export function AdminImpactStatsPage() {
  const [stats, setStats] = useState<ImpactStat[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ImpactStat | null>(null);
  const [form, setForm] = useState<ImpactForm>(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadStats = async () => {
    setLoading(true);
    setError('');

    const { data, error: loadError } = await supabase
      .from('impact_stats')
      .select('id,label_ar,label_en,value,suffix,display_order,enabled')
      .order('display_order', { ascending: true });

    if (loadError) {
      console.error('LOAD IMPACT STATS ERROR:', loadError);
      setError(loadError.message || 'Failed to load impact statistics.');
      setStats([]);
    } else {
      setStats((data as ImpactStat[]) || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const openEdit = (stat: ImpactStat) => {
    setEditing(stat);
    setForm({
      label_ar: stat.label_ar || '',
      label_en: stat.label_en || '',
      value: Number(stat.value || 0),
      suffix: stat.suffix || '',
      display_order: Number(stat.display_order || 0),
      enabled: stat.enabled ?? true,
    });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setEditing(null);
    setForm(emptyForm);
    setError('');
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === 'checkbox'
          ? checked
          : name === 'value' || name === 'display_order'
            ? Number(value)
            : value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saving) return;

    if (!form.label_ar.trim() || !form.label_en.trim()) {
      setError('Arabic and English labels are required.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const payload = {
      label_ar: form.label_ar.trim(),
      label_en: form.label_en.trim(),
      value: Number(form.value) || 0,
      suffix: form.suffix.trim() || null,
      display_order: Number(form.display_order) || 0,
      enabled: form.enabled,
    };

    try {
      if (editing) {
        const { error: updateError } = await supabase
          .from('impact_stats')
          .update(payload)
          .eq('id', editing.id);

        if (updateError) throw updateError;

        setSuccess('Impact statistic updated successfully.');
      } else {
        const { error: insertError } = await supabase
          .from('impact_stats')
          .insert(payload);

        if (insertError) throw insertError;

        setSuccess('Impact statistic added successfully.');
      }

      await loadStats();
      setShowModal(false);
      setEditing(null);
      setForm(emptyForm);

      window.setTimeout(() => setSuccess(''), 3000);
    } catch (saveError: any) {
      console.error('SAVE IMPACT STAT ERROR:', saveError);
      setError(saveError?.message || 'Failed to save impact statistic.');
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (stat: ImpactStat) => {
    const nextValue = !stat.enabled;

    const { error: updateError } = await supabase
      .from('impact_stats')
      .update({ enabled: nextValue })
      .eq('id', stat.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setStats((previous) =>
      previous.map((item) =>
        item.id === stat.id ? { ...item, enabled: nextValue } : item
      )
    );
  };

  const handleDelete = async (stat: ImpactStat) => {
    if (!window.confirm(`Delete "${stat.label_en}"?`)) return;

    setDeletingId(stat.id);
    setError('');

    try {
      const { error: deleteError } = await supabase
        .from('impact_stats')
        .delete()
        .eq('id', stat.id);

      if (deleteError) throw deleteError;

      setStats((previous) =>
        previous.filter((item) => item.id !== stat.id)
      );

      setSuccess('Impact statistic deleted successfully.');
      window.setTimeout(() => setSuccess(''), 3000);
    } catch (deleteError: any) {
      setError(deleteError?.message || 'Failed to delete impact statistic.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredStats = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return stats;

    return stats.filter(
      (stat) =>
        stat.label_en.toLowerCase().includes(term) ||
        stat.label_ar.toLowerCase().includes(term)
    );
  }, [stats, search]);

  return (
    <AdminLayout title="Impact Statistics">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Manage Impact Statistics
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage the numbers displayed in the impact section.
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="flex items-center justify-center gap-2 bg-[#0C4A2E] text-white px-5 py-3 rounded-xl hover:bg-[#083A24] transition"
        >
          <Plus size={18} />
          Add Statistic
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
              placeholder="Search impact statistics..."
              className="w-full border border-gray-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-[#0C4A2E] focus:ring-2 focus:ring-[#0C4A2E]/10"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Loading impact statistics...
          </div>
        ) : filteredStats.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#0C4A2E]/10 flex items-center justify-center">
              <BarChart3 className="text-[#0C4A2E]" size={27} />
            </div>
            <h3 className="font-semibold text-gray-800 mt-4">
              No impact statistics found
            </h3>
          </div>
        ) : (
          <div className="p-5 grid md:grid-cols-2 xl:grid-cols-4 gap-5">
            {filteredStats.map((stat) => (
              <article
                key={stat.id}
                className="border border-gray-100 rounded-2xl p-5 bg-white hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <strong className="text-3xl font-bold text-[#0C4A2E]">
                        {Number(stat.value).toLocaleString('en-US')}
                      </strong>
                      {stat.suffix && (
                        <span className="text-xl font-bold text-[#C69A46]">
                          {stat.suffix}
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-gray-400 mt-1 block">
                      Order: {stat.display_order}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleEnabled(stat)}
                    className={`p-2 rounded-lg ${
                      stat.enabled
                        ? 'text-green-700 bg-green-50'
                        : 'text-gray-400 bg-gray-100'
                    }`}
                    title={stat.enabled ? 'Hide' : 'Show'}
                  >
                    {stat.enabled ? <Eye size={17} /> : <EyeOff size={17} />}
                  </button>
                </div>

                <p className="font-semibold text-gray-800 mt-5">
                  {stat.label_en}
                </p>

                <p dir="rtl" className="text-sm text-gray-500 mt-2">
                  {stat.label_ar}
                </p>

                <div className="flex justify-end gap-1 mt-5 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => openEdit(stat)}
                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(stat)}
                    disabled={deletingId === stat.id}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-40"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#073B2A]">
                  {editing ? 'Edit Statistic' : 'Add Statistic'}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    English Label
                  </label>
                  <input
                    name="label_en"
                    value={form.label_en}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arabic Label
                  </label>
                  <input
                    name="label_ar"
                    value={form.label_ar}
                    onChange={handleChange}
                    required
                    dir="rtl"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Value
                  </label>
                  <input
                    type="number"
                    name="value"
                    min={0}
                    value={form.value}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Suffix
                  </label>
                  <input
                    name="suffix"
                    value={form.suffix}
                    onChange={handleChange}
                    placeholder="+"
                    maxLength={5}
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
                    value={form.display_order}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 border border-gray-100 rounded-xl px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="enabled"
                  checked={form.enabled}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Visible on Website
                  </p>
                  <p className="text-xs text-gray-400">
                    Hide it without deleting it.
                  </p>
                </div>
              </label>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-4 text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-5 py-3 rounded-xl border border-gray-200 hover:bg-gray-50"
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
                    : editing
                      ? 'Update Statistic'
                      : 'Save Statistic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}