import {
  useEffect,
  useRef,
  useState,
} from 'react';

import { supabase } from '@/lib/supabase';

type ImpactStatsProps = {
  language: 'ar' | 'en';
};

type ImpactStat = {
  id: string;
  label_ar: string;
  label_en: string;
  value: number;
  suffix: string | null;
  display_order: number;
};

function AnimatedNumber({
  value,
  locale,
}: {
  value: number;
  locale: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          !entry.isIntersecting ||
          started.current
        ) {
          return;
        }

        started.current = true;

        const duration = 1600;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
          const progress = Math.min(
            (currentTime - startTime) / duration,
            1
          );

          // Smooth ease-out animation
          const eased =
            1 - Math.pow(1 - progress, 3);

          setCount(
            Math.floor(value * eased)
          );

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setCount(value);
          }
        };

        requestAnimationFrame(animate);

        observer.disconnect();
      },
      {
        threshold: 0.35,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [value]);

  return (
    <span
      ref={ref}
      className="impact-number"
    >
      {count.toLocaleString(locale)}
    </span>
  );
}

export function ImpactStats({
  language,
}: ImpactStatsProps) {
  const isRtl = language === 'ar';

  const [stats, setStats] =
    useState<ImpactStat[]>([]);

  useEffect(() => {
    const loadStats = async () => {
      const { data, error } = await supabase
        .from('impact_stats')
        .select(
          'id,label_ar,label_en,value,suffix,display_order'
        )
        .eq('enabled', true)
        .order('display_order', {
          ascending: true,
        });

      if (error) {
        console.error(
          'LOAD IMPACT STATS ERROR:',
          error
        );
        return;
      }

      setStats(
        (data as ImpactStat[]) || []
      );
    };

    loadStats();
  }, []);

  if (stats.length === 0) {
    return null;
  }

  return (
    <section
      className="impact-stats-section"
      id="impact"
    >
      <div className="section-shell">

        <div className="impact-stats-grid">

          {stats.map((stat, index) => (
            <div
              className="impact-stat"
              key={stat.id}
              style={{
                animationDelay:
                  `${index * 120}ms`,
              }}
            >
              <strong>

                <AnimatedNumber
                  value={Number(stat.value)}
                  locale={
                    isRtl
                      ? 'ar-EG'
                      : 'en-US'
                  }
                />

                {stat.suffix && (
                  <span className="impact-suffix">
                    {stat.suffix}
                  </span>
                )}

              </strong>

              <p>
                {isRtl
                  ? stat.label_ar
                  : stat.label_en}
              </p>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}