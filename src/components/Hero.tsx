import { ArrowDown, ArrowUpLeft, ArrowUpRight } from 'lucide-react';
import { StitchedLine } from './TatreezDivider';

const heroImage = 'https://images.pexels.com/photos/12671875/pexels-photo-12671875.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

type HeroProps = { copy: any; language: 'ar' | 'en' };

export function Hero({ copy, language }: HeroProps) {
  const Arrow = language === 'ar' ? ArrowUpLeft : ArrowUpRight;
  return (
    <section className="hero-section" id="home">
      <div className="hero-pattern pattern-one" aria-hidden="true" />
      <div className="hero-pattern pattern-two" aria-hidden="true" />
      <div className="hero-shell">
        <div className="hero-copy">
          <div className="eyebrow"><span />{copy.hero.eyebrow}<span /></div>
          <h1><span>{copy.hero.lineOne}</span><em>{copy.hero.lineTwo}</em></h1>
          <StitchedLine />
          <p>{copy.hero.description}</p>
          <div className="hero-actions">
            <a className="donate-button" href="#contact">{copy.hero.donate} <Arrow size={18} /></a>
            <a className="outline-button" href="#services">{copy.hero.services}</a>
          </div>
          <a className="discover-link" href="#services"><span>{copy.hero.discover}</span><ArrowDown size={16} /></a>
        </div>
        <div className="hero-visual">
          <div className="visual-glow" />
          <img src={heroImage} alt="Children walking together" />
          <div className="visual-caption"><span>01</span><i /><span>Humanity / Dignity / Hope</span></div>
        </div>
      </div>
    </section>
  );
}
