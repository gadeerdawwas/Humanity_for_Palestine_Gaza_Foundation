import { useReveal } from '@/hooks/useReveal';

type FooterProps = { copy: any };

export function Footer({ copy }: FooterProps) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <footer className="site-footer">
      <div className="section-shell">
        <div className="footer-grid reveal" ref={ref}>
          <div className="footer-brand">
            <span className="brand-mark" aria-hidden="true"><span /><span /><span /><i /></span>
            <div>
              <strong>{copy.footer.name}</strong>
              <small>{copy.identity.tagline}</small>
            </div>
          </div>
          <div className="footer-col">
            <h4>{copy.footer.quickLinks}</h4>
            <ul>
              {copy.footer.links.map((link: string, i: number) => (
                <li key={i}><a href="#services">{link}</a></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>{copy.footer.contact}</h4>
            <a className="footer-donate" href="/#contact">{copy.footer.donate}</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{copy.footer.rights}</span>
        </div>
      </div>
    </footer>
  );
}
