import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowUpLeft, ArrowUpRight, ChevronRight } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';
import { TatreezDivider } from '@/components/TatreezDivider';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { supabase, type Project } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';

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

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { language, copy, setLanguage } = useLanguage();
  const isRtl = language === 'ar';
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const ref = useReveal<HTMLDivElement>();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setNotFound(false);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setProject(data as Project);
      setLoading(false);
    })();
  }, [id]);

  const Arrow = isRtl ? ArrowUpLeft : ArrowUpRight;
  const BackIcon = isRtl ? ChevronRight : ChevronRight;

  if (loading) {
    return (
      <div className="app-shell">
        <Header language={language} copy={copy} onLanguageChange={setLanguage} />
        <main>
          <section className="project-detail-section">
            <div className="section-shell">
              <div className="section-loading" />
            </div>
          </section>
        </main>
        <Footer copy={copy} />
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="app-shell">
        <Header language={language} copy={copy} onLanguageChange={setLanguage} />
        <main>
          <section className="project-detail-section">
            <TatreezDivider />
            <div className="section-shell">
              <div className="project-detail-not-found">
                <h2>{copy.pages.projectNotFound}</h2>
                <p>{copy.pages.projectNotFoundBody}</p>
                <button type="button" className="outline-button" onClick={() => navigate('/')}>
                  {copy.pages.backToProjects}
                </button>
              </div>
            </div>
          </section>
        </main>
        <Footer copy={copy} />
      </div>
    );
  }

  const labels = isRtl ? categoryLabelsAr : categoryLabelsEn;
  const categoryLabel = labels[project.category] || project.category;
  const title = isRtl ? project.title_ar : project.title_en;
  const description = isRtl ? project.description_ar : project.description_en;
  const statusLabel = project.status === 'ongoing' ? copy.projects.statusOngoing : copy.projects.statusCompleted;
  const accent = project.category === 'relief' ? 'green'
    : project.category === 'education' ? 'gold'
    : project.category === 'women_child' ? 'red'
    : 'deep';

  return (
    <div className="app-shell">
      <Header language={language} copy={copy} onLanguageChange={setLanguage} />
      <main>
        <section className="project-detail-section">
          <TatreezDivider />
          <div className="section-shell">
            <button
              type="button"
              className="project-detail-back"
              onClick={() => navigate('/#projects')}
            >
              <BackIcon size={16} /> {copy.pages.backToProjects}
            </button>

            <article className={`project-detail-card accent-${accent} reveal`} ref={ref}>
              <div className="project-detail-cover">
                <img src={project.cover_image_url} alt={title} />
                <span className={`project-status ${project.status}`}>
                  <i /> {statusLabel}
                </span>
              </div>
              <div className="project-detail-body">
                <span className="project-tag">{categoryLabel}</span>
                <h1>{title}</h1>
                <p className="project-detail-description">{description}</p>
                <a className="donate-button project-detail-contact" href="/#contact">
                  {copy.pages.contactUs} <Arrow size={16} />
                </a>
              </div>
            </article>
          </div>
        </section>
      </main>
      <Footer copy={copy} />
    </div>
  );
}
