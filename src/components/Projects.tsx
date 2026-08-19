import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  HeartHandshake,
  MapPin,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { TatreezDivider } from './TatreezDivider';
import { supabase } from '@/lib/supabase';

type ProjectsProps = {
  copy: any;
  language: 'ar' | 'en';
};

type ProjectRow = {
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
  donation_url: string | null;
  donation_enabled: boolean;

  featured: boolean;
  display_order: number;
};

const categoryLabelsAr: Record<string, string> = {
  women_child: 'المرأة والطفل',
  relief: 'الإغاثة',
  education: 'التعليم',
  health: 'الصحة',
};

const categoryLabelsEn: Record<string, string> = {
  women_child: 'Women & Child',
  relief: 'Relief',
  education: 'Education',
  health: 'Health',
};

const statusLabelsAr: Record<string, string> = {
  planned: 'قيد التخطيط',
  fundraising: 'جمع التبرعات',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتمل',
  ongoing: 'قيد التنفيذ',
};

const statusLabelsEn: Record<string, string> = {
  planned: 'Planned',
  fundraising: 'Fundraising',
  in_progress: 'In Progress',
  completed: 'Completed',
  ongoing: 'In Progress',
};

function formatMoney(value: number, currency: string, language: 'ar' | 'en') {
  return new Intl.NumberFormat(language === 'ar' ? 'ar' : 'en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(value: string | null, language: 'ar' | 'en') {
  if (!value) return '';

  return new Intl.DateTimeFormat(language === 'ar' ? 'ar' : 'en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

export function Projects({ language }: ProjectsProps) {
  const navigate = useNavigate();
  const isRtl = language === 'ar';

  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          title_ar,
          title_en,
          short_description_ar,
          short_description_en,
          description_ar,
          description_en,
          category,
          status,
          cover_image_url,
          location_ar,
          location_en,
          funding_goal,
          amount_raised,
          currency,
          donation_url,
          donation_enabled,
       
          featured,
          display_order
        `)
        .order('featured', { ascending: false })
        .order('display_order', { ascending: true });

      if (error) {
        console.error('LOAD FUTURE PROJECTS ERROR:', error);
        setProjects([]);
      } else {
        setProjects((data as ProjectRow[]) || []);
      }

      setLoading(false);
    };

    loadProjects();
  }, []);

  const copy = useMemo(
    () =>
      isRtl
        ? {
            kicker: 'مشاريعنا',
            title: 'مشاريع نبني بها المستقبل',
            intro:
              'مشاريع إنسانية وتنموية طويلة الأثر نعمل على تجهيزها وتمويلها لتوفير حلول أكثر استدامة للأسر والأطفال في غزة.',
            raised: 'تم جمع',
            goal: 'الهدف',
            funded: 'ممول',
            
            location: 'الموقع',
          
            view: 'تفاصيل المشروع',
            donate: 'ساهم الآن',
            noProjects: 'لا توجد مشاريع متاحة حاليًا.',
          }
        : {
            kicker: 'Our Projects',
            title: 'Projects Building the Future',
            intro:
              'Long-term humanitarian and development projects designed to create more sustainable support for families and children in Gaza.',
            raised: 'Raised',
            goal: 'Goal',
            funded: 'Funded',
           
            location: 'Location',
          
            view: 'View Project',
            donate: 'Donate Now',
            noProjects: 'No projects are available yet.',
          },
    [isRtl]
  );

  const labels = isRtl ? categoryLabelsAr : categoryLabelsEn;
  const statusLabels = isRtl ? statusLabelsAr : statusLabelsEn;

  return (
    <section className="future-projects-section" id="projects">
      <TatreezDivider />

      <div className="section-shell">
        <div className="section-heading align-start future-projects-heading">
          <span className="section-kicker">
            <i />
            {copy.kicker}
          </span>

          <h2>{copy.title}</h2>

          <p>{copy.intro}</p>
        </div>

        {loading ? (
          <div className="section-loading" />
        ) : projects.length === 0 ? (
          <div className="future-projects-empty">
            {copy.noProjects}
          </div>
        ) : (
          <div className="future-projects-grid">
            {projects.map((project) => {
              const goal = Number(project.funding_goal || 0);
              const raised = Number(project.amount_raised || 0);

              const progress =
                goal > 0
                  ? Math.min(100, Math.round((raised / goal) * 100))
                  : 0;

              const currency = project.currency || 'USD';

              const title = isRtl
                ? project.title_ar
                : project.title_en;

              const description =
                (isRtl
                  ? project.short_description_ar
                  : project.short_description_en) ||
                (isRtl
                  ? project.description_ar
                  : project.description_en);

              const location = isRtl
                ? project.location_ar
                : project.location_en;

              const status =
                statusLabels[project.status] || project.status;

              return (
                <article
                  key={project.id}
                  className={`future-project-card ${
                    project.featured ? 'featured' : ''
                  }`}
                >
                  <div className="future-project-image-wrap">
                    {project.cover_image_url ? (
                      <img
                        src={project.cover_image_url}
                        alt={title}
                        className="future-project-image"
                        loading="lazy"
                      />
                    ) : (
                      <div className="future-project-image-placeholder" />
                    )}

                    <div className="future-project-badges">
                      <span className="future-project-status">
                        {status}
                      </span>

                      {project.category && (
                        <span className="future-project-category">
                          {labels[project.category] || project.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="future-project-content">
                    <h3>{title}</h3>

                    <p className="future-project-description">
                      {description}
                    </p>

                

                    {goal > 0 && (
                      <div className="future-project-funding">
                        <div className="future-project-funding-top">
                          <div>
                            <span>{copy.raised}</span>
                            <strong>
                              {formatMoney(raised, currency, language)}
                            </strong>
                          </div>

                          <div className="future-project-goal">
                            <span>{copy.goal}</span>
                            <strong>
                              {formatMoney(goal, currency, language)}
                            </strong>
                          </div>
                        </div>

                        <div className="future-project-progress">
                          <span style={{ width: `${progress}%` }} />
                        </div>

                        <div className="future-project-progress-label">
                          {progress}% {copy.funded}
                        </div>
                      </div>
                    )}

                    <div className="future-project-actions">
                      <button
                        type="button"
                        className="future-project-view"
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        {copy.view}
                        <ArrowRight
                          size={17}
                          className={isRtl ? 'rtl-arrow' : ''}
                        />
                      </button>

                   
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}