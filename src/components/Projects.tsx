import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { TatreezDivider } from './TatreezDivider';
import { supabase, type Project } from '@/lib/supabase';

type ProjectsProps = { copy: any; language: 'ar' | 'en' };

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

type ProjectItemView = {
  id: string;
  title: string;
  category: string;
  accent: string;
  status: 'ongoing' | 'completed';
  image: string;
  description: string;
};

export function Projects({ copy, language }: ProjectsProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isRtl = language === 'ar';
  const [items, setItems] = useState<ProjectItemView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('display_order', { ascending: true });
      if (error || !data) {
        setItems([]);
        setLoading(false);
        return;
      }
      const labels = isRtl ? categoryLabelsAr : categoryLabelsEn;
      const mapped: ProjectItemView[] = (data as Project[]).map((p) => ({
        id: p.id,
        title: isRtl ? p.title_ar : p.title_en,
        category: labels[p.category] || p.category,
        accent: p.category === 'relief' ? 'green'
          : p.category === 'education' ? 'gold'
          : p.category === 'women_child' ? 'red'
          : 'deep',
        status: p.status,
        image: p.cover_image_url,
        description: isRtl ? p.description_ar : p.description_en,
      }));
      setItems(mapped);
      setLoading(false);
    })();
  }, [language, isRtl]);

  const scrollByCards = (direction: number) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('.project-card') as HTMLElement | null;
    const distance = card ? card.offsetWidth + 24 : 360;
    track.scrollBy({ left: distance * direction, behavior: 'smooth' });
  };

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <section className="projects-section" id="projects">
      <TatreezDivider />
      <div className="section-shell">
        <div className="projects-header">
          <div className="section-heading align-start">
            <span className="section-kicker"><i />{copy.projects.kicker}</span>
            <h2>{copy.projects.title}</h2>
            <p>{copy.projects.intro}</p>
          </div>
          <div className="projects-nav">
            <button type="button" aria-label="Previous" onClick={() => scrollByCards(-1)}><PrevIcon size={20} /></button>
            <button type="button" aria-label="Next" onClick={() => scrollByCards(1)}><NextIcon size={20} /></button>
          </div>
        </div>
        <div className="projects-carousel">
          <div className="projects-track" ref={trackRef}>
            {loading ? (
              <div className="section-loading" />
            ) : items.length > 0 ? (
              items.map((item, index) => (
                <ProjectCard
                  key={item.id}
                  item={item}
                  learnMore={copy.projects.learnMore}
                  statusOngoing={copy.projects.statusOngoing}
                  statusCompleted={copy.projects.statusCompleted}
                  language={language}
                />
              ))
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
