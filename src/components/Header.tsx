import {
  Menu,
  X,
  ArrowUpLeft,
  ArrowUpRight,
} from 'lucide-react';

import {
  useEffect,
  useState,
} from 'react';

import { LanguageSwitcher } from './LanguageSwitcher';
import { supabase } from '@/lib/supabase';

type HeaderProps = {
  language: 'ar' | 'en';
  copy: any;
  onLanguageChange: (
    language: 'ar' | 'en'
  ) => void;
};

type SectionId =
  | 'home'
  | 'services'
  | 'initiatives'
  | 'projects'
  | 'gallery'
  | 'about'
  | 'contact';

export function Header({
  language,
  copy,
  onLanguageChange,
}: HeaderProps) {
  const [scrolled, setScrolled] =
    useState(false);

  const [open, setOpen] =
    useState(false);

  const [activeSection, setActiveSection] =
    useState<SectionId>('home');

  const [logoUrl, setLogoUrl] =
    useState('');

  const Arrow =
    language === 'ar'
      ? ArrowUpLeft
      : ArrowUpRight;

  const initiativeLabel =
    language === 'ar'
      ? 'المبادرات'
      : 'Initiatives';

  const menuItems: Array<{
    id: SectionId;
    label: string;
  }> = [
    {
      id: 'home',
      label: copy.nav.home,
    },
    {
      id: 'services',
      label: copy.nav.services,
    },
    {
      id: 'initiatives',
      label:
        copy.nav.initiatives ||
        initiativeLabel,
    },
    {
      id: 'projects',
      label: copy.nav.projects,
    },
    {
      id: 'gallery',
      label: copy.nav.gallery,
    },
    {
      id: 'about',
      label: copy.nav.about,
    },
    {
      id: 'contact',
      label: copy.nav.contact,
    },
  ];

  /* =========================================
     LOAD WEBSITE LOGO
     ========================================= */

  useEffect(() => {
    const loadLogo = async () => {
      const { data, error } =
        await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'site_logo_url')
          .maybeSingle();

      if (error) {
        console.error(
          'LOAD LOGO ERROR:',
          error
        );

        return;
      }

      const savedLogo =
        data?.value?.trim() || '';

      setLogoUrl(savedLogo);
if (savedLogo) {
  document
    .querySelectorAll(
      "link[rel='icon'], link[rel='shortcut icon']"
    )
    .forEach((icon) => icon.remove());

  const favicon = document.createElement('link');

  favicon.rel = 'icon';
  favicon.href = `${savedLogo}?v=${Date.now()}`;

  document.head.appendChild(favicon);
}
      /*
        نفس شعار الموقع يصبح
        Favicon في تبويب المتصفح
      */
      if (savedLogo) {
        let favicon =
          document.querySelector(
            "link[rel='icon']"
          ) as HTMLLinkElement | null;

        if (!favicon) {
          favicon =
            document.createElement(
              'link'
            );

          favicon.rel = 'icon';

          document.head.appendChild(
            favicon
          );
        }

        favicon.href = savedLogo;

        /*
          Apple / mobile icon
        */
        let appleIcon =
          document.querySelector(
            "link[rel='apple-touch-icon']"
          ) as HTMLLinkElement | null;

        if (!appleIcon) {
          appleIcon =
            document.createElement(
              'link'
            );

          appleIcon.rel =
            'apple-touch-icon';

          document.head.appendChild(
            appleIcon
          );
        }

        appleIcon.href = savedLogo;
      }
    };

    loadLogo();
  }, []);

  /* =========================================
     PAGE TITLE
     ========================================= */

  useEffect(() => {
    document.title =
      language === 'ar'
        ? 'الإنسانية من أجل فلسطين – غزة'
        : 'Humanity for Palestine – Gaza';
  }, [language]);

  /* =========================================
     ACTIVE NAVIGATION
     ========================================= */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(
        window.scrollY > 18
      );

      const sections: SectionId[] = [
        'home',
        'services',
        'initiatives',
        'projects',
        'gallery',
        'about',
        'contact',
      ];

      let current: SectionId =
        'home';

      for (const id of sections) {
        const element =
          document.getElementById(id);

        if (!element) continue;

        const rect =
          element.getBoundingClientRect();

        if (rect.top <= 150) {
          current = id;
        }
      }

      setActiveSection(current);
    };

    handleScroll();

    window.addEventListener(
      'scroll',
      handleScroll,
      {
        passive: true,
      }
    );

    return () =>
      window.removeEventListener(
        'scroll',
        handleScroll
      );
  }, []);

  /* =========================================
     MOBILE MENU
     ========================================= */

  useEffect(() => {
    document.body.style.overflow =
      open ? 'hidden' : '';

    return () => {
      document.body.style.overflow =
        '';
    };
  }, [open]);

  const closeMenu = () =>
    setOpen(false);

  const handleNavClick = (
    id: SectionId
  ) => {
    closeMenu();

    if (
      window.location.pathname !== '/'
    ) {
      window.location.href =
        `/#${id}`;

      return;
    }

    const section =
      document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <header
      className={
        scrolled
          ? 'site-header scrolled'
          : 'site-header'
      }
    >
      <div className="header-inner">

        {/* BRAND */}

        <a
          className="brand"
          href="/#home"
          onClick={closeMenu}
        >
          {logoUrl ? (
            <span className="site-logo-wrapper">
              <img
                src={logoUrl}
                alt={copy.identity.name}
                className="site-logo-image"
              />
            </span>
          ) : (
            <span
              className="brand-mark"
              aria-hidden="true"
            >
              <span />
              <span />
              <span />
              <i />
            </span>
          )}

          <span className="brand-copy">
            <strong>
              {copy.identity.name}
            </strong>

            <b>
              {copy.identity.place}
            </b>

            <small>
              {copy.identity.tagline}
            </small>
          </span>
        </a>

        {/* DESKTOP NAV */}

        <nav
          className="desktop-nav"
          aria-label="Primary navigation"
        >
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                handleNavClick(item.id)
              }
              className={
                activeSection ===
                item.id
                  ? 'active'
                  : ''
              }
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* ACTIONS */}

        <div className="header-actions">

          <LanguageSwitcher
            language={language}
            onChange={
              onLanguageChange
            }
          />

          <a
            className="donate-button header-donate"
            href="/#support"
          >
            {copy.nav.donate}

            <Arrow size={16} />
          </a>

          <button
            className="menu-toggle"
            type="button"
            aria-label={
              open
                ? 'Close menu'
                : 'Open menu'
            }
            aria-expanded={open}
            onClick={() =>
              setOpen(
                (previous) =>
                  !previous
              )
            }
          >
            {open ? (
              <X size={23} />
            ) : (
              <Menu size={23} />
            )}
          </button>

        </div>
      </div>

      {/* MOBILE MENU */}

      <div
        className={
          open
            ? 'mobile-menu open'
            : 'mobile-menu'
        }
      >
        <nav
          aria-label="Mobile navigation"
        >
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                handleNavClick(item.id)
              }
              className={
                activeSection ===
                item.id
                  ? 'active'
                  : ''
              }
            >
              {item.label}
            </button>
          ))}
        </nav>

        <a
          className="donate-button"
          href="/#support"
          onClick={closeMenu}
        >
          {copy.nav.donate}

          <Arrow size={17} />
        </a>
      </div>
    </header>
  );
}