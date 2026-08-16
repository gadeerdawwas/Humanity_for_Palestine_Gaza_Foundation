import { useEffect, useState } from 'react';
import { ServiceCard } from './ServiceCard';
import { TatreezDivider } from './TatreezDivider';
import { supabase, type Service } from '@/lib/supabase';

type ServicesProps = { copy: any; language: 'ar' | 'en' };

type ServiceItemView = {
  number: string;
  title: string;
  description: string;
  accent: string;
  icon: string;
};

export function Services({ copy, language }: ServicesProps) {
  const [items, setItems] = useState<ServiceItemView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order', { ascending: true });
      if (error || !data) {
        setItems([]);
        setLoading(false);
        return;
      }
      const mapped: ServiceItemView[] = (data as Service[]).map((s) => ({
        number: String(s.number).padStart(2, '0'),
        title: language === 'ar' ? s.title_ar : s.title_en,
        description: language === 'ar' ? s.description_ar : s.description_en,
        accent: s.accent_color,
        icon: s.icon_name,
      }));
      setItems(mapped);
      setLoading(false);
    })();
  }, [language]);

  return (
    <section className="services-section" id="services">
      <TatreezDivider />
      <div className="section-shell">
        <div className="section-heading">
          <span className="section-kicker"><i />{copy.services.kicker}</span>
          <h2>{copy.services.title}</h2>
          <p>{copy.services.intro}</p>
        </div>
        <div className="services-grid">
          {loading ? (
            <div className="section-loading" />
          ) : items.length > 0 ? (
            items.map((item) => <ServiceCard key={item.number} item={item} />)
          ) : null}
        </div>
      </div>
    </section>
  );
}
