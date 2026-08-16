import { ArrowUpLeft, ArrowUpRight } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';

type CtaProps = { copy: any; language: 'ar' | 'en' };

export function Cta({ copy, language }: CtaProps) {
  const ref = useReveal<HTMLDivElement>();
  const Arrow = language === 'ar' ? ArrowUpLeft : ArrowUpRight;
  return (
    <section className="cta-section" id="contact">
      <div className="section-shell">
        <div className="cta-card reveal" ref={ref}>
          <span className="cta-decorator" aria-hidden="true" />
          <span className="cta-decorator two" aria-hidden="true" />
          <h2>{copy.cta.title}</h2>
          <p>{copy.cta.body}</p>
          <div className="cta-actions">
            <a className="donate-button" href="/#contact">{copy.cta.donate} <Arrow size={18} /></a>
            <a className="outline-button" href="/#contact">{copy.cta.contact}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
