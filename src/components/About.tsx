import { useEffect, useState } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { supabase } from '@/lib/supabase';

type AboutProps = {
  copy: any;
  language: 'ar' | 'en';
};

type AboutContent = {
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
};

export function About({
  copy,
  language,
}: AboutProps) {
  const ref = useReveal<HTMLDivElement>();

  const [content, setContent] = useState<AboutContent>({
    title_ar: '',
    title_en: '',
    description_ar: '',
    description_en: '',
  });

  useEffect(() => {
    const loadAbout = async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key,value')
        .in('key', [
          'about_title_ar',
          'about_title_en',
          'about_description_ar',
          'about_description_en',
        ]);

      if (error) {
        console.error('LOAD ABOUT ERROR:', error);
        return;
      }

      const settings: Record<string, string> = {};

      (data || []).forEach((item) => {
        settings[item.key] = item.value || '';
      });

      setContent({
        title_ar: settings.about_title_ar || copy.about.title,
        title_en: settings.about_title_en || copy.about.title,

        description_ar:
          settings.about_description_ar || copy.about.body,

        description_en:
          settings.about_description_en || copy.about.body,
      });
    };

    loadAbout();
  }, [copy]);

  const title =
    language === 'ar'
      ? content.title_ar
      : content.title_en;

  const description =
    language === 'ar'
      ? content.description_ar
      : content.description_en;

  return (
    <section
      className="about-section"
      id="about"
    >
      <div className="section-shell">

        <div
          className="about-layout reveal"
          ref={ref}
        >
          <div
            className="about-visual"
            aria-hidden="true"
          >
            <div className="about-visual-inner">
              <svg
                viewBox="0 0 120 120"
                fill="none"
              >
                <path
                  d="M60 8 L104 60 L60 112 L16 60 Z"
                  stroke="#C69A46"
                  strokeWidth="1"
                  opacity="0.4"
                />

                <path
                  d="M60 24 L88 60 L60 96 L32 60 Z"
                  stroke="#146C43"
                  strokeWidth="1"
                  opacity="0.3"
                />

                <circle
                  cx="60"
                  cy="60"
                  r="20"
                  stroke="#C31F2B"
                  strokeWidth="1"
                  opacity="0.25"
                />

                <circle
                  cx="60"
                  cy="60"
                  r="8"
                  fill="#146C43"
                  opacity="0.15"
                />
              </svg>
            </div>
          </div>

          <div className="about-content">
            <span
              className="about-decorator"
              aria-hidden="true"
            />

            <span className="section-kicker">
              <i />
              {language === 'ar'
                ? 'من نحن'
                : 'About Us'}
            </span>

            <h2>{title}</h2>

            <p>{description}</p>
          </div>
        </div>

      </div>
    </section>
  );
}