import {
  ArrowUpLeft,
  ArrowUpRight,
} from 'lucide-react';

import {
  useEffect,
  useState,
} from 'react';

import { useReveal } from '@/hooks/useReveal';
import { supabase } from '@/lib/supabase';

type CtaProps = {
  copy: any;
  language: 'ar' | 'en';
};

type CtaSettings = {
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;

  donation_url: string;
  donation_enabled: boolean;
  donation_label_ar: string;
  donation_label_en: string;

  whatsapp: string;
  whatsapp_enabled: boolean;
};

export function Cta({
  copy,
  language,
}: CtaProps) {
  const ref = useReveal<HTMLDivElement>();
  const isRtl = language === 'ar';

  const Arrow = isRtl
    ? ArrowUpLeft
    : ArrowUpRight;

  const [settings, setSettings] =
    useState<CtaSettings>({
      title_ar: '',
      title_en: '',
      description_ar: '',
      description_en: '',

      donation_url: '',
      donation_enabled: true,
      donation_label_ar: '',
      donation_label_en: '',

      whatsapp: '',
      whatsapp_enabled: true,
    });

  useEffect(() => {
    const loadCtaSettings = async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key,value')
        .in('key', [
          'donation_section_title_ar',
          'donation_section_title_en',

          'donation_section_description_ar',
          'donation_section_description_en',

          'donation_url',
          'donation_enabled',

          'donation_label_ar',
          'donation_label_en',

          'whatsapp',
          'whatsapp_enabled',
        ]);

      if (error) {
        console.error(
          'LOAD CTA SETTINGS ERROR:',
          error
        );

        return;
      }

      const values: Record<string, string> = {};

      (data || []).forEach(
        (item: {
          key: string;
          value: string | null;
        }) => {
          values[item.key] =
            item.value || '';
        }
      );

      setSettings({
        title_ar:
          values.donation_section_title_ar ||
          '',

        title_en:
          values.donation_section_title_en ||
          '',

        description_ar:
          values.donation_section_description_ar ||
          '',

        description_en:
          values.donation_section_description_en ||
          '',

        donation_url:
          values.donation_url || '',

        donation_enabled:
          values.donation_enabled !== 'false',

        donation_label_ar:
          values.donation_label_ar || '',

        donation_label_en:
          values.donation_label_en || '',

        whatsapp:
          values.whatsapp || '',

        whatsapp_enabled:
          values.whatsapp_enabled !== 'false',
      });
    };

    loadCtaSettings();
  }, []);

  const title = isRtl
    ? settings.title_ar ||
      copy.cta.title
    : settings.title_en ||
      copy.cta.title;

  const description = isRtl
    ? settings.description_ar ||
      copy.cta.body
    : settings.description_en ||
      copy.cta.body;

  const donationLabel = isRtl
    ? settings.donation_label_ar ||
      copy.cta.donate
    : settings.donation_label_en ||
      copy.cta.donate;

  const whatsappNumber =
    settings.whatsapp.replace(/\D/g, '');

  const whatsappUrl =
    whatsappNumber
      ? `https://wa.me/${whatsappNumber}`
      : '';

  return (
    <section
      className="cta-section"
      id="support"
    >
      <div className="section-shell">

        <div
          className="cta-card reveal"
          ref={ref}
        >
          <span
            className="cta-decorator"
            aria-hidden="true"
          />

          <span
            className="cta-decorator two"
            aria-hidden="true"
          />

          <h2>
            {title}
          </h2>

          <p>
            {description}
          </p>

          <div className="cta-actions">

            {settings.donation_enabled &&
              settings.donation_url && (
                <a
                  className="donate-button"
                  href={settings.donation_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {donationLabel}

                  <Arrow size={18} />
                </a>
              )}

            {settings.whatsapp_enabled &&
              whatsappUrl && (
                <a
                  className="outline-button"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {copy.cta.contact}
                </a>
              )}

          </div>

        </div>

      </div>
    </section>
  );
}