import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Play,
  Users,
  X,
} from 'lucide-react';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TatreezDivider } from '@/components/TatreezDivider';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';

type Initiative = {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  cover_image_url: string | null;
  category: string;
  status: string;
  beneficiaries: number;
  implementation_date: string | null;
  location_ar: string | null;
  location_en: string | null;
  featured: boolean;
};

type InitiativeImage = {
  id: string;
  initiative_id: string;
  image_url: string;
  caption_ar: string | null;
  caption_en: string | null;
  display_order: number;
};

type InitiativeVideo = {
  id: string;
  initiative_id: string;
  video_url: string;
  video_type: 'youtube' | 'vimeo' | 'direct';
  title_ar: string | null;
  title_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  thumbnail_url: string | null;
  display_order: number;
};

const categoryAr: Record<string, string> = {
  women_child: 'المرأة والطفل',
  relief: 'الإغاثة',
  education: 'التعليم',
  health: 'الصحة',
};

const categoryEn: Record<string, string> = {
  women_child: 'Women & Child',
  relief: 'Relief',
  education: 'Education',
  health: 'Health',
};

const statusAr: Record<string, string> = {
  ongoing: 'مستمرة',
  completed: 'مكتملة',
};

const statusEn: Record<string, string> = {
  ongoing: 'Ongoing',
  completed: 'Completed',
};

function formatDate(
  value: string | null,
  language: 'ar' | 'en'
) {
  if (!value) return '—';

  return new Intl.DateTimeFormat(
    language === 'ar' ? 'ar' : 'en',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  ).format(new Date(value));
}

function getYoutubeId(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.replace('/', '');
    }

    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/shorts/')) {
        return parsed.pathname.split('/shorts/')[1]?.split('/')[0] || '';
      }

      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/embed/')[1]?.split('/')[0] || '';
      }

      return parsed.searchParams.get('v') || '';
    }
  } catch {
    return '';
  }

  return '';
}

function getVimeoId(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.pathname.split('/').filter(Boolean).pop() || '';
  } catch {
    return '';
  }
}

export function InitiativeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, copy, setLanguage } = useLanguage();

  const isRtl = language === 'ar';

  const [initiative, setInitiative] =
    useState<Initiative | null>(null);

  const [images, setImages] =
    useState<InitiativeImage[]>([]);

  const [videos, setVideos] =
    useState<InitiativeVideo[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [notFound, setNotFound] =
    useState(false);

  const [lightboxIndex, setLightboxIndex] =
    useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadPage = async () => {
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setLoading(true);

      const [
        initiativeResult,
        imagesResult,
        videosResult,
      ] = await Promise.all([
        supabase
          .from('initiatives')
          .select(`
            id,
            title_ar,
            title_en,
            description_ar,
            description_en,
            cover_image_url,
            category,
            status,
            beneficiaries,
            implementation_date,
            location_ar,
            location_en,
            featured
          `)
          .eq('id', id)
          .single(),

        supabase
          .from('initiative_images')
          .select('*')
          .eq('initiative_id', id)
          .order('display_order', {
            ascending: true,
          }),

        supabase
          .from('initiative_videos')
          .select('*')
          .eq('initiative_id', id)
          .order('display_order', {
            ascending: true,
          }),
      ]);

      if (
        initiativeResult.error ||
        !initiativeResult.data
      ) {
        console.error(
          'LOAD INITIATIVE DETAIL ERROR:',
          initiativeResult.error
        );

        setNotFound(true);
        setLoading(false);
        return;
      }

      if (imagesResult.error) {
        console.error(
          'LOAD INITIATIVE IMAGES ERROR:',
          imagesResult.error
        );
      }

      if (videosResult.error) {
        console.error(
          'LOAD INITIATIVE VIDEOS ERROR:',
          videosResult.error
        );
      }

      setInitiative(
        initiativeResult.data as Initiative
      );

      setImages(
        (imagesResult.data as InitiativeImage[]) ||
          []
      );

      setVideos(
        (videosResult.data as InitiativeVideo[]) ||
          []
      );

      setLoading(false);
    };

    loadPage();
  }, [id]);

  const text = useMemo(
    () =>
      isRtl
        ? {
            back: 'العودة إلى المبادرات',
            about: 'عن المبادرة',
            location: 'الموقع',
            beneficiaries: 'المستفيدون',
            date: 'تاريخ التنفيذ',
            photosKicker: 'توثيق المبادرة',
            photosTitle: 'صور من المبادرة',
            photosIntro:
              'لقطات توثق بعض مراحل تنفيذ المبادرة على أرض الواقع.',
            videosKicker: 'شاهد المبادرة',
            videosTitle: 'فيديوهات المبادرة',
            videosIntro:
              'شاهد جانبًا من تنفيذ المبادرة وأثرها على المستفيدين.',
            notFound: 'المبادرة غير موجودة.',
            noVideoTitle: 'فيديو من المبادرة',
          }
        : {
            back: 'Back to Initiatives',
            about: 'About the Initiative',
            location: 'Location',
            beneficiaries: 'Beneficiaries',
            date: 'Implementation Date',
            photosKicker: 'Initiative Documentation',
            photosTitle: 'Photos from the Initiative',
            photosIntro:
              'A visual look at different stages of the initiative on the ground.',
            videosKicker: 'Watch the Initiative',
            videosTitle: 'Initiative Videos',
            videosIntro:
              'Watch moments from the initiative and its impact on beneficiaries.',
            notFound: 'Initiative not found.',
            noVideoTitle: 'Initiative Video',
          },
    [isRtl]
  );

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const showPrev = useCallback(() => {
    setLightboxIndex((previous) => {
      if (
        previous === null ||
        images.length === 0
      ) {
        return null;
      }

      return (
        previous -
        1 +
        images.length
      ) % images.length;
    });
  }, [images.length]);

  const showNext = useCallback(() => {
    setLightboxIndex((previous) => {
      if (
        previous === null ||
        images.length === 0
      ) {
        return null;
      }

      return (
        previous + 1
      ) % images.length;
    });
  }, [images.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKey = (
      event: KeyboardEvent
    ) => {
      if (event.key === 'Escape') {
        closeLightbox();
      }

      if (event.key === 'ArrowLeft') {
        isRtl ? showNext() : showPrev();
      }

      if (event.key === 'ArrowRight') {
        isRtl ? showPrev() : showNext();
      }
    };

    window.addEventListener(
      'keydown',
      handleKey
    );

    document.body.style.overflow =
      'hidden';

    return () => {
      window.removeEventListener(
        'keydown',
        handleKey
      );

      document.body.style.overflow =
        '';
    };
  }, [
    lightboxIndex,
    closeLightbox,
    showPrev,
    showNext,
    isRtl,
  ]);

  if (loading) {
    return (
      <div className="app-shell">
        <Header
          language={language}
          copy={copy}
          onLanguageChange={setLanguage}
        />

        <main className="initiative-detail-state">
          <div className="section-loading" />
        </main>

        <Footer copy={copy} />
      </div>
    );
  }

  if (
    notFound ||
    !initiative
  ) {
    return (
      <div className="app-shell">
        <Header
          language={language}
          copy={copy}
          onLanguageChange={setLanguage}
        />

        <main className="initiative-detail-state">
          <div>
            <h1>{text.notFound}</h1>

            <button
              type="button"
              className="initiative-detail-back-button"
              onClick={() =>
                navigate('/#initiatives')
              }
            >
              {text.back}
            </button>
          </div>
        </main>

        <Footer copy={copy} />
      </div>
    );
  }

  const title = isRtl
    ? initiative.title_ar
    : initiative.title_en;

  const description = isRtl
    ? initiative.description_ar
    : initiative.description_en;

  const location = isRtl
    ? initiative.location_ar
    : initiative.location_en;

  const categories = isRtl
    ? categoryAr
    : categoryEn;

  const statuses = isRtl
    ? statusAr
    : statusEn;

  const BackArrow = isRtl
    ? ArrowRight
    : ArrowLeft;

  const PrevIcon = isRtl
    ? ChevronRight
    : ChevronLeft;

  const NextIcon = isRtl
    ? ChevronLeft
    : ChevronRight;

  return (
    <div className="app-shell">
      <Header
        language={language}
        copy={copy}
        onLanguageChange={setLanguage}
      />

      <main className="initiative-detail-page">

        <section className="initiative-detail-hero">
          {initiative.cover_image_url ? (
            <img
              src={
                initiative.cover_image_url
              }
              alt={title}
            />
          ) : (
            <div className="initiative-detail-hero-placeholder" />
          )}

          <div className="initiative-detail-hero-overlay" />

          <div className="section-shell initiative-detail-hero-content">
            <button
              type="button"
              className="initiative-detail-back"
              onClick={() =>
                navigate('/#initiatives')
              }
            >
              <BackArrow size={18} />
              {text.back}
            </button>

            <div className="initiative-detail-tags">
              <span>
                {statuses[
                  initiative.status
                ] ||
                  initiative.status}
              </span>

              <span>
                {categories[
                  initiative.category
                ] ||
                  initiative.category}
              </span>
            </div>

            <h1>{title}</h1>
          </div>
        </section>

        <TatreezDivider />

        <section className="section-shell initiative-detail-intro">
          <article className="initiative-detail-about">
            <span className="section-kicker">
              <i />
              {text.about}
            </span>

            <h2>{title}</h2>

            <p>
              {description}
            </p>
          </article>

          <aside className="initiative-detail-facts">

            {location && (
              <div className="initiative-fact">
                <MapPin size={20} />
                <div>
                  <span>
                    {text.location}
                  </span>
                  <strong>
                    {location}
                  </strong>
                </div>
              </div>
            )}

            {initiative.beneficiaries >
              0 && (
              <div className="initiative-fact">
                <Users size={20} />
                <div>
                  <span>
                    {
                      text.beneficiaries
                    }
                  </span>
                  <strong>
                    {
                      initiative.beneficiaries
                    }
                  </strong>
                </div>
              </div>
            )}

            {initiative.implementation_date && (
              <div className="initiative-fact">
                <CalendarDays
                  size={20}
                />
                <div>
                  <span>
                    {text.date}
                  </span>
                  <strong>
                    {formatDate(
                      initiative.implementation_date,
                      language
                    )}
                  </strong>
                </div>
              </div>
            )}

          </aside>
        </section>

        {images.length > 0 && (
          <section className="initiative-media-section initiative-photos-section">
            <div className="section-shell">
              <div className="section-heading">
                <span className="section-kicker">
                  <i />
                  {text.photosKicker}
                </span>

                <h2>
                  {text.photosTitle}
                </h2>

                <p>
                  {text.photosIntro}
                </p>
              </div>

              <div className="initiative-photos-grid">
                {images.map(
                  (image, index) => {
                    const caption = isRtl
                      ? image.caption_ar
                      : image.caption_en;

                    return (
                      <button
                        key={image.id}
                        type="button"
                        className={`initiative-photo initiative-photo-${index % 6}`}
                        onClick={() =>
                          setLightboxIndex(
                            index
                          )
                        }
                      >
                        <img
                          src={
                            image.image_url
                          }
                          alt={
                            caption ||
                            title
                          }
                          loading="lazy"
                        />

                        {caption && (
                          <span>
                            {caption}
                          </span>
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </section>
        )}

        {videos.length > 0 && (
          <section className="initiative-media-section initiative-videos-section">
            <div className="section-shell">
              <div className="section-heading">
                <span className="section-kicker">
                  <i />
                  {text.videosKicker}
                </span>

                <h2>
                  {text.videosTitle}
                </h2>

                <p>
                  {text.videosIntro}
                </p>
              </div>

              <div className="initiative-videos-grid">
                {videos.map((video) => {
                  const videoTitle =
                    (isRtl
                      ? video.title_ar
                      : video.title_en) ||
                    text.noVideoTitle;

                  const videoDescription =
                    isRtl
                      ? video.description_ar
                      : video.description_en;

                  const youtubeId =
                    video.video_type ===
                    'youtube'
                      ? getYoutubeId(
                          video.video_url
                        )
                      : '';

                  const vimeoId =
                    video.video_type ===
                    'vimeo'
                      ? getVimeoId(
                          video.video_url
                        )
                      : '';

                  return (
                    <article
                      key={video.id}
                      className="initiative-video-card"
                    >
                      <div className="initiative-video-frame">
                        {video.video_type ===
                          'youtube' &&
                        youtubeId ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${youtubeId}`}
                            title={
                              videoTitle
                            }
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : video.video_type ===
                            'vimeo' &&
                          vimeoId ? (
                          <iframe
                            src={`https://player.vimeo.com/video/${vimeoId}`}
                            title={
                              videoTitle
                            }
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                          />
                        ) : video.video_type ===
                          'direct' ? (
                          <video
                            src={
                              video.video_url
                            }
                            controls
                            poster={
                              video.thumbnail_url ||
                              undefined
                            }
                          />
                        ) : (
                          <a
                            href={
                              video.video_url
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="initiative-video-fallback"
                          >
                            <Play
                              size={28}
                            />
                          </a>
                        )}
                      </div>

                      <div className="initiative-video-content">
                        <h3>
                          {videoTitle}
                        </h3>

                        {videoDescription && (
                          <p>
                            {
                              videoDescription
                            }
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

      </main>

      {lightboxIndex !== null &&
        images[lightboxIndex] && (
          <div
            className="initiative-lightbox"
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
          >
            <button
              className="initiative-lightbox-close"
              type="button"
              onClick={
                closeLightbox
              }
            >
              <X size={24} />
            </button>

            {images.length > 1 && (
              <button
                type="button"
                className="initiative-lightbox-arrow initiative-lightbox-prev"
                onClick={(event) => {
                  event.stopPropagation();
                  showPrev();
                }}
              >
                <PrevIcon
                  size={28}
                />
              </button>
            )}

            <img
              src={
                images[lightboxIndex]
                  .image_url
              }
              alt={title}
              onClick={(event) =>
                event.stopPropagation()
              }
            />

            {images.length > 1 && (
              <button
                type="button"
                className="initiative-lightbox-arrow initiative-lightbox-next"
                onClick={(event) => {
                  event.stopPropagation();
                  showNext();
                }}
              >
                <NextIcon
                  size={28}
                />
              </button>
            )}
          </div>
        )}

      <Footer copy={copy} />
    </div>
  );
}