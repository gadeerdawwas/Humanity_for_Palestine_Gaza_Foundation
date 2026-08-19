import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  HeartHandshake,
  MapPin,
  Users,
} from 'lucide-react';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TatreezDivider } from '@/components/TatreezDivider';
import { useLanguage } from '@/context/LanguageContext';
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
};

const categoryAr: Record<string, string> = {
  women_child: 'المرأة والطفل',
  relief: 'الإغاثة',
  education: 'التعليم',
  health: 'الصحة',
};

const categoryEn: Record<string, string> = {
  women_child: 'Women & Child',
  relief: 'Relief',
  education: 'Education',
  health: 'Health',
};

const statusAr: Record<string, string> = {
  planned: 'قيد التخطيط',
  fundraising: 'جمع التبرعات',
  in_progress: 'قيد التنفيذ',
  ongoing: 'قيد التنفيذ',
  completed: 'مكتمل',
};

const statusEn: Record<string, string> = {
  planned: 'Planned',
  fundraising: 'Fundraising',
  in_progress: 'قيد التنفيذ',
  ongoing: 'In Progress',
  completed: 'Completed',
};

function money(value: number, currency: string, language: 'ar' | 'en') {
  return new Intl.NumberFormat(language === 'ar' ? 'ar' : 'en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function date(value: string | null, language: 'ar' | 'en') {
  if (!value) return '—';
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar' : 'en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
}

export function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, copy, setLanguage } = useLanguage();
  const isRtl = language === 'ar';

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const load = async () => {
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('LOAD PROJECT DETAIL ERROR:', error);
        setNotFound(true);
      } else {
        setProject(data as Project);
      }

      setLoading(false);
    };

    load();
  }, [id]);

  const text = isRtl
    ? {
        back: 'العودة إلى المشاريع',
        about: 'عن المشروع',
        funding: 'تمويل المشروع',
        raised: 'تم جمع',
        goal: 'هدف التمويل',
        funded: 'ممول',
        donate: 'ساهم في هذا المشروع',
        beneficiaries: 'المستفيدون المتوقعون',
        location: 'الموقع',
        start: 'تاريخ البدء',
        target: 'التاريخ المستهدف',
        notFound: 'المشروع غير موجود.',
      }
    : {
        back: 'Back to Projects',
        about: 'About the Project',
        funding: 'Project Funding',
        raised: 'Raised',
        goal: 'Funding Goal',
        funded: 'Funded',
        donate: 'Support This Project',
        beneficiaries: 'Expected Beneficiaries',
        location: 'Location',
        start: 'Start Date',
        target: 'Target Date',
        notFound: 'Project not found.',
      };

  if (loading) {
    return (
      <div className="app-shell">
        <Header language={language} copy={copy} onLanguageChange={setLanguage} />
        <main className="project-detail-state"><div className="section-loading" /></main>
        <Footer copy={copy} />
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="app-shell">
        <Header language={language} copy={copy} onLanguageChange={setLanguage} />
        <main className="project-detail-state">
          <h1>{text.notFound}</h1>
          <button onClick={() => navigate('/#projects')}>{text.back}</button>
        </main>
        <Footer copy={copy} />
      </div>
    );
  }

  const title = isRtl ? project.title_ar : project.title_en;
  const description = isRtl ? project.description_ar : project.description_en;
  const shortDescription = isRtl
    ? project.short_description_ar
    : project.short_description_en;
  const location = isRtl ? project.location_ar : project.location_en;
  const categories = isRtl ? categoryAr : categoryEn;
  const statuses = isRtl ? statusAr : statusEn;

  const goal = Number(project.funding_goal || 0);
  const raised = Number(project.amount_raised || 0);
  const currency = project.currency || 'USD';
  const progress = goal > 0
    ? Math.min(100, Math.round((raised / goal) * 100))
    : 0;

  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="app-shell">
      <Header language={language} copy={copy} onLanguageChange={setLanguage} />

      <main className="project-detail-page">
        <section className="project-detail-hero">
          {project.cover_image_url && (
            <img src={project.cover_image_url} alt={title} />
          )}
          <div className="project-detail-overlay" />

          <div className="section-shell project-detail-hero-content">
            <button className="project-detail-back" onClick={() => navigate('/#projects')}>
              <BackArrow size={18} />
              {text.back}
            </button>

            <div className="project-detail-tags">
              <span>{statuses[project.status] || project.status}</span>
              {project.category && <span>{categories[project.category] || project.category}</span>}
            </div>

            <h1>{title}</h1>
            {shortDescription && <p>{shortDescription}</p>}
          </div>
        </section>

        <TatreezDivider />

        <section className="section-shell project-detail-layout">
          <article className="project-detail-main">
            <span className="section-kicker"><i />{text.about}</span>
            <h2>{title}</h2>
            <p className="project-detail-description">{description}</p>

            <div className="project-detail-facts">
              <div>
                <MapPin size={21} />
                <span>{text.location}</span>
                <strong>{location || '—'}</strong>
              </div>
              <div>
                <Users size={21} />
                <span>{text.beneficiaries}</span>
                <strong>{project.expected_beneficiaries || '—'}</strong>
              </div>
              <div>
                <CalendarDays size={21} />
                <span>{text.start}</span>
                <strong>{date(project.start_date, language)}</strong>
              </div>
              <div>
                <CalendarDays size={21} />
                <span>{text.target}</span>
                <strong>{date(project.target_date, language)}</strong>
              </div>
            </div>
          </article>

          <aside className="project-funding-card">
            <span className="section-kicker"><i />{text.funding}</span>

            <div className="project-funding-number">
              <span>{text.raised}</span>
              <strong>{money(raised, currency, language)}</strong>
            </div>

            <div className="project-funding-goal">
              <span>{text.goal}</span>
              <strong>{money(goal, currency, language)}</strong>
            </div>

            {goal > 0 && (
              <>
                <div className="project-detail-progress">
                  <span style={{ width: `${progress}%` }} />
                </div>
                <p className="project-detail-progress-text">{progress}% {text.funded}</p>
              </>
            )}

            {project.donation_enabled && project.donation_url && (
              <a
                href={project.donation_url}
                target="_blank"
                rel="noreferrer"
                className="project-detail-donate"
              >
                <HeartHandshake size={19} />
                {text.donate}
              </a>
            )}
          </aside>
        </section>
      </main>

      <Footer copy={copy} />
    </div>
  );
}