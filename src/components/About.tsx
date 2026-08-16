import { useReveal } from '@/hooks/useReveal';

type AboutProps = { copy: any };

export function About({ copy }: AboutProps) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="about-section" id="about-section">
      <div className="section-shell">
        <div className="about-layout reveal" ref={ref}>
          <div className="about-visual" aria-hidden="true">
            <div className="about-visual-inner">
              <svg viewBox="0 0 120 120" fill="none">
                <path d="M60 8 L104 60 L60 112 L16 60 Z" stroke="#C69A46" strokeWidth="1" opacity="0.4" />
                <path d="M60 24 L88 60 L60 96 L32 60 Z" stroke="#146C43" strokeWidth="1" opacity="0.3" />
                <circle cx="60" cy="60" r="20" stroke="#C31F2B" strokeWidth="1" opacity="0.25" />
                <circle cx="60" cy="60" r="8" fill="#146C43" opacity="0.15" />
              </svg>
            </div>
          </div>
          <div className="about-content">
            <span className="about-decorator" aria-hidden="true" />
            <span className="section-kicker"><i />{copy.about.kicker}</span>
            <h2>{copy.about.title}</h2>
            <p>{copy.about.body}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
