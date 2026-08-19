import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Services } from '@/components/Services';
import { Initiatives } from '@/components/Initiatives';
import { Projects } from '@/components/Projects';
import { Gallery } from '@/components/Gallery';
import { About } from '@/components/About';
import { Cta } from '@/components/Cta';
import { ContactForm } from '@/components/ContactForm';
import { ImpactStats } from '@/components/ImpactStats';
import { Partners } from '@/components/Partners';
import { Footer } from '@/components/Footer';

import { useLanguage } from '@/context/LanguageContext';

export function HomePage() {
  const {
    language,
    copy,
    setLanguage,
  } = useLanguage();

  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(
        location.hash
      );

      if (element) {
        setTimeout(() => {
          element.scrollIntoView({
            behavior: 'smooth',
          });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <div
      className="app-shell"
      id="top"
    >
      <Header
        language={language}
        copy={copy}
        onLanguageChange={setLanguage}
      />

      <main>
        <Hero
          copy={copy}
          language={language}
        />

        <Services
          copy={copy}
          language={language}
        />

        <Initiatives
          copy={copy}
          language={language}
        />

        <Projects
          copy={copy}
          language={language}
        />

        <Gallery
          copy={copy}
          language={language}
        />

        <About
          copy={copy}
          language={language}
        />

        <Cta
          copy={copy}
          language={language}
        />

        <ImpactStats
          language={language}
        />

        <ContactForm
          copy={copy}
          language={language}
        />

        <Partners
          language={language}
        />
      </main>

      <Footer
        copy={copy}
        language={language}
      />
    </div>
  );
}