import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { InitiativesCard } from './InitiativesCard';
import { TatreezDivider } from './TatreezDivider';
import { supabase } from '@/lib/supabase';

type InitiativesProps = {
  language: 'ar' | 'en';
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

type InitiativeRow = {
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
};

type InitiativeItemView = {
  id: string;
  title: string;
  category: string;
  accent: string;
  status: 'ongoing' | 'completed';
  image: string;
  description: string;
};

export function Initiatives({
  language,
}: InitiativesProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const isRtl = language === 'ar';

  const [items, setItems] =
    useState<InitiativeItemView[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadInitiatives = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('initiatives')
        .select('*')
        .order('display_order', {
          ascending: true,
        });

      if (error || !data) {
        console.error(
          'LOAD INITIATIVES ERROR:',
          error
        );

        setItems([]);
        setLoading(false);
        return;
      }

      const labels = isRtl
        ? categoryLabelsAr
        : categoryLabelsEn;

      const mapped: InitiativeItemView[] =
        (data as InitiativeRow[]).map(
          (initiative) => ({
            id: initiative.id,

            title: isRtl
              ? initiative.title_ar
              : initiative.title_en,

            category:
              labels[initiative.category] ||
              initiative.category,

            accent:
              initiative.category === 'relief'
                ? 'green'
                : initiative.category ===
                    'education'
                  ? 'gold'
                  : initiative.category ===
                      'women_child'
                    ? 'red'
                    : 'deep',

            status:
              initiative.status ===
              'completed'
                ? 'completed'
                : 'ongoing',

            image:
              initiative.cover_image_url ||
              '',

            description: isRtl
              ? initiative.description_ar
              : initiative.description_en,
          })
        );

      setItems(mapped);
      setLoading(false);
    };

    loadInitiatives();
  }, [language, isRtl]);

  const scrollByCards = (
    direction: number
  ) => {
    const track = trackRef.current;

    if (!track) return;

    const card = track.querySelector(
      '.project-card'
    ) as HTMLElement | null;

    const distance = card
      ? card.offsetWidth + 24
      : 360;

    track.scrollBy({
      left: distance * direction,
      behavior: 'smooth',
    });
  };

  const PrevIcon = isRtl
    ? ChevronRight
    : ChevronLeft;

  const NextIcon = isRtl
    ? ChevronLeft
    : ChevronRight;

  const copy =
    language === 'ar'
      ? {
          kicker: 'مبادراتنا',
          title: 'مبادرات على الأرض',
          intro:
            'مبادرات إنسانية يتم تنفيذها على أرض الواقع لخدمة الأسر والأطفال والفئات الأكثر احتياجًا.',
          learnMore: 'اعرف أكثر',
          ongoing: 'مستمرة',
          completed: 'مكتملة',
        }
      : {
          kicker: 'Our Initiatives',
          title: 'Initiatives on the Ground',
          intro:
            'Humanitarian initiatives implemented on the ground to support families, children, and vulnerable communities.',
          learnMore: 'Learn More',
          ongoing: 'Ongoing',
          completed: 'Completed',
        };

  return (
    <section
      className="projects-section"
      id="initiatives"
    >
      <TatreezDivider />

      <div className="section-shell">
        <div className="projects-header">

          <div className="section-heading align-start">

            <span className="section-kicker">
              <i />
              {copy.kicker}
            </span>

            <h2>
              {copy.title}
            </h2>

            <p>
              {copy.intro}
            </p>

          </div>

          <div className="projects-nav">

            <button
              type="button"
              aria-label="Previous"
              onClick={() =>
                scrollByCards(-1)
              }
            >
              <PrevIcon size={20} />
            </button>

            <button
              type="button"
              aria-label="Next"
              onClick={() =>
                scrollByCards(1)
              }
            >
              <NextIcon size={20} />
            </button>

          </div>

        </div>

        <div className="projects-carousel">

          <div
            className="projects-track"
            ref={trackRef}
          >

            {loading ? (
              <div className="section-loading" />
            ) : items.length > 0 ? (
              items.map((item) => (
                <InitiativesCard
                  key={item.id}
                  item={item}
                  learnMore={
                    copy.learnMore
                  }
                  statusOngoing={
                    copy.ongoing
                  }
                  statusCompleted={
                    copy.completed
                  }
                  language={language}
                />
              ))
            ) : (
              <div className="text-sm text-gray-400">
                {language === 'ar'
                  ? 'لا توجد مبادرات حاليًا.'
                  : 'No initiatives available yet.'}
              </div>
            )}

          </div>

        </div>

      </div>

    </section>
  );
}