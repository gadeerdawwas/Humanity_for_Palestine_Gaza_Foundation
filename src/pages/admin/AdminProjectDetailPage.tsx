import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  HeartHandshake,
  MapPin,
  Pencil,
  Trash2,
  Users,
} from 'lucide-react';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';

type Project = {
  id: string;
  title_ar: string;
  title_en: string;
  short_description_ar: string | null;
  short_description_en: string | null;
  description_ar: string;
  description_en: string;
  category: string | null;
  status: string;
  cover_image_url: string | null;
  location_ar: string | null;
  location_en: string | null;
  funding_goal: number | null;
  amount_raised: number | null;
  currency: string | null;
  expected_beneficiaries: number | null;
  donation_url: string | null;
  donation_enabled: boolean;
  start_date: string | null;
  target_date: string | null;
  featured?: boolean;
  display_order?: number;
};

const categoryLabels: Record<string, string> = {
  women_child: 'Women & Child',
  relief: 'Relief',
  education: 'Education',
  health: 'Health',
};

const statusLabels: Record<string, string> = {
  planned: 'Planned',
  fundraising: 'Fundraising',
  in_progress: 'In Progress',
  ongoing: 'In Progress',
  completed: 'Completed',
};

function money(value: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function date(value: string | null) {
  if (!value) return '—';

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
}

export function AdminProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProject = async () => {
      if (!id) {
        setError('Project ID is missing.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      const { data, error: loadError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (loadError || !data) {
        console.error('LOAD ADMIN PROJECT DETAIL ERROR:', loadError);
        setError(loadError?.message || 'Project not found.');
        setProject(null);
      } else {
        setProject(data as Project);
      }

      setLoading(false);
    };

    loadProject();
  }, [id]);

  const handleDelete = async () => {
    if (!project || deleting) return;

    const confirmed = window.confirm(
      `Delete "${project.title_en}" permanently?`
    );

    if (!confirmed) return;

    setDeleting(true);
    setError('');

    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', project.id);

    if (deleteError) {
      console.error('DELETE PROJECT ERROR:', deleteError);
      setError(deleteError.message || 'Failed to delete project.');
      setDeleting(false);
      return;
    }

    navigate('/admin/projects');
  };

  if (loading) {
    return (
      <AdminLayout title="Project Details">
        <div className="min-h-[420px] flex items-center justify-center text-gray-500">
          Loading project...
        </div>
      </AdminLayout>
    );
  }

  if (error || !project) {
    return (
      <AdminLayout title="Project Details">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <p className="text-red-500">
            {error || 'Project not found.'}
          </p>

          <button
            type="button"
            onClick={() => navigate('/admin/projects')}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0C4A2E] text-white"
          >
            <ArrowLeft size={17} />
            Back to Projects
          </button>
        </div>
      </AdminLayout>
    );
  }

  const goal = Number(project.funding_goal || 0);
  const raised = Number(project.amount_raised || 0);
  const currency = project.currency || 'USD';

  const progress =
    goal > 0
      ? Math.min(100, Math.round((raised / goal) * 100))
      : 0;

  return (
    <AdminLayout title="Project Details">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/admin/projects')}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0C4A2E]"
        >
          <ArrowLeft size={17} />
          Back to Projects
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              navigate(`/admin/projects?edit=${project.id}`)
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-100 text-blue-600 hover:bg-blue-50"
          >
            <Pencil size={17} />
            Edit
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 size={17} />
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="grid xl:grid-cols-[1.5fr_.8fr] gap-6">
        <section className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="aspect-[16/7] bg-gray-100">
              {project.cover_image_url ? (
                <img
                  src={project.cover_image_url}
                  alt={project.title_en}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No cover image
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-3 py-1.5 rounded-full bg-[#0C4A2E]/10 text-[#0C4A2E] text-xs font-semibold">
                  {categoryLabels[project.category || ''] || project.category || 'No Category'}
                </span>

                <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                  {statusLabels[project.status] || project.status}
                </span>

                {project.featured && (
                  <span className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                    Featured
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold text-[#073B2A]">
                {project.title_en}
              </h1>

              <h2
                dir="rtl"
                className="text-xl font-semibold text-gray-700 mt-2"
              >
                {project.title_ar}
              </h2>

              {project.short_description_en && (
                <p className="text-sm text-gray-500 mt-4 leading-7">
                  {project.short_description_en}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              Full Description
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <span className="text-xs font-medium text-gray-400">
                  English
                </span>
                <p className="mt-2 text-sm text-gray-600 leading-7 whitespace-pre-line">
                  {project.description_en || '—'}
                </p>
              </div>

              <div dir="rtl">
                <span className="text-xs font-medium text-gray-400">
                  العربية
                </span>
                <p className="mt-2 text-sm text-gray-600 leading-7 whitespace-pre-line">
                  {project.description_ar || '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-5">
              Project Information
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <InfoItem
                icon={<MapPin size={18} />}
                label="Location"
                value={project.location_en || project.location_ar || '—'}
              />

              <InfoItem
                icon={<Users size={18} />}
                label="Expected Beneficiaries"
                value={
                  project.expected_beneficiaries
                    ? project.expected_beneficiaries.toLocaleString('en-US')
                    : '—'
                }
              />

              <InfoItem
                icon={<CalendarDays size={18} />}
                label="Start Date"
                value={date(project.start_date)}
              />

              <InfoItem
                icon={<CalendarDays size={18} />}
                label="Target Date"
                value={date(project.target_date)}
              />
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <HeartHandshake
                size={20}
                className="text-[#0C4A2E]"
              />
              <h3 className="font-semibold text-gray-800">
                Funding
              </h3>
            </div>

            <div className="space-y-5">
              <div>
                <span className="text-xs text-gray-400">
                  Raised
                </span>
                <strong className="block text-2xl text-[#0C4A2E] mt-1">
                  {money(raised, currency)}
                </strong>
              </div>

              <div>
                <span className="text-xs text-gray-400">
                  Goal
                </span>
                <strong className="block text-lg text-gray-700 mt-1">
                  {money(goal, currency)}
                </strong>
              </div>

              {goal > 0 && (
                <>
                  <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#0C4A2E]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{progress}% funded</span>
                    <span>
                      {money(Math.max(goal - raised, 0), currency)} remaining
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              Donation Settings
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-500">
                  Donations
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    project.donation_enabled
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {project.donation_enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              {project.donation_url && (
                <a
                  href={project.donation_url}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-[#0C4A2E] break-all hover:underline"
                >
                  {project.donation_url}
                </a>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              Display
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Display Order
                </span>
                <strong>
                  {project.display_order ?? '—'}
                </strong>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Featured
                </span>
                <strong>
                  {project.featured ? 'Yes' : 'No'}
                </strong>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </AdminLayout>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 p-4">
      <span className="w-9 h-9 rounded-lg bg-[#0C4A2E]/10 text-[#0C4A2E] flex items-center justify-center flex-none">
        {icon}
      </span>

      <div className="min-w-0">
        <span className="text-xs text-gray-400">
          {label}
        </span>
        <strong className="block text-sm text-gray-700 mt-1 break-words">
          {value}
        </strong>
      </div>
    </div>
  );
}