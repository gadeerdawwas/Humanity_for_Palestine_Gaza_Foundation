import {
  ChangeEvent,
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  CheckCircle2,
  Eye,
  Globe2,
  HeartHandshake,
  LayoutTemplate,
  Loader2,
  Save,
  Settings,
  Share2,
  Upload,
} from 'lucide-react';

import { AdminLayout } from '../../components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';

type TabId =
  | 'general'
  | 'donations'
  | 'social'
  | 'content'
  | 'visibility';

interface SettingsForm {
  organization_name_ar: string;
  organization_name_en: string;
  organization_short_name_ar: string;
  organization_short_name_en: string;

  site_logo_url: string;

  email: string;
  phone: string;
  phone_enabled: string;
  whatsapp: string;
  whatsapp_enabled: string;
  address_ar: string;
  address_en: string;
  address_enabled: string;

  donation_url: string;
  donation_enabled: string;
  donation_label_ar: string;
  donation_label_en: string;

  paypal_url: string;
  paypal_enabled: string;
  paypal_label_ar: string;
  paypal_label_en: string;

  secondary_campaign_url: string;
  secondary_campaign_enabled: string;
  secondary_campaign_label_ar: string;
  secondary_campaign_label_en: string;

  instagram: string;
  instagram_enabled: string;
  facebook_url: string;
  facebook_enabled: string;
  twitter_url: string;
  twitter_enabled: string;
  youtube_url: string;
  youtube_enabled: string;
  linkedin_url: string;
  linkedin_enabled: string;
  tiktok_url: string;
  tiktok_enabled: string;

  hero_title_ar: string;
  hero_title_en: string;
  hero_subtitle_ar: string;
  hero_subtitle_en: string;
  hero_image_url: string;

  about_title_ar: string;
  about_title_en: string;
  about_description_ar: string;
  about_description_en: string;

  vision_title_ar: string;
  vision_title_en: string;
  vision_description_ar: string;
  vision_description_en: string;

  mission_title_ar: string;
  mission_title_en: string;
  mission_description_ar: string;
  mission_description_en: string;

  donation_section_title_ar: string;
  donation_section_title_en: string;
  donation_section_description_ar: string;
  donation_section_description_en: string;

  contact_title_ar: string;
  contact_title_en: string;
  contact_description_ar: string;
  contact_description_en: string;

  footer_text_ar: string;
  footer_text_en: string;
  copyright_ar: string;
  copyright_en: string;

  show_projects_section: string;
  show_gallery_section: string;
  show_services_section: string;
  show_about_section: string;
  show_contact_section: string;
  show_donation_section: string;
  newsletter_enabled: string;
}

const defaultSettings: SettingsForm = {
  organization_name_ar: 'الإنسانية من أجل فلسطين – غزة',
  organization_name_en: 'Humanity for Palestine – Gaza',
  organization_short_name_ar: 'الإنسانية لفلسطين',
  organization_short_name_en: 'Humanity for Palestine',

  site_logo_url: '',

  email: '',
  phone: '',
  phone_enabled: 'true',
  whatsapp: '',
  whatsapp_enabled: 'true',
  address_ar: 'قطاع غزة – فلسطين',
  address_en: 'Gaza Strip – Palestine',
  address_enabled: 'true',

  donation_url: '',
  donation_enabled: 'true',
  donation_label_ar: 'تبرع للحملة الرئيسية',
  donation_label_en: 'Donate to Main Campaign',

  paypal_url: '',
  paypal_enabled: 'true',
  paypal_label_ar: 'تبرع عبر PayPal',
  paypal_label_en: 'Donate via PayPal',

  secondary_campaign_url: '',
  secondary_campaign_enabled: 'false',
  secondary_campaign_label_ar: 'دعم حملة إضافية',
  secondary_campaign_label_en: 'Support Another Campaign',

  instagram: '',
  instagram_enabled: 'true',
  facebook_url: '',
  facebook_enabled: 'true',
  twitter_url: '',
  twitter_enabled: 'true',
  youtube_url: '',
  youtube_enabled: 'false',
  linkedin_url: '',
  linkedin_enabled: 'false',
  tiktok_url: '',
  tiktok_enabled: 'false',

  hero_title_ar: 'نقف مع غزة ونخدم بإنسانية',
  hero_title_en: 'Standing With Gaza, Serving With Humanity',
  hero_subtitle_ar:
    'تعمل مؤسسة الإنسانية من أجل فلسطين – غزة على دعم الأسر والأطفال والفئات الأكثر احتياجًا من خلال مبادرات الإغاثة والصحة والتعليم والعمل المجتمعي.',
  hero_subtitle_en:
    'Humanity for Palestine – Gaza supports families, children, and vulnerable communities through relief, health, education, and community initiatives.',
  hero_image_url: '',

  about_title_ar: 'من نحن',
  about_title_en: 'About Us',
  about_description_ar:
    'مبادرة إنسانية تعمل على دعم الأسر والأطفال والفئات الأكثر احتياجًا في قطاع غزة من خلال برامج الإغاثة والصحة والتعليم والعمل المجتمعي.',
  about_description_en:
    'A humanitarian initiative supporting families, children, and vulnerable communities across Gaza through relief, health, education, and community programs.',

  vision_title_ar: 'رؤيتنا',
  vision_title_en: 'Our Vision',
  vision_description_ar:
    'مجتمع أكثر أمانًا وكرامة وقدرة على الصمود، يحصل فيه الأفراد والأسر على الدعم الذي يحتاجونه لبناء مستقبل أفضل.',
  vision_description_en:
    'A safer, more dignified, and resilient community where individuals and families receive the support they need to build a better future.',

  mission_title_ar: 'رسالتنا',
  mission_title_en: 'Our Mission',
  mission_description_ar:
    'تقديم استجابة إنسانية فعالة ومستدامة تستند إلى الاحتياجات الحقيقية للمجتمع وتصل إلى الفئات الأكثر احتياجًا.',
  mission_description_en:
    'Delivering effective and sustainable humanitarian responses based on real community needs and reaching those most in need.',

  donation_section_title_ar: 'ساهم في إحداث فرق',
  donation_section_title_en: 'Help Make a Difference',
  donation_section_description_ar:
    'دعمك يساعدنا على الاستمرار في تقديم المساعدات وتنفيذ المبادرات الإنسانية للأسر والأطفال في غزة.',
  donation_section_description_en:
    'Your support helps us continue providing assistance and humanitarian initiatives for families and children in Gaza.',

  contact_title_ar: 'تواصل معنا',
  contact_title_en: 'Contact Us',
  contact_description_ar:
    'يسعدنا التواصل معكم والإجابة عن استفساراتكم والتعاون في المبادرات الإنسانية.',
  contact_description_en:
    'We welcome your messages, questions, and opportunities to collaborate on humanitarian initiatives.',

  footer_text_ar:
    'نعمل من أجل دعم الأسر والأطفال والفئات الأكثر احتياجًا في قطاع غزة.',
  footer_text_en:
    'Working to support families, children, and vulnerable communities across Gaza.',
  copyright_ar:
    'جميع الحقوق محفوظة – الإنسانية من أجل فلسطين – غزة',
  copyright_en:
    'All rights reserved – Humanity for Palestine – Gaza',

  show_projects_section: 'true',
  show_gallery_section: 'true',
  show_services_section: 'true',
  show_about_section: 'true',
  show_contact_section: 'true',
  show_donation_section: 'true',
  newsletter_enabled: 'false',
};

const tabs: Array<{
  id: TabId;
  label: string;
  icon: typeof Settings;
}> = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'donations', label: 'Donations', icon: HeartHandshake },
  { id: 'social', label: 'Social Media', icon: Share2 },
  { id: 'content', label: 'Content', icon: LayoutTemplate },
  { id: 'visibility', label: 'Visibility', icon: Eye },
];

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {label && (
        <span className="text-sm text-gray-500">
          {label}
        </span>
      )}

      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
          checked ? 'bg-[#0C4A2E]' : 'bg-gray-300'
        }`}
        aria-pressed={checked}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

function FieldLabel({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {children}
    </label>
  );
}

export function AdminSettingsPage() {
  const [activeTab, setActiveTab] =
    useState<TabId>('general');

  const [form, setForm] =
    useState<SettingsForm>(defaultSettings);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploadingHero, setUploadingHero] =
    useState(false);

  const [uploadingLogo, setUploadingLogo] =
    useState(false);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

  const settingKeys = useMemo(
    () => Object.keys(defaultSettings),
    []
  );

  const loadSettings = async () => {
    setLoading(true);
    setError('');

    const { data, error: loadError } =
      await supabase
        .from('site_settings')
        .select('key,value')
        .in('key', settingKeys);

    if (loadError) {
      console.error(
        'LOAD SETTINGS ERROR:',
        loadError
      );

      setError(
        loadError.message ||
          'Failed to load website settings.'
      );

      setLoading(false);
      return;
    }

    const next: SettingsForm = {
      ...defaultSettings,
    };

    (data || []).forEach(
      (item: {
        key: string;
        value: string | null;
      }) => {
        if (item.key in next) {
          next[
            item.key as keyof SettingsForm
          ] = item.value ?? '';
        }
      }
    );

    setForm(next);
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const toggle = (
    key: keyof SettingsForm
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]:
        previous[key] === 'true'
          ? 'false'
          : 'true',
    }));
  };

  const uploadImageToSettings = async ({
    file,
    folder,
    settingKey,
  }: {
    file: File;
    folder: string;
    settingKey:
      | 'hero_image_url'
      | 'site_logo_url';
  }) => {
    if (!file.type.startsWith('image/')) {
      throw new Error(
        'Please select a valid image file.'
      );
    }

    if (file.size > 8 * 1024 * 1024) {
      throw new Error(
        'Image must be smaller than 8 MB.'
      );
    }

    const extension =
      file.name
        .split('.')
        .pop()
        ?.toLowerCase() || 'png';

    const filePath =
      `${folder}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } =
      await supabase.storage
        .from('hero-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } =
      supabase.storage
        .from('hero-images')
        .getPublicUrl(filePath);

    const publicUrl =
      publicUrlData.publicUrl;

    const { error: settingError } =
      await supabase
        .from('site_settings')
        .upsert(
          [
            {
              key: settingKey,
              value: publicUrl,
            },
          ],
          {
            onConflict: 'key',
          }
        );

    if (settingError) {
      throw settingError;
    }

    setForm((previous) => ({
      ...previous,
      [settingKey]: publicUrl,
    }));

    return publicUrl;
  };

  const handleLogoUpload = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    event.target.value = '';

    if (!file) return;

    setUploadingLogo(true);
    setError('');
    setSuccess('');

    try {
      await uploadImageToSettings({
        file,
        folder: 'branding',
        settingKey: 'site_logo_url',
      });

      setSuccess(
        'Website logo updated successfully.'
      );

      window.setTimeout(
        () => setSuccess(''),
        3500
      );
    } catch (uploadError: any) {
      console.error(
        'UPLOAD LOGO ERROR:',
        uploadError
      );

      setError(
        uploadError?.message ||
          'Failed to upload website logo.'
      );
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleHeroImageUpload = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    event.target.value = '';

    if (!file) return;

    setUploadingHero(true);
    setError('');
    setSuccess('');

    try {
      await uploadImageToSettings({
        file,
        folder: 'hero',
        settingKey: 'hero_image_url',
      });

      setSuccess(
        'Hero image uploaded successfully.'
      );

      window.setTimeout(
        () => setSuccess(''),
        3500
      );
    } catch (uploadError: any) {
      console.error(
        'UPLOAD HERO IMAGE ERROR:',
        uploadError
      );

      setError(
        uploadError?.message ||
          'Failed to upload hero image.'
      );
    } finally {
      setUploadingHero(false);
    }
  };

  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const rows =
        Object.entries(form).map(
          ([key, value]) => ({
            key,
            value: value.trim(),
          })
        );

      const { error: saveError } =
        await supabase
          .from('site_settings')
          .upsert(rows, {
            onConflict: 'key',
          });

      if (saveError) {
        throw saveError;
      }

      setSuccess(
        'Website settings saved successfully.'
      );

      window.setTimeout(
        () => setSuccess(''),
        3500
      );
    } catch (saveError: any) {
      console.error(
        'SAVE SETTINGS ERROR:',
        saveError
      );

      setError(
        saveError?.message ||
          'Failed to save website settings.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <div className="min-h-[450px] flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2
              className="animate-spin"
              size={21}
            />

            Loading settings...
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Website Settings
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Manage website content, identity, donations, social accounts and visibility.
        </p>
      </div>

      {success && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-[230px_1fr] gap-6">

          <aside className="bg-white border border-gray-100 rounded-2xl p-3 h-fit shadow-sm">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active =
                  activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() =>
                      setActiveTab(tab.id)
                    }
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                      active
                        ? 'bg-[#0C4A2E] text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium">
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <div>
            {activeTab === 'general' && (
              <section className="space-y-5">

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-11 h-11 rounded-xl bg-[#0C4A2E]/10 flex items-center justify-center">
                      <Upload
                        className="text-[#0C4A2E]"
                        size={21}
                      />
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Website Logo
                      </h3>

                      <p className="text-sm text-gray-500">
                        Upload the logo used in the header and footer.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
                    <div className="w-full lg:w-72 h-36 rounded-2xl border border-gray-200 bg-[#F8F5EC] flex items-center justify-center overflow-hidden">
                      {form.site_logo_url ? (
                        <img
                          src={
                            form.site_logo_url
                          }
                          alt="Website logo"
                          className="max-w-[220px] max-h-24 object-contain"
                        />
                      ) : (
                        <span className="text-sm text-gray-400">
                          No logo uploaded
                        </span>
                      )}
                    </div>

                    <div className="flex-1">
                      <FieldLabel>
                        Logo Image
                      </FieldLabel>

                      <p className="text-sm text-gray-500 mb-4">
                        Transparent PNG, WebP or SVG works best.
                      </p>

                      <label
                        className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0C4A2E] text-white font-medium cursor-pointer hover:bg-[#083A24] transition ${
                          uploadingLogo
                            ? 'opacity-60 pointer-events-none'
                            : ''
                        }`}
                      >
                        {uploadingLogo ? (
                          <>
                            <Loader2
                              className="animate-spin"
                              size={18}
                            />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload size={18} />
                            {form.site_logo_url
                              ? 'Change Logo'
                              : 'Upload Logo'}
                          </>
                        )}

                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          onChange={
                            handleLogoUpload
                          }
                          disabled={
                            uploadingLogo
                          }
                          className="hidden"
                        />
                      </label>

                      <p className="text-xs text-gray-400 mt-3">
                        Maximum file size: 8 MB.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-11 h-11 rounded-xl bg-[#0C4A2E]/10 flex items-center justify-center">
                      <Globe2
                        className="text-[#0C4A2E]"
                        size={21}
                      />
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800">
                        General Information
                      </h3>

                      <p className="text-sm text-gray-500">
                        Organization identity and contact details.
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <FieldLabel>
                        English Organization Name
                      </FieldLabel>

                      <input
                        name="organization_name_en"
                        value={
                          form.organization_name_en
                        }
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                      />
                    </div>

                    <div>
                      <FieldLabel>
                        Arabic Organization Name
                      </FieldLabel>

                      <input
                        name="organization_name_ar"
                        value={
                          form.organization_name_ar
                        }
                        onChange={handleChange}
                        dir="rtl"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                      />
                    </div>

                    <div>
                      <FieldLabel>
                        English Short Name
                      </FieldLabel>

                      <input
                        name="organization_short_name_en"
                        value={
                          form.organization_short_name_en
                        }
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                      />
                    </div>

                    <div>
                      <FieldLabel>
                        Arabic Short Name
                      </FieldLabel>

                      <input
                        name="organization_short_name_ar"
                        value={
                          form.organization_short_name_ar
                        }
                        onChange={handleChange}
                        dir="rtl"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                      />
                    </div>

                    <div>
                      <FieldLabel>
                        Email
                      </FieldLabel>

                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        dir="ltr"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <FieldLabel>
                          Phone
                        </FieldLabel>

                        <Toggle
                          checked={
                            form.phone_enabled ===
                            'true'
                          }
                          onChange={() =>
                            toggle(
                              'phone_enabled'
                            )
                          }
                        />
                      </div>

                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        dir="ltr"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between mb-2">
                        <FieldLabel>
                          WhatsApp
                        </FieldLabel>

                        <Toggle
                          checked={
                            form.whatsapp_enabled ===
                            'true'
                          }
                          onChange={() =>
                            toggle(
                              'whatsapp_enabled'
                            )
                          }
                        />
                      </div>

                      <input
                        name="whatsapp"
                        value={form.whatsapp}
                        onChange={handleChange}
                        dir="ltr"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                      />
                    </div>

                    <div>
                      <FieldLabel>
                        English Address
                      </FieldLabel>

                      <input
                        name="address_en"
                        value={form.address_en}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <FieldLabel>
                          Arabic Address
                        </FieldLabel>

                        <Toggle
                          checked={
                            form.address_enabled ===
                            'true'
                          }
                          onChange={() =>
                            toggle(
                              'address_enabled'
                            )
                          }
                        />
                      </div>

                      <input
                        name="address_ar"
                        value={form.address_ar}
                        onChange={handleChange}
                        dir="rtl"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'donations' && (
              <section className="space-y-5">
                {[
                  {
                    title: 'Main Campaign',
                    url: 'donation_url' as const,
                    enabled:
                      'donation_enabled' as const,
                    labelEn:
                      'donation_label_en' as const,
                    labelAr:
                      'donation_label_ar' as const,
                  },
                  {
                    title: 'PayPal',
                    url: 'paypal_url' as const,
                    enabled:
                      'paypal_enabled' as const,
                    labelEn:
                      'paypal_label_en' as const,
                    labelAr:
                      'paypal_label_ar' as const,
                  },
                  {
                    title: 'Secondary Campaign',
                    url:
                      'secondary_campaign_url' as const,
                    enabled:
                      'secondary_campaign_enabled' as const,
                    labelEn:
                      'secondary_campaign_label_en' as const,
                    labelAr:
                      'secondary_campaign_label_ar' as const,
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {item.title}
                        </h3>

                        <p className="text-xs text-gray-400 mt-1">
                          Configure this donation option.
                        </p>
                      </div>

                      <Toggle
                        checked={
                          form[item.enabled] ===
                          'true'
                        }
                        onChange={() =>
                          toggle(
                            item.enabled
                          )
                        }
                        label={
                          form[item.enabled] ===
                          'true'
                            ? 'Visible'
                            : 'Hidden'
                        }
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <FieldLabel>
                          URL
                        </FieldLabel>

                        <input
                          type="url"
                          name={item.url}
                          value={form[item.url]}
                          onChange={handleChange}
                          dir="ltr"
                          placeholder="https://..."
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                        />
                      </div>

                      <div>
                        <FieldLabel>
                          English Button Label
                        </FieldLabel>

                        <input
                          name={item.labelEn}
                          value={
                            form[
                              item.labelEn
                            ]
                          }
                          onChange={handleChange}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                        />
                      </div>

                      <div>
                        <FieldLabel>
                          Arabic Button Label
                        </FieldLabel>

                        <input
                          name={item.labelAr}
                          value={
                            form[
                              item.labelAr
                            ]
                          }
                          onChange={handleChange}
                          dir="rtl"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {activeTab === 'social' && (
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-800">
                  Social Media Accounts
                </h3>

                <p className="text-sm text-gray-500 mt-1 mb-6">
                  Save social links and choose which platforms appear publicly.
                </p>

                <div className="space-y-5">
                  {[
                    {
                      label: 'Instagram',
                      key: 'instagram' as const,
                      enabled:
                        'instagram_enabled' as const,
                    },
                    {
                      label: 'Facebook',
                      key: 'facebook_url' as const,
                      enabled:
                        'facebook_enabled' as const,
                    },
                    {
                      label: 'X / Twitter',
                      key: 'twitter_url' as const,
                      enabled:
                        'twitter_enabled' as const,
                    },
                    {
                      label: 'YouTube',
                      key: 'youtube_url' as const,
                      enabled:
                        'youtube_enabled' as const,
                    },
                    {
                      label: 'LinkedIn',
                      key: 'linkedin_url' as const,
                      enabled:
                        'linkedin_enabled' as const,
                    },
                    {
                      label: 'TikTok',
                      key: 'tiktok_url' as const,
                      enabled:
                        'tiktok_enabled' as const,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="border border-gray-100 rounded-2xl p-5"
                    >
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <FieldLabel>
                          {item.label}
                        </FieldLabel>

                        <Toggle
                          checked={
                            form[
                              item.enabled
                            ] === 'true'
                          }
                          onChange={() =>
                            toggle(
                              item.enabled
                            )
                          }
                          label={
                            form[
                              item.enabled
                            ] === 'true'
                              ? 'Visible'
                              : 'Hidden'
                          }
                        />
                      </div>

                      <input
                        name={item.key}
                        value={
                          form[item.key]
                        }
                        onChange={
                          handleChange
                        }
                        dir="ltr"
                        placeholder="https://..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'content' && (
              <section className="space-y-5">
                {[
                  {
                    title: 'Hero',
                    titleEn:
                      'hero_title_en' as const,
                    titleAr:
                      'hero_title_ar' as const,
                    descEn:
                      'hero_subtitle_en' as const,
                    descAr:
                      'hero_subtitle_ar' as const,
                  },
                  {
                    title: 'About',
                    titleEn:
                      'about_title_en' as const,
                    titleAr:
                      'about_title_ar' as const,
                    descEn:
                      'about_description_en' as const,
                    descAr:
                      'about_description_ar' as const,
                  },
                  {
                    title: 'Vision',
                    titleEn:
                      'vision_title_en' as const,
                    titleAr:
                      'vision_title_ar' as const,
                    descEn:
                      'vision_description_en' as const,
                    descAr:
                      'vision_description_ar' as const,
                  },
                  {
                    title: 'Mission',
                    titleEn:
                      'mission_title_en' as const,
                    titleAr:
                      'mission_title_ar' as const,
                    descEn:
                      'mission_description_en' as const,
                    descAr:
                      'mission_description_ar' as const,
                  },
                  {
                    title: 'Donation Section',
                    titleEn:
                      'donation_section_title_en' as const,
                    titleAr:
                      'donation_section_title_ar' as const,
                    descEn:
                      'donation_section_description_en' as const,
                    descAr:
                      'donation_section_description_ar' as const,
                  },
                  {
                    title: 'Contact Section',
                    titleEn:
                      'contact_title_en' as const,
                    titleAr:
                      'contact_title_ar' as const,
                    descEn:
                      'contact_description_en' as const,
                    descAr:
                      'contact_description_ar' as const,
                  },
                  {
                    title: 'Footer',
                    titleEn:
                      'copyright_en' as const,
                    titleAr:
                      'copyright_ar' as const,
                    descEn:
                      'footer_text_en' as const,
                    descAr:
                      'footer_text_ar' as const,
                  },
                ].map((section) => (
                  <div
                    key={section.title}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                  >
                    <h3 className="font-semibold text-gray-800 mb-5">
                      {section.title}
                    </h3>

                    {section.title ===
                      'Hero' && (
                      <div className="mb-6 rounded-2xl border border-gray-100 bg-gray-50 p-5">
                        <div className="flex flex-col lg:flex-row gap-5 lg:items-center">
                          <div className="w-full lg:w-72">
                            {form.hero_image_url ? (
                              <img
                                src={
                                  form.hero_image_url
                                }
                                alt="Current hero"
                                className="w-full h-44 object-cover rounded-xl border border-gray-200 bg-white"
                              />
                            ) : (
                              <div className="w-full h-44 rounded-xl border border-dashed border-gray-300 bg-white flex items-center justify-center text-sm text-gray-400">
                                No hero image uploaded
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <FieldLabel>
                              Hero Image
                            </FieldLabel>

                            <p className="text-sm text-gray-500 mb-4">
                              Upload the main image displayed in the website hero section.
                            </p>

                            <label
                              className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0C4A2E] text-white font-medium cursor-pointer hover:bg-[#083A24] transition ${
                                uploadingHero
                                  ? 'opacity-60 pointer-events-none'
                                  : ''
                              }`}
                            >
                              {uploadingHero ? (
                                <>
                                  <Loader2
                                    className="animate-spin"
                                    size={18}
                                  />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload
                                    size={18}
                                  />
                                  {form.hero_image_url
                                    ? 'Change Image'
                                    : 'Upload Image'}
                                </>
                              )}

                              <input
                                type="file"
                                accept="image/*"
                                onChange={
                                  handleHeroImageUpload
                                }
                                disabled={
                                  uploadingHero
                                }
                                className="hidden"
                              />
                            </label>

                            <p className="text-xs text-gray-400 mt-3">
                              JPG, PNG or WebP. Maximum file size: 8 MB.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <FieldLabel>
                          English Title
                        </FieldLabel>

                        <input
                          name={
                            section.titleEn
                          }
                          value={
                            form[
                              section.titleEn
                            ]
                          }
                          onChange={
                            handleChange
                          }
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                        />
                      </div>

                      <div>
                        <FieldLabel>
                          Arabic Title
                        </FieldLabel>

                        <input
                          name={
                            section.titleAr
                          }
                          value={
                            form[
                              section.titleAr
                            ]
                          }
                          onChange={
                            handleChange
                          }
                          dir="rtl"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0C4A2E]"
                        />
                      </div>

                      <div>
                        <FieldLabel>
                          English Description
                        </FieldLabel>

                        <textarea
                          name={
                            section.descEn
                          }
                          value={
                            form[
                              section.descEn
                            ]
                          }
                          onChange={
                            handleChange
                          }
                          rows={4}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none resize-none focus:border-[#0C4A2E]"
                        />
                      </div>

                      <div>
                        <FieldLabel>
                          Arabic Description
                        </FieldLabel>

                        <textarea
                          name={
                            section.descAr
                          }
                          value={
                            form[
                              section.descAr
                            ]
                          }
                          onChange={
                            handleChange
                          }
                          rows={4}
                          dir="rtl"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none resize-none focus:border-[#0C4A2E]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {activeTab ===
              'visibility' && (
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-800">
                  Website Section Visibility
                </h3>

                <p className="text-sm text-gray-500 mt-1 mb-6">
                  Turn website sections on or off without deleting their content.
                </p>

                <div className="divide-y divide-gray-100">
                  {[
                    {
                      label:
                        'Projects Section',
                      key:
                        'show_projects_section' as const,
                    },
                    {
                      label:
                        'Gallery Section',
                      key:
                        'show_gallery_section' as const,
                    },
                    {
                      label:
                        'Services Section',
                      key:
                        'show_services_section' as const,
                    },
                    {
                      label:
                        'About Section',
                      key:
                        'show_about_section' as const,
                    },
                    {
                      label:
                        'Contact Section',
                      key:
                        'show_contact_section' as const,
                    },
                    {
                      label:
                        'Donation Section',
                      key:
                        'show_donation_section' as const,
                    },
                    {
                      label:
                        'Newsletter',
                      key:
                        'newsletter_enabled' as const,
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between gap-4 py-5"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {item.label}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          {form[
                            item.key
                          ] === 'true'
                            ? 'Currently visible on the website.'
                            : 'Currently hidden from the website.'}
                        </p>
                      </div>

                      <Toggle
                        checked={
                          form[
                            item.key
                          ] === 'true'
                        }
                        onChange={() =>
                          toggle(
                            item.key
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="sticky bottom-4 mt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0C4A2E] text-white font-medium shadow-lg hover:bg-[#083A24] disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2
                      className="animate-spin"
                      size={18}
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}