import { useEffect, useState } from 'react';
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Youtube,
} from 'lucide-react';

import { useReveal } from '@/hooks/useReveal';
import { supabase } from '@/lib/supabase';

type FooterProps = {
  copy: any;
  language: 'ar' | 'en';
};

type FooterSettings = {
  site_logo_url: string;

  organization_name_ar: string;
  organization_name_en: string;
  organization_short_name_ar: string;
  organization_short_name_en: string;

  footer_text_ar: string;
  footer_text_en: string;
  copyright_ar: string;
  copyright_en: string;

  email: string;
  phone: string;
  phone_enabled: boolean;
  whatsapp: string;
  whatsapp_enabled: boolean;
  address_ar: string;
  address_en: string;
  address_enabled: boolean;

  donation_url: string;
  donation_enabled: boolean;
  donation_label_ar: string;
  donation_label_en: string;

  instagram: string;
  instagram_enabled: boolean;
  facebook_url: string;
  facebook_enabled: boolean;
  twitter_url: string;
  twitter_enabled: boolean;
  youtube_url: string;
  youtube_enabled: boolean;
  linkedin_url: string;
  linkedin_enabled: boolean;
  tiktok_url: string;
  tiktok_enabled: boolean;
};

function normalizeWhatsApp(
  value: string
) {
  return value.replace(/\D/g, '');
}

function XIcon() {
  return (
    <span className="footer-custom-icon">
      𝕏
    </span>
  );
}

function TikTokIcon() {
  return (
    <span className="footer-custom-icon">
      ♪
    </span>
  );
}

function WhatsAppIcon() {
  return (
    <span className="footer-custom-icon footer-wa-icon">
      W
    </span>
  );
}

export function Footer({
  copy,
  language,
}: FooterProps) {
  const ref =
    useReveal<HTMLDivElement>();

  const isRtl =
    language === 'ar';

  const [settings, setSettings] =
    useState<FooterSettings>({
      site_logo_url: '',

      organization_name_ar:
        'الإنسانية من أجل فلسطين – غزة',
      organization_name_en:
        'Humanity for Palestine – Gaza',

      organization_short_name_ar:
        'الإنسانية لفلسطين',
      organization_short_name_en:
        'Humanity for Palestine',

      footer_text_ar:
        'نعمل من أجل دعم الأسر والأطفال والفئات الأكثر احتياجًا في قطاع غزة.',
      footer_text_en:
        'Working to support families, children, and vulnerable communities across Gaza.',

      copyright_ar:
        'جميع الحقوق محفوظة – الإنسانية من أجل فلسطين – غزة',
      copyright_en:
        'All rights reserved – Humanity for Palestine – Gaza',

      email: '',
      phone: '',
      phone_enabled: true,
      whatsapp: '',
      whatsapp_enabled: true,
      address_ar: '',
      address_en: '',
      address_enabled: true,

      donation_url: '',
      donation_enabled: true,
      donation_label_ar:
        'تبرع الآن',
      donation_label_en:
        'Donate Now',

      instagram: '',
      instagram_enabled: false,
      facebook_url: '',
      facebook_enabled: false,
      twitter_url: '',
      twitter_enabled: false,
      youtube_url: '',
      youtube_enabled: false,
      linkedin_url: '',
      linkedin_enabled: false,
      tiktok_url: '',
      tiktok_enabled: false,
    });

  useEffect(() => {
    const loadSettings =
      async () => {
        const { data, error } =
          await supabase
            .from('site_settings')
            .select('key,value')
            .in('key', [
              'site_logo_url',

              'organization_name_ar',
              'organization_name_en',
              'organization_short_name_ar',
              'organization_short_name_en',

              'footer_text_ar',
              'footer_text_en',
              'copyright_ar',
              'copyright_en',

              'email',

              'phone',
              'phone_enabled',

              'whatsapp',
              'whatsapp_enabled',

              'address_ar',
              'address_en',
              'address_enabled',

              'donation_url',
              'donation_enabled',
              'donation_label_ar',
              'donation_label_en',

              'instagram',
              'instagram_enabled',

              'facebook_url',
              'facebook_enabled',

              'twitter_url',
              'twitter_enabled',

              'youtube_url',
              'youtube_enabled',

              'linkedin_url',
              'linkedin_enabled',

              'tiktok_url',
              'tiktok_enabled',
            ]);

        if (error) {
          console.error(
            'LOAD FOOTER SETTINGS ERROR:',
            error
          );

          return;
        }

        const values:
          Record<string, string> = {};

        (data || []).forEach(
          (item: {
            key: string;
            value: string | null;
          }) => {
            values[item.key] =
              item.value || '';
          }
        );

        setSettings(
          (previous) => ({
            ...previous,

            site_logo_url:
              values.site_logo_url ||
              '',

            organization_name_ar:
              values.organization_name_ar ||
              previous.organization_name_ar,

            organization_name_en:
              values.organization_name_en ||
              previous.organization_name_en,

            organization_short_name_ar:
              values.organization_short_name_ar ||
              previous.organization_short_name_ar,

            organization_short_name_en:
              values.organization_short_name_en ||
              previous.organization_short_name_en,

            footer_text_ar:
              values.footer_text_ar ||
              previous.footer_text_ar,

            footer_text_en:
              values.footer_text_en ||
              previous.footer_text_en,

            copyright_ar:
              values.copyright_ar ||
              previous.copyright_ar,

            copyright_en:
              values.copyright_en ||
              previous.copyright_en,

            email:
              values.email || '',

            phone:
              values.phone || '',

            phone_enabled:
              values.phone_enabled !==
              'false',

            whatsapp:
              values.whatsapp || '',

            whatsapp_enabled:
              values.whatsapp_enabled !==
              'false',

            address_ar:
              values.address_ar || '',

            address_en:
              values.address_en || '',

            address_enabled:
              values.address_enabled !==
              'false',

            donation_url:
              values.donation_url || '',

            donation_enabled:
              values.donation_enabled !==
              'false',

            donation_label_ar:
              values.donation_label_ar ||
              previous.donation_label_ar,

            donation_label_en:
              values.donation_label_en ||
              previous.donation_label_en,

            instagram:
              values.instagram || '',

            instagram_enabled:
              values.instagram_enabled ===
              'true',

            facebook_url:
              values.facebook_url || '',

            facebook_enabled:
              values.facebook_enabled ===
              'true',

            twitter_url:
              values.twitter_url || '',

            twitter_enabled:
              values.twitter_enabled ===
              'true',

            youtube_url:
              values.youtube_url || '',

            youtube_enabled:
              values.youtube_enabled ===
              'true',

            linkedin_url:
              values.linkedin_url || '',

            linkedin_enabled:
              values.linkedin_enabled ===
              'true',

            tiktok_url:
              values.tiktok_url || '',

            tiktok_enabled:
              values.tiktok_enabled ===
              'true',
          })
        );
      };

    loadSettings();
  }, []);

  const organizationName =
    isRtl
      ? settings.organization_name_ar
      : settings.organization_name_en;

  const shortName =
    isRtl
      ? settings.organization_short_name_ar
      : settings.organization_short_name_en;

  const footerText =
    isRtl
      ? settings.footer_text_ar
      : settings.footer_text_en;

  const copyright =
    isRtl
      ? settings.copyright_ar
      : settings.copyright_en;

  const address =
    isRtl
      ? settings.address_ar
      : settings.address_en;

  const whatsappNumber =
    normalizeWhatsApp(
      settings.whatsapp
    );

  const quickLinks =
    isRtl
      ? [
          {
            label: 'الرئيسية',
            href: '/#home',
          },
          {
            label: 'الخدمات',
            href: '/#services',
          },
          {
            label: 'المبادرات',
            href: '/#initiatives',
          },
          {
            label: 'المشاريع',
            href: '/#projects',
          },
          {
            label: 'المعرض',
            href: '/#gallery',
          },
          {
            label: 'من نحن',
            href: '/#about',
          },
          {
            label: 'تواصل معنا',
            href: '/#contact',
          },
        ]
      : [
          {
            label: 'Home',
            href: '/#home',
          },
          {
            label: 'Services',
            href: '/#services',
          },
          {
            label: 'Initiatives',
            href: '/#initiatives',
          },
          {
            label: 'Projects',
            href: '/#projects',
          },
          {
            label: 'Gallery',
            href: '/#gallery',
          },
          {
            label: 'About Us',
            href: '/#about',
          },
          {
            label: 'Contact',
            href: '/#contact',
          },
        ];

  const socialLinks = [
    {
      key: 'instagram',
      enabled:
        settings.instagram_enabled &&
        !!settings.instagram,
      href:
        settings.instagram,
      label:
        'Instagram',
      icon:
        Instagram,
    },
    {
      key: 'facebook',
      enabled:
        settings.facebook_enabled &&
        !!settings.facebook_url,
      href:
        settings.facebook_url,
      label:
        'Facebook',
      icon:
        Facebook,
    },
    {
      key: 'twitter',
      enabled:
        settings.twitter_enabled &&
        !!settings.twitter_url,
      href:
        settings.twitter_url,
      label:
        'X / Twitter',
      icon:
        XIcon,
    },
    {
      key: 'youtube',
      enabled:
        settings.youtube_enabled &&
        !!settings.youtube_url,
      href:
        settings.youtube_url,
      label:
        'YouTube',
      icon:
        Youtube,
    },
    {
      key: 'linkedin',
      enabled:
        settings.linkedin_enabled &&
        !!settings.linkedin_url,
      href:
        settings.linkedin_url,
      label:
        'LinkedIn',
      icon:
        Linkedin,
    },
    {
      key: 'tiktok',
      enabled:
        settings.tiktok_enabled &&
        !!settings.tiktok_url,
      href:
        settings.tiktok_url,
      label:
        'TikTok',
      icon:
        TikTokIcon,
    },
  ].filter(
    (item) =>
      item.enabled
  );

  return (
    <footer className="site-footer">
      <div className="section-shell">

        <div
          className="footer-main reveal"
          ref={ref}
        >
          <div className="footer-about-column">

            <a
              href="/#home"
              className="footer-brand"
            >
              {settings.site_logo_url ? (
                <img
                  src={
                    settings.site_logo_url
                  }
                  alt={
                    organizationName
                  }
                  className="footer-logo-image"
                />
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

              <div>
                <strong>
                  {organizationName}
                </strong>

                <small>
                  {shortName}
                </small>
              </div>
            </a>

            <p className="footer-description">
              {footerText}
            </p>

            {socialLinks.length >
              0 && (
              <div className="footer-social-links">
                {socialLinks.map(
                  ({
                    key,
                    href,
                    label,
                    icon: Icon,
                  }) => (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      title={label}
                    >
                      <Icon
                        size={17}
                      />
                    </a>
                  )
                )}
              </div>
            )}

          </div>

          <div className="footer-col">
            <h4>
              {isRtl
                ? 'روابط سريعة'
                : 'Quick Links'}
            </h4>

            <ul>
              {quickLinks.map(
                (link) => (
                  <li
                    key={
                      link.href
                    }
                  >
                    <a
                      href={
                        link.href
                      }
                    >
                      {link.label}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="footer-col footer-contact-col">
            <h4>
              {isRtl
                ? 'تواصل معنا'
                : 'Contact Us'}
            </h4>

            <div className="footer-contact-list">
              {settings.email && (
                <a
                  href={`mailto:${settings.email}`}
                >
                  <Mail
                    size={16}
                  />
                  <span>
                    {
                      settings.email
                    }
                  </span>
                </a>
              )}

              {settings.phone_enabled &&
                settings.phone && (
                  <a
                    href={`tel:${settings.phone}`}
                  >
                    <Phone
                      size={16}
                    />
                    <span>
                      {
                        settings.phone
                      }
                    </span>
                  </a>
                )}

              {settings.whatsapp_enabled &&
                whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <WhatsAppIcon />
                    <span>
                      WhatsApp
                    </span>
                  </a>
                )}

              {settings.address_enabled &&
                address && (
                  <div>
                    <MapPin
                      size={16}
                    />
                    <span>
                      {address}
                    </span>
                  </div>
                )}
            </div>
          </div>

          <div className="footer-col footer-support-col">
            <h4>
              {isRtl
                ? 'ساهم معنا'
                : 'Support Us'}
            </h4>

            <p>
              {isRtl
                ? 'دعمك يساعدنا على مواصلة العمل الإنساني والوصول إلى المزيد من الأسر المحتاجة.'
                : 'Your support helps us continue our humanitarian work and reach more families in need.'}
            </p>

            {settings.donation_enabled &&
            settings.donation_url ? (
              <a
                className="footer-donate primary"
                href={
                  settings.donation_url
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                {isRtl
                  ? settings.donation_label_ar
                  : settings.donation_label_en}
              </a>
            ) : (
              <a
                className="footer-donate primary"
                href="/#contact"
              >
                {isRtl
                  ? 'تواصل معنا'
                  : 'Contact Us'}
              </a>
            )}
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            ©{' '}
            {new Date().getFullYear()}{' '}
            {copyright}
          </span>

          <a href="/#home">
            {isRtl
              ? 'العودة إلى الأعلى'
              : 'Back to top'}
          </a>
        </div>
      </div>
    </footer>
  );
}