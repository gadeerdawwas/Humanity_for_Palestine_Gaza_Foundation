import { Menu, X, ArrowUpLeft, ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LanguageSwitcher } from './LanguageSwitcher';

type HeaderProps = {
  language: 'ar' | 'en';
  copy: any;
  onLanguageChange: (language: 'ar' | 'en') => void;
};

export function Header({ language, copy, onLanguageChange }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const Arrow = language === 'ar' ? ArrowUpLeft : ArrowUpRight;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <header className={scrolled ? 'site-header scrolled' : 'site-header'}>
      <div className="header-inner">
        <a className="brand" href="/" onClick={closeMenu}>
          <span className="brand-mark" aria-hidden="true"><span /><span /><span /><i /></span>
          <span className="brand-copy">
            <strong>{copy.identity.name}</strong>
            <b>{copy.identity.place}</b>
            <small>{copy.identity.tagline}</small>
          </span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="/#home">{copy.nav.home}</a>
          <a href="/#about">{copy.nav.about}</a>
          <a className="active" href="/#services">{copy.nav.services}</a>
          <a href="/#projects">{copy.nav.projects}</a>
          <a href="/#gallery">{copy.nav.gallery}</a>
          <a href="/#contact">{copy.nav.contact}</a>
        </nav>

        <div className="header-actions">
          <LanguageSwitcher language={language} onChange={onLanguageChange} />
          <a className="donate-button header-donate" href="/#contact">{copy.nav.donate} <Arrow size={16} /></a>
          <button className="menu-toggle" type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={23} /> : <Menu size={23} />}</button>
        </div>
      </div>

      <div className={open ? 'mobile-menu open' : 'mobile-menu'}>
        <nav aria-label="Mobile navigation">
          <a href="/#home" onClick={closeMenu}>{copy.nav.home}</a>
          <a href="/#about" onClick={closeMenu}>{copy.nav.about}</a>
          <a href="/#services" onClick={closeMenu}>{copy.nav.services}</a>
          <a href="/#projects" onClick={closeMenu}>{copy.nav.projects}</a>
          <a href="/#gallery" onClick={closeMenu}>{copy.nav.gallery}</a>
          <a href="/#contact" onClick={closeMenu}>{copy.nav.contact}</a>
        </nav>
        <a className="donate-button" href="/#contact" onClick={closeMenu}>{copy.nav.donate} <Arrow size={17} /></a>
      </div>
    </header>
  );
}
