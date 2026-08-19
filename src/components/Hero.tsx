import { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUpLeft,
  ArrowUpRight,
} from 'lucide-react';

import { StitchedLine } from './TatreezDivider';
import { supabase } from '@/lib/supabase';

const fallbackHeroImage =
  'https://images.pexels.com/photos/12671875/pexels-photo-12671875.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

type HeroProps = {
  copy: any;
  language: 'ar' | 'en';
};

export function Hero({
  copy,
  language,
}: HeroProps) {
  const isRtl = language === 'ar';

  const Arrow = isRtl
    ? ArrowUpLeft
    : ArrowUpRight;

  const [heroImage, setHeroImage] =
    useState('');

  useEffect(() => {
    const loadHeroImage = async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'hero_image_url')
        .maybeSingle();

      if (error) {
        console.error(
          'LOAD HERO IMAGE ERROR:',
          error
        );
        return;
      }

      const savedImage =
        data?.value?.trim();

      if (savedImage) {
        setHeroImage(savedImage);
      }
    };

    loadHeroImage();
  }, []);

  return (
    <section
      className="hero-section"
      id="home"
    >
      <div
        className="hero-pattern pattern-one"
        aria-hidden="true"
      />

      <div
        className="hero-pattern pattern-two"
        aria-hidden="true"
      />

      <div className="hero-shell">

        <div className="hero-copy">

          <div className="eyebrow">
            <span />
            {copy.hero.eyebrow}
            <span />
          </div>

          <h1>
            <span>
              {copy.hero.lineOne}
            </span>

            <em>
              {copy.hero.lineTwo}
            </em>
          </h1>

          <StitchedLine />

          <p>
            {copy.hero.description}
          </p>

          <div className="hero-actions">
            <a
              className="donate-button"
              href="#support"
            >
              {copy.hero.donate}
              <Arrow size={18} />
            </a>

            <a
              className="outline-button"
              href="#services"
            >
              {copy.hero.services}
            </a>
          </div>

          <a
            className="discover-link"
            href="#services"
          >
            <span>
              {copy.hero.discover}
            </span>

            <ArrowDown size={16} />
          </a>

        </div>

        <div className="hero-visual">
          <div
            className="visual-glow"
            aria-hidden="true"
          />

        {heroImage ? (
  <img
    src={heroImage}
    alt={
      isRtl
        ? 'الإنسانية من أجل فلسطين – غزة'
        : 'Humanity for Palestine – Gaza'
    }
  />
) : (
  <div className="hero-image-loading" />
)}

          <div className="visual-caption">
            <span>
              Humanity / Dignity / Hope
            </span>

            <i />

            <span>
              01
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}