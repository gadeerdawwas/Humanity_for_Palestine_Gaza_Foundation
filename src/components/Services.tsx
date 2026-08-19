import { useEffect, useState } from 'react';

import { ServiceCard } from './ServiceCard';
import { TatreezDivider } from './TatreezDivider';
import { supabase, type Service } from '@/lib/supabase';

type ServicesProps = {
  copy: any;
  language: 'ar' | 'en';
};

type ServiceItemView = {
  id: string;
  title: string;
  description: string;
  accent: string;
  icon: string;
};

export function Services({
  copy,
  language,
}: ServicesProps) {
  const [items, setItems] =
    useState<ServiceItemView[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order', {
          ascending: true,
        });

      if (error || !data) {
        console.error(
          'LOAD SERVICES ERROR:',
          error
        );

        setItems([]);
        setLoading(false);
        return;
      }

      const mapped: ServiceItemView[] =
        (data as Service[]).map((service) => ({
          id: service.id,

          title:
            language === 'ar'
              ? service.title_ar
              : service.title_en,

          description:
            language === 'ar'
              ? service.description_ar
              : service.description_en,

          accent:
            service.accent_color,

          icon:
            service.icon_name,
        }));

      setItems(mapped);
      setLoading(false);
    };

    loadServices();
  }, [language]);

  return (
    <section
      className="services-section"
      id="services"
    >
      <TatreezDivider />

      <div className="section-shell">

        <div className="section-heading">
          <span className="section-kicker">
            <i />
            {copy.services.kicker}
          </span>

          <h2>
            {copy.services.title}
          </h2>

          <p>
            {copy.services.intro}
          </p>
        </div>

        <div className="services-grid">

          {loading ? (
            <div className="section-loading" />
          ) : items.length > 0 ? (
            items.map((item) => (
              <ServiceCard
                key={item.id}
                item={item}
              />
            ))
          ) : null}

        </div>

      </div>
    </section>
  );
}