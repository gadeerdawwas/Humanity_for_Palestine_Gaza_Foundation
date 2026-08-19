import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  CalendarDays,
  DollarSign,
  Eye,
  MapPin,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';

import { AdminLayout } from '../../components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';

interface Project {
  id: string;
  title_en: string;
  title_ar: string;
  short_description_en: string | null;
  short_description_ar: string | null;
  description_en: string;
  description_ar: string;
  category: string | null;
  status: string;
  cover_image_url: string | null;
  location_en: string | null;
  location_ar: string | null;
  funding_goal: number;
  amount_raised: number;
  currency: string;
  expected_beneficiaries: number;
  donation_url: string | null;
  donation_enabled: boolean;
  start_date: string | null;
  target_date: string | null;
  featured: boolean;
  display_order: number;
  created_at?: string;
}

interface ProjectForm {
  title_en: string;
  title_ar: string;
  short_description_en: string;
  short_description_ar: string;
  description_en: string;
  description_ar: string;
  category: string;
  status: string;
  location_en: string;
  location_ar: string;
  funding_goal: number;
  amount_raised: number;
  currency: string;
  expected_beneficiaries: number;
  donation_url: string;
  donation_enabled: boolean;
  start_date: string;
  target_date: string;
  featured: boolean;
  display_order: number;
}

const emptyForm: ProjectForm = {
  title_en: '',
  title_ar: '',
  short_description_en: '',
  short_description_ar: '',
  description_en: '',
  description_ar: '',
  category: 'education',
  status: 'planned',
  location_en: '',
  location_ar: '',
  funding_goal: 0,
  amount_raised: 0,
  currency: 'USD',
  expected_beneficiaries: 0,
  donation_url: '',
  donation_enabled: true,
  start_date: '',
  target_date: '',
  featured: false,
  display_order: 0,
};

function getStoragePathFromPublicUrl(url: string | null) {
  if (!url) return null;

  try {
    const decodedUrl = decodeURIComponent(url);
    const marker = '/project-images/';
    const markerIndex = decodedUrl.indexOf(marker);

    if (markerIndex === -1) return null;

    return decodedUrl.slice(markerIndex + marker.length);
  } catch {
    return null;
  }
}

function money(value: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(value || 0);
  } catch {
    return `${value || 0} ${currency || 'USD'}`;
  }
}

export function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadProjects = async () => {
    setLoading(true);
    setError('');

    const { data, error: loadError } = await supabase
      .from('projects')
      .select(`
        id,
        title_en,
        title_ar,
        short_description_en,
        short_description_ar,
        description_en,
        description_ar,
        category,
        status,
        cover_image_url,
        location_en,
        location_ar,
        funding_goal,
        amount_raised,
        currency,
        expected_beneficiaries,
        donation_url,
        donation_enabled,
        start_date,
        target_date,
        featured,
        display_order,
        created_at
      `)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (loadError) {
      console.error('LOAD PROJECTS ERROR:', loadError);
      setError(loadError.message || 'Failed to load projects.');
      setProjects([]);
    } else {
      setProjects((data as Project[]) || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
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

    setForm(emptyForm);
    setEditingProject(null);
    setImage(null);
    setImagePreview('');
    setError('');
  };

  const openAddModal = () => {
    resetForm();
    setSuccess('');
    setShowModal(true);
  };

  const openEditModal = (project: Project) => {
    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    setEditingProject(project);

    setForm({
      title_en: project.title_en || '',
      title_ar: project.title_ar || '',
      short_description_en: project.short_description_en || '',
      short_description_ar: project.short_description_ar || '',
      description_en: project.description_en || '',
      description_ar: project.description_ar || '',
      category: project.category || 'education',
      status: project.status || 'planned',
      location_en: project.location_en || '',
      location_ar: project.location_ar || '',
      funding_goal: Number(project.funding_goal) || 0,
      amount_raised: Number(project.amount_raised) || 0,
      currency: project.currency || 'USD',
      expected_beneficiaries: Number(project.expected_beneficiaries) || 0,
      donation_url: project.donation_url || '',
      donation_enabled: project.donation_enabled ?? true,
      start_date: project.start_date || '',
      target_date: project.target_date || '',
      featured: project.featured ?? false,
      display_order: project.display_order ?? 0,
    });

    setImage(null);
    setImagePreview(project.cover_image_url || '');
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

    const numericFields = [
      'funding_goal',
      'amount_raised',
      'expected_beneficiaries',
      'display_order',
    ];

    setForm((previous) => ({
      ...previous,
      [name]: numericFields.includes(name) ? Number(value) : value,
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

    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(selectedFile);
    setImagePreview(URL.createObjectURL(selectedFile));
    setError('');
  };

  const uploadImage = async (file: File) => {
    const fileExtension =
      file.name.split('.').pop()?.toLowerCase() || 'jpg';

    const filePath = `projects/${crypto.randomUUID()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('project-images')
      .getPublicUrl(filePath);

    if (!data.publicUrl) {
      throw new Error('Could not create a public URL for the project image.');
    }

    return {
      publicUrl: data.publicUrl,
      filePath,
    };
  };

  const deleteStorageImage = async (url: string | null) => {
    const path = getStoragePathFromPublicUrl(url);

    if (!path) return;

    const { error: removeError } = await supabase.storage
      .from('project-images')
      .remove([path]);

    if (removeError) {
      console.warn('REMOVE IMAGE ERROR:', removeError);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError('');
    setSuccess('');

    let uploadedNewImagePath: string | null = null;

    try {
      let coverImageUrl = editingProject?.cover_image_url || null;

      if (image) {
        const uploaded = await uploadImage(image);
        coverImageUrl = uploaded.publicUrl;
        uploadedNewImagePath = uploaded.filePath;
      }

      const projectData = {
        title_en: form.title_en.trim(),
        title_ar: form.title_ar.trim(),
        short_description_en: form.short_description_en.trim() || null,
        short_description_ar: form.short_description_ar.trim() || null,
        description_en: form.description_en.trim(),
        description_ar: form.description_ar.trim(),
        category: form.category,
        status: form.status,
        cover_image_url: coverImageUrl,
        location_en: form.location_en.trim() || null,
        location_ar: form.location_ar.trim() || null,
        funding_goal: Number(form.funding_goal) || 0,
        amount_raised: Number(form.amount_raised) || 0,
        currency: form.currency || 'USD',
        expected_beneficiaries:
          Number(form.expected_beneficiaries) || 0,
        donation_url: form.donation_url.trim() || null,
        donation_enabled: form.donation_enabled,
        start_date: form.start_date || null,
        target_date: form.target_date || null,
        featured: form.featured,
        display_order: Number(form.display_order) || 0,
      };

      if (editingProject) {
        const oldImageUrl = editingProject.cover_image_url;

        const { error: updateError } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id);

        if (updateError) throw updateError;

        if (image && oldImageUrl && oldImageUrl !== coverImageUrl) {
          await deleteStorageImage(oldImageUrl);
        }

        setSuccess('Project updated successfully.');
      } else {
        const { error: insertError } = await supabase
          .from('projects')
          .insert(projectData);

        if (insertError) throw insertError;

        setSuccess('Project added successfully.');
      }

      await loadProjects();
      setShowModal(false);
      resetForm();
    } catch (saveError: any) {
      console.error('PROJECT SAVE ERROR:', saveError);

      if (uploadedNewImagePath) {
        await supabase.storage
          .from('project-images')
          .remove([uploadedNewImagePath]);
      }

      setError(
        saveError?.message ||
          'Failed to save project. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (project: Project) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.title_en}"?`
    );

    if (!confirmed) return;

    setDeletingId(project.id);
    setError('');
    setSuccess('');

    try {
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (deleteError) throw deleteError;

      await deleteStorageImage(project.cover_image_url);

      setProjects((previous) =>
        previous.filter((item) => item.id !== project.id)
      );

      setSuccess('Project deleted successfully.');
    } catch (deleteError: any) {
      console.error('DELETE PROJECT ERROR:', deleteError);

      setError(
        deleteError?.message ||
          'Failed to delete project. Please try again.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return projects;

    return projects.filter((project) => {
      return (
        project.title_en?.toLowerCase().includes(term) ||
        project.title_ar?.toLowerCase().includes(term) ||
        project.category?.toLowerCase().includes(term) ||
        project.status?.toLowerCase().includes(term) ||
        project.location_en?.toLowerCase().includes(term) ||
        project.location_ar?.toLowerCase().includes(term)
      );
    });
  }, [projects, search]);

  const fundingPercent = (project: Project) => {
    const goal = Number(project.funding_goal) || 0;
    const raised = Number(project.amount_raised) || 0;

    if (goal <= 0) return 0;

    return Math.min(100, Math.round((raised / goal) * 100));
  };

  return (
    <AdminLayout title="Projects">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Future & Fundraising Projects
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage planned projects, fundraising goals, project details and donation links.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-[#0C4A2E] text-white px-5 py-3 rounded-xl hover:bg-[#083A24] transition"
        >
          <Plus size={18} />
          Add Project
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
              placeholder="Search projects..."
              className="w-full border border-gray-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-[#0C4A2E] focus:ring-2 focus:ring-[#0C4A2E]/10"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Loading projects...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-16 px-6 text-center text-gray-500">
            No projects found.
          </div>
        ) : (
          <div className="p-5 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredProjects.map((project) => {
              const percent = fundingPercent(project);

              return (
                <article
                  key={project.id}
                  className="border border-gray-100 rounded-2xl overflow-hidden bg-white hover:shadow-md transition"
                >
                  <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
                    {project.cover_image_url ? (
                      <img
                        src={project.cover_image_url}
                        alt={project.title_en}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}

                    {project.featured && (
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-[#0C4A2E] text-white text-xs px-3 py-1 rounded-full">
                        <Star size={12} />
                        Featured
                      </span>
                    )}

                    <span className="absolute top-3 right-3 bg-white/95 text-gray-700 text-xs px-3 py-1 rounded-full capitalize shadow-sm">
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-gray-800">
                      {project.title_en}
                    </h3>

                    <p dir="rtl" className="text-xs text-gray-400 mt-1">
                      {project.title_ar}
                    </p>

                    <p className="text-sm text-gray-500 mt-4 line-clamp-2">
                      {project.short_description_en ||
                        project.description_en}
                    </p>

                    <div className="mt-5">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-gray-500">
                          {money(
                            Number(project.amount_raised),
                            project.currency
                          )}{' '}
                          raised
                        </span>

                        <span className="font-semibold text-[#0C4A2E]">
                          {percent}%
                        </span>
                      </div>

                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0C4A2E] rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <p className="text-xs text-gray-400 mt-2">
                        Goal:{' '}
                        {money(
                          Number(project.funding_goal),
                          project.currency
                        )}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-5 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <Users size={15} />
                        {project.expected_beneficiaries || 0}
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin size={15} />
                        <span className="truncate">
                          {project.location_en || 'No location'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 col-span-2">
                        <CalendarDays size={15} />
                        {project.target_date || 'No target date'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-400 capitalize">
                        {(project.category || '').replace('_', ' ')}
                      </span>

                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            window.open(
                              `/admin/projects/${project.id}`,
                              '_blank',
                              'noopener,noreferrer'
                            )
                          }
                          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                          title="View project"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditModal(project)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                          title="Edit project"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(project)}
                          disabled={deletingId === project.id}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-40"
                          title="Delete project"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[94vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#073B2A]">
                  {editingProject ? 'Edit Project' : 'Add Future Project'}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Add project details, funding information and donation options.
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

            <form onSubmit={handleSubmit} className="p-6 space-y-7">
              <section>
                <h4 className="font-semibold text-gray-800 mb-4">
                  Basic Information
                </h4>

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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      English Short Description
                    </label>
                    <textarea
                      name="short_description_en"
                      value={form.short_description_en}
                      onChange={handleChange}
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none resize-none focus:border-[#0C4A2E]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Arabic Short Description
                    </label>
                    <textarea
                      name="short_description_ar"
                      value={form.short_description_ar}
                      onChange={handleChange}
                      rows={3}
                      dir="rtl"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none resize-none focus:border-[#0C4A2E]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      English Full Description
                    </label>
                    <textarea
                      name="description_en"
                      value={form.description_en}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none resize-none focus:border-[#0C4A2E]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Arabic Full Description
                    </label>
                    <textarea
                      name="description_ar"
                      value={form.description_ar}
                      onChange={handleChange}
                      required
                      rows={6}
                      dir="rtl"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none resize-none focus:border-[#0C4A2E]"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-5 mt-5">
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
                      <option value="education">Education</option>
                      <option value="health">Health</option>
                      <option value="relief">Relief</option>
                      <option value="women_child">Women & Child</option>
                      <option value="infrastructure">Infrastructure</option>
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
                      <option value="planned">Planned</option>
                      <option value="fundraising">Fundraising</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
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

                  <label className="flex items-center gap-3 border border-gray-100 rounded-xl px-4 py-3 mt-7 cursor-pointer">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={form.featured}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Featured
                    </span>
                  </label>
                </div>
              </section>

              <section className="border-t border-gray-100 pt-6">
                <h4 className="font-semibold text-gray-800 mb-4">
                  Funding & Donations
                </h4>

                <div className="grid md:grid-cols-4 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Funding Goal
                    </label>
                    <div className="relative">
                      <DollarSign
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        name="funding_goal"
                        value={form.funding_goal}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-[#0C4A2E]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount Raised
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      name="amount_raised"
                      value={form.amount_raised}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={form.currency}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white outline-none focus:border-[#0C4A2E]"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="ILS">ILS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Beneficiaries
                    </label>
                    <input
                      type="number"
                      min={0}
                      name="expected_beneficiaries"
                      value={form.expected_beneficiaries}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Project Donation URL
                    </label>

                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        name="donation_enabled"
                        checked={form.donation_enabled}
                        onChange={handleChange}
                      />
                      Show donation button
                    </label>
                  </div>

                  <input
                    type="url"
                    name="donation_url"
                    value={form.donation_url}
                    onChange={handleChange}
                    placeholder="https://..."
                    dir="ltr"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                  />
                </div>
              </section>

              <section className="border-t border-gray-100 pt-6">
                <h4 className="font-semibold text-gray-800 mb-4">
                  Location & Timeline
                </h4>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={form.start_date}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Date
                    </label>
                    <input
                      type="date"
                      name="target_date"
                      value={form.target_date}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                    />
                  </div>
                </div>
              </section>

              <section className="border-t border-gray-100 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image
                </label>

                <label className="border-2 border-dashed border-gray-200 rounded-2xl min-h-52 flex items-center justify-center cursor-pointer hover:border-[#0C4A2E] transition overflow-hidden bg-gray-50/40">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Project preview"
                      className="w-full max-h-80 object-cover"
                    />
                  ) : (
                    <div className="text-center p-8">
                      <Upload
                        size={30}
                        className="mx-auto text-[#073B2A]"
                      />

                      <p className="font-medium text-gray-700 mt-3">
                        Upload project cover
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

                {editingProject &&
                  !image &&
                  editingProject.cover_image_url && (
                    <p className="text-xs text-gray-400 mt-2">
                      The current image will stay unchanged unless you select a new one.
                    </p>
                  )}
              </section>

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
                  className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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
                    : editingProject
                      ? 'Update Project'
                      : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}