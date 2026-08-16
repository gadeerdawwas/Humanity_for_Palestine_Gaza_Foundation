declare module '@/data/translations' {
  export interface NavCopy { home: string; about: string; services: string; projects: string; gallery: string; contact: string; donate: string; }
  export interface IdentityCopy { name: string; place: string; tagline: string; }
  export interface HeroCopy { eyebrow: string; lineOne: string; lineTwo: string; description: string; donate: string; services: string; discover: string; }
  export interface ServiceItem { number: string; title: string; description: string; accent: string; icon: string; }
  export interface ServicesCopy { kicker: string; title: string; intro: string; items: ServiceItem[]; }
  export interface ProjectItem { title: string; category: string; accent: string; status: 'ongoing' | 'completed'; image: string; description: string; }
  export interface ProjectsCopy { kicker: string; title: string; intro: string; learnMore: string; statusOngoing: string; statusCompleted: string; items: ProjectItem[]; }
  export interface GalleryItem { image: string; caption: string; }
  export interface GalleryCopy { kicker: string; title: string; intro: string; seeMore: string; items: GalleryItem[]; }
  export interface AboutCopy { kicker: string; title: string; body: string; }
  export interface ContactFormCopy { title: string; subtitle: string; name: string; namePlaceholder: string; email: string; emailPlaceholder: string; phone: string; phonePlaceholder: string; message: string; messagePlaceholder: string; submit: string; submitting: string; success: string; error: string; another: string; }
  export interface PagesCopy { galleryTitle: string; galleryIntro: string; loadMore: string; noMore: string; backToProjects: string; projectNotFound: string; projectNotFoundBody: string; backToGallery: string; contactUs: string; }
export interface CtaCopy { title: string; body: string; donate: string; contact: string; }
  export interface FooterCopy { name: string; quickLinks: string; contact: string; donate: string; rights: string; links: string[]; }
  export interface LanguageCopy {
    direction: 'rtl' | 'ltr';
    nav: NavCopy;
    identity: IdentityCopy;
    hero: HeroCopy;
    services: ServicesCopy;
    projects: ProjectsCopy;
    gallery: GalleryCopy;
    about: AboutCopy;
    cta: CtaCopy;
    contactForm: ContactFormCopy;
    pages: PagesCopy;
    footer: FooterCopy;
  }
  export const translations: { ar: LanguageCopy; en: LanguageCopy };
}
