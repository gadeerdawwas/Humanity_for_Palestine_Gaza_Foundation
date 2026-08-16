import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Services } from '@/components/Services';
import { Projects } from '@/components/Projects';
import { Gallery } from '@/components/Gallery';
import { About } from '@/components/About';
import { Cta } from '@/components/Cta';
import { ContactForm } from '@/components/ContactForm';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';

export function HomePage() {
  const { language, copy, setLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <div className="app-shell" id="top">
      <Header language={language} copy={copy} onLanguageChange={setLanguage} />
      <main>
        <Hero copy={copy} language={language} />
        <Services copy={copy} language={language} />
        <Projects copy={copy} language={language} />
        <Gallery copy={copy} language={language} />
        <About copy={copy} />
        <Cta copy={copy} language={language} />
        <ContactForm copy={copy} />
      </main>
      <Footer copy={copy} />
    </div>
  );
}
