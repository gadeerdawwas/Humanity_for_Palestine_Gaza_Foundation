import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

import { useReveal } from '@/hooks/useReveal';
import { TatreezDivider } from './TatreezDivider';
import { supabase, type GalleryImage } from '@/lib/supabase';

type GalleryItem = {
  id: string;
  image: string;
  caption: string;
};

type GalleryProps = {
  copy: any;
  language: 'ar' | 'en';
};

export function Gallery({ copy, language }: GalleryProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const sectionRef = useReveal<HTMLDivElement>();
  const isRtl = language === 'ar';
  const navigate = useNavigate();

  useEffect(() => {
    const loadGallery = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('display_order', { ascending: true })
        .limit(6);

      if (error || !data) {
        console.error('LOAD GALLERY ERROR:', error);
        setItems([]);
        setLoading(false);
        return;
      }

      const mapped: GalleryItem[] = (data as GalleryImage[]).map((item) => ({
        id: item.id,
        image: item.image_url,
        caption: isRtl ? item.caption_ar || '' : item.caption_en || '',
      }));

      setItems(mapped);
      setLoading(false);
    };

    loadGallery();
  }, [language, isRtl]);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const showPrev = useCallback(() => {
    setLightboxIndex((previous) => {
      if (previous === null || items.length === 0) return null;
      return (previous - 1 + items.length) % items.length;
    });
  }, [items.length]);

  const showNext = useCallback(() => {
    setLightboxIndex((previous) => {
      if (previous === null || items.length === 0) return null;
      return (previous + 1) % items.length;
    });
  }, [items.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeLightbox();

      if (event.key === 'ArrowLeft') {
        isRtl ? showNext() : showPrev();
      }

      if (event.key === 'ArrowRight') {
        isRtl ? showPrev() : showNext();
      }
    };

    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [lightboxIndex, closeLightbox, showPrev, showNext, isRtl]);

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <section className="gallery-section" id="gallery">
      <TatreezDivider />

      <div className="section-shell">
        <div className="section-heading">
          <span className="section-kicker">
            <i />
            {copy.gallery.kicker}
          </span>

          <h2>{copy.gallery.title}</h2>
          <p>{copy.gallery.intro}</p>
        </div>

        <div className="gallery-grid reveal" ref={sectionRef}>
          {loading ? (
            <div className="section-loading" />
          ) : items.length > 0 ? (
            items.map((item, index) => (
              <button
                key={item.id}
                className={`gallery-tile tile-${index % 10}`}
                onClick={() => setLightboxIndex(index)}
                type="button"
                aria-label={
                  item.caption ||
                  (language === 'ar' ? 'عرض الصورة' : 'View image')
                }
              >
                <img
                  src={item.image}
                  alt={
                    item.caption ||
                    (language === 'ar' ? 'صورة من المعرض' : 'Gallery image')
                  }
                  loading="lazy"
                />

                <span className="gallery-corner" aria-hidden="true" />

                {item.caption && (
                  <span className="gallery-caption">{item.caption}</span>
                )}
              </button>
            ))
          ) : (
            <div className="gallery-empty">
              {language === 'ar'
                ? 'لا توجد صور متاحة حاليًا.'
                : 'No gallery images available yet.'}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <button
            className="gallery-more"
            onClick={() => navigate('/gallery')}
            type="button"
          >
            {copy.gallery.seeMore}
          </button>
        )}
      </div>

      {lightboxIndex !== null && items[lightboxIndex] && (
        <div
          className="lightbox"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          <button
            className="lightbox-close"
            onClick={closeLightbox}
            type="button"
            aria-label="Close"
          >
            <X size={24} />
          </button>

          {items.length > 1 && (
            <button
              className="lightbox-arrow lightbox-prev"
              onClick={(event) => {
                event.stopPropagation();
                showPrev();
              }}
              type="button"
              aria-label="Previous"
            >
              <PrevIcon size={28} />
            </button>
          )}

          <img
            src={items[lightboxIndex].image}
            alt={items[lightboxIndex].caption}
            onClick={(event) => event.stopPropagation()}
          />

          {items.length > 1 && (
            <button
              className="lightbox-arrow lightbox-next"
              onClick={(event) => {
                event.stopPropagation();
                showNext();
              }}
              type="button"
              aria-label="Next"
            >
              <NextIcon size={28} />
            </button>
          )}

          {items[lightboxIndex].caption && (
            <span
              className="lightbox-caption"
              onClick={(event) => event.stopPropagation()}
            >
              {items[lightboxIndex].caption}
            </span>
          )}
        </div>
      )}
    </section>
  );
}