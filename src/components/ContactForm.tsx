import { useEffect, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Facebook,
  Instagram,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
  Youtube,
} from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { useReveal } from '@/hooks/useReveal';

type ContactFormProps = {
  copy: any;
  language: 'ar' | 'en';
};

type Status = 'idle' | 'submitting' | 'success' | 'error';

type ContactSettings = {
  email: string;

  phone: string;
  phone_enabled: boolean;

  whatsapp: string;
  whatsapp_enabled: boolean;

  address_ar: string;
  address_en: string;
  address_enabled: boolean;

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

function normalizeWhatsApp(value: string) {
  return value.replace(/\D/g, '');
}

export function ContactForm({
  copy,
  language,
}: ContactFormProps) {
  const form = copy.contactForm;
  const isRtl = language === 'ar';

  const ref = useReveal<HTMLDivElement>();

  const [status, setStatus] =
    useState<Status>('idle');

  const [errorMsg, setErrorMsg] =
    useState('');

  const [settings, setSettings] =
    useState<ContactSettings>({
      email: '',

      phone: '',
      phone_enabled: true,

      whatsapp: '',
      whatsapp_enabled: true,

      address_ar: '',
      address_en: '',
      address_enabled: true,

      instagram: '',
      instagram_enabled: true,

      facebook_url: '',
      facebook_enabled: true,

      twitter_url: '',
      twitter_enabled: true,

      youtube_url: '',
      youtube_enabled: false,

      linkedin_url: '',
      linkedin_enabled: false,

      tiktok_url: '',
      tiktok_enabled: false,
    });

  useEffect(() => {
    const loadContactSettings = async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key,value')
        .in('key', [
          'email',

          'phone',
          'phone_enabled',

          'whatsapp',
          'whatsapp_enabled',

          'address_ar',
          'address_en',
          'address_enabled',

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
          'LOAD CONTACT SETTINGS ERROR:',
          error
        );

        return;
      }

      const values: Record<string, string> = {};

      (data || []).forEach(
        (item: {
          key: string;
          value: string | null;
        }) => {
          values[item.key] =
            item.value || '';
        }
      );

      setSettings({
        email:
          values.email || '',

        phone:
          values.phone || '',

        phone_enabled:
          values.phone_enabled !== 'false',

        whatsapp:
          values.whatsapp || '',

        whatsapp_enabled:
          values.whatsapp_enabled !== 'false',

        address_ar:
          values.address_ar || '',

        address_en:
          values.address_en || '',

        address_enabled:
          values.address_enabled !== 'false',

        instagram:
          values.instagram || '',

        instagram_enabled:
          values.instagram_enabled !== 'false',

        facebook_url:
          values.facebook_url || '',

        facebook_enabled:
          values.facebook_enabled !== 'false',

        twitter_url:
          values.twitter_url || '',

        twitter_enabled:
          values.twitter_enabled !== 'false',

        youtube_url:
          values.youtube_url || '',

        youtube_enabled:
          values.youtube_enabled !== 'false',

        linkedin_url:
          values.linkedin_url || '',

        linkedin_enabled:
          values.linkedin_enabled !== 'false',

        tiktok_url:
          values.tiktok_url || '',

        tiktok_enabled:
          values.tiktok_enabled !== 'false',
      });
    };

    loadContactSettings();
  }, []);

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setStatus('submitting');
    setErrorMsg('');

    const formData =
      new FormData(e.currentTarget);

    const name =
      String(formData.get('name') || '').trim();

    const email =
      String(formData.get('email') || '').trim();

    const phone =
      String(formData.get('phone') || '').trim() ||
      null;

    const message =
      String(formData.get('message') || '').trim();

    if (!name || !email || !message) {
      setStatus('error');
      setErrorMsg(form.error);
      return;
    }

    const { error } = await supabase
      .from('contact_messages')
      .insert({
        name,
        email,
        phone,
        message,
      });

    if (error) {
      console.error(
        'CONTACT MESSAGE ERROR:',
        error
      );

      setStatus('error');
      setErrorMsg(form.error);
      return;
    }

    setStatus('success');

    (
      e.target as HTMLFormElement
    ).reset();
  };

  const address = isRtl
    ? settings.address_ar
    : settings.address_en;

  const whatsappNumber =
    normalizeWhatsApp(settings.whatsapp);

  const socialLinks = [
    {
      key: 'instagram',
      enabled:
        settings.instagram_enabled &&
        !!settings.instagram,

      href: settings.instagram,
      label: 'Instagram',
      icon: Instagram,
    },

    {
      key: 'facebook',
      enabled:
        settings.facebook_enabled &&
        !!settings.facebook_url,

      href: settings.facebook_url,
      label: 'Facebook',
      icon: Facebook,
    },

    {
      key: 'twitter',
      enabled:
        settings.twitter_enabled &&
        !!settings.twitter_url,

      href: settings.twitter_url,
      label: 'X / Twitter',
      icon: XIcon,
    },

    {
      key: 'youtube',
      enabled:
        settings.youtube_enabled &&
        !!settings.youtube_url,

      href: settings.youtube_url,
      label: 'YouTube',
      icon: Youtube,
    },

    {
      key: 'linkedin',
      enabled:
        settings.linkedin_enabled &&
        !!settings.linkedin_url,

      href: settings.linkedin_url,
      label: 'LinkedIn',
      icon: Linkedin,
    },

    {
      key: 'tiktok',
      enabled:
        settings.tiktok_enabled &&
        !!settings.tiktok_url,

      href: settings.tiktok_url,
      label: 'TikTok',
      icon: TikTokIcon,
    },
  ].filter((item) => item.enabled);

  if (status === 'success') {
    return (
      <section
        className="contact-section"
        id="contact"
      >
        <div className="section-shell">
          <div
            className="contact-success reveal"
            ref={ref}
          >
            <span className="contact-success-icon">
              <CheckCircle2
                size={48}
                strokeWidth={1.25}
              />
            </span>

            <p>
              {form.success}
            </p>

            <button
              className="outline-button"
              type="button"
              onClick={() =>
                setStatus('idle')
              }
            >
              {form.another}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="contact-section"
      id="contact"
    >
      <div className="section-shell">

        <div
          className="contact-layout reveal"
          ref={ref}
        >
          <div className="contact-heading">

            <span className="section-kicker">
              <i />
              {form.title}
            </span>

            <h2>
              {form.title}
            </h2>

            <p>
              {form.subtitle}
            </p>

            <div className="contact-info-list">

              {settings.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="contact-info-item"
                >
                  <span className="contact-info-icon">
                    <Mail size={18} />
                  </span>

                  <span>
                    <small>
                      {isRtl
                        ? 'البريد الإلكتروني'
                        : 'Email'}
                    </small>

                    <strong>
                      {settings.email}
                    </strong>
                  </span>
                </a>
              )}

              {settings.phone_enabled &&
                settings.phone && (
                  <a
                    href={`tel:${settings.phone}`}
                    className="contact-info-item"
                  >
                    <span className="contact-info-icon">
                      <Phone size={18} />
                    </span>

                    <span>
                      <small>
                        {isRtl
                          ? 'الهاتف'
                          : 'Phone'}
                      </small>

                      <strong>
                        {settings.phone}
                      </strong>
                    </span>
                  </a>
                )}

              {settings.whatsapp_enabled &&
                whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-info-item"
                  >
                    <span className="contact-info-icon">
                      <WhatsAppIcon />
                    </span>

                    <span>
                      <small>
                        WhatsApp
                      </small>

                      <strong>
                        {settings.whatsapp}
                      </strong>
                    </span>
                  </a>
                )}

              {settings.address_enabled &&
                address && (
                  <div className="contact-info-item">
                    <span className="contact-info-icon">
                      <MapPin size={18} />
                    </span>

                    <span>
                      <small>
                        {isRtl
                          ? 'الموقع'
                          : 'Location'}
                      </small>

                      <strong>
                        {address}
                      </strong>
                    </span>
                  </div>
                )}

            </div>

            {socialLinks.length > 0 && (
              <div className="contact-social-block">

                <span className="contact-social-title">
                  {isRtl
                    ? 'تابعنا على'
                    : 'Follow Us'}
                </span>

                <div className="contact-social-links">
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
                        <Icon size={18} />
                      </a>
                    )
                  )}
                </div>

              </div>
            )}

          </div>

          <form
            className="contact-form"
            onSubmit={handleSubmit}
          >
            <div className="form-row">

              <label className="form-field">
                <span>
                  {form.name}
                </span>

                <input
                  type="text"
                  name="name"
                  placeholder={
                    form.namePlaceholder
                  }
                  required
                  autoComplete="name"
                />
              </label>

              <label className="form-field">
                <span>
                  {form.email}
                </span>

                <input
                  type="email"
                  name="email"
                  placeholder={
                    form.emailPlaceholder
                  }
                  required
                  autoComplete="email"
                  dir="ltr"
                />
              </label>

            </div>

            <label className="form-field">
              <span>
                {form.phone}
              </span>

              <input
                type="tel"
                name="phone"
                placeholder={
                  form.phonePlaceholder
                }
                autoComplete="tel"
                dir="ltr"
              />
            </label>

            <label className="form-field">
              <span>
                {form.message}
              </span>

              <textarea
                name="message"
                placeholder={
                  form.messagePlaceholder
                }
                required
                rows={5}
              />
            </label>

            {status === 'error' && (
              <div className="form-error">
                <AlertCircle
                  size={18}
                />

                {errorMsg ||
                  form.error}
              </div>
            )}

            <button
              type="submit"
              className="donate-button contact-submit"
              disabled={
                status ===
                'submitting'
              }
            >
              {status ===
              'submitting' ? (
                <>
                  <Loader2
                    size={18}
                    className="spin"
                  />

                  {form.submitting}
                </>
              ) : (
                <>
                  {form.submit}

                  <Send size={16} />
                </>
              )}
            </button>
          </form>

        </div>

      </div>
    </section>
  );
}

function WhatsAppIcon() {
  return (
    <span
      style={{
        fontSize: 16,
        lineHeight: 1,
        fontWeight: 800,
      }}
    >
      W
    </span>
  );
}

function XIcon({
  size = 18,
}: {
  size?: number;
}) {
  return (
    <span
      style={{
        fontSize: size,
        lineHeight: 1,
        fontWeight: 700,
      }}
    >
      𝕏
    </span>
  );
}

function TikTokIcon({
  size = 18,
}: {
  size?: number;
}) {
  return (
    <span
      style={{
        fontSize: size,
        lineHeight: 1,
        fontWeight: 700,
      }}
    >
      ♪
    </span>
  );
}