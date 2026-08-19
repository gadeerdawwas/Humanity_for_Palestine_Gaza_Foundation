import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';

import { supabase } from '@/lib/supabase';

type PartnersProps = {
  language: 'ar' | 'en';
};

type Partner = {
  id: string;
  type: 'organization' | 'person';
  name_ar: string | null;
  name_en: string | null;
  role_ar: string | null;
  role_en: string | null;
  image_url: string;
  website_url: string | null;
  display_order: number;
  enabled: boolean;
};

export function Partners({
  language,
}: PartnersProps) {
  const isRtl = language === 'ar';

  const [partners, setPartners] =
    useState<Partner[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadPartners = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('partners')
        .select(`
          id,
          type,
          name_ar,
          name_en,
          role_ar,
          role_en,
          image_url,
          website_url,
          display_order,
          enabled
        `)
        .eq('enabled', true)
        .order('display_order', {
          ascending: true,
        });

      if (error) {
        console.error(
          'LOAD PARTNERS ERROR:',
          error
        );

        setPartners([]);
      } else {
        setPartners(
          (data as Partner[]) || []
        );
      }

      setLoading(false);
    };

    loadPartners();
  }, []);

  if (!loading && partners.length === 0) {
    return null;
  }

  const copy = isRtl
    ? {
        kicker: 'شركاؤنا',
        title: 'شركاء نعتز بثقتهم',
        intro:
          'نعمل جنبًا إلى جنب مع أفراد ومؤسسات يشاركوننا الإيمان بالكرامة الإنسانية والعمل من أجل غزة.',
      }
    : {
        kicker: 'Our Partners',
        title: 'Partners We Are Proud to Work With',
        intro:
          'We work alongside individuals and organizations who share our commitment to dignity, humanity, and meaningful support for Gaza.',
      };

  return (
    <section
      className="partners-section"
      id="partners"
    >
      <div className="section-shell">

        <div className="section-heading partners-heading">
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

        {loading ? (
          <div className="section-loading" />
        ) : (
          <div className="partners-grid">
            {partners.map((partner) => {
              const name = isRtl
                ? partner.name_ar
                : partner.name_en;

              const role = isRtl
                ? partner.role_ar
                : partner.role_en;

              const content = (
                <>
                  <div
                    className={`partner-image-wrap ${
                      partner.type === 'organization'
                        ? 'organization'
                        : 'person'
                    }`}
                  >
                    <img
                      src={partner.image_url}
                      alt={name || 'Partner'}
                      loading="lazy"
                    />
                  </div>

                  {(name || role) && (
                    <div className="partner-copy">
                      {name && (
                        <h3>
                          {name}
                        </h3>
                      )}

                      {role && (
                        <p>
                          {role}
                        </p>
                      )}
                    </div>
                  )}

                  {partner.website_url && (
                    <span
                      className="partner-external"
                      aria-hidden="true"
                    >
                      <ExternalLink
                        size={15}
                      />
                    </span>
                  )}
                </>
              );

              return partner.website_url ? (
                <a
                  key={partner.id}
                  className="partner-card"
                  href={partner.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {content}
                </a>
              ) : (
                <article
                  key={partner.id}
                  className="partner-card"
                >
                  {content}
                </article>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}