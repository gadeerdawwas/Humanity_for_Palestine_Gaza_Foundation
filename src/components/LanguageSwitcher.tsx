import { Globe2 } from 'lucide-react';

type Language = 'ar' | 'en';

type LanguageSwitcherProps = {
  language: Language;
  onChange: (language: Language) => void;
};

export function LanguageSwitcher({ language, onChange }: LanguageSwitcherProps) {
  return (
    <div className="language-switcher" aria-label="Language selection">
      <Globe2 size={15} strokeWidth={1.7} />
      <button className={language === 'ar' ? 'language-option active' : 'language-option'} onClick={() => onChange('ar')} type="button">AR</button>
      <span className="language-divider" />
      <button className={language === 'en' ? 'language-option active' : 'language-option'} onClick={() => onChange('en')} type="button">EN</button>
    </div>
  );
}
