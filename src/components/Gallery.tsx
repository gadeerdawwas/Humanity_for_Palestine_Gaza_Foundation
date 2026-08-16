import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';
import { TatreezDivider } from './TatreezDivider';
import { supabase, type GalleryImage } from '@/lib/supabase';

type GalleryItem = { image: string; caption: string };

type GalleryProps = { copy: any; language: 'ar' | 'en' };

export function Gallery({ copy, language }: GalleryProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const sectionRef = useReveal<HTMLDivElement>();
  const isRtl = language === 'ar';
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('display_order', { ascending: true });
      if (error || !data) {
        setItems([]);
        setLoading(false);
        return;
      }
      const mapped: GalleryItem[] = (data as GalleryImage[]).map((g) => ({
        image: g.image_url,
        caption: isRtl ? (g.caption_ar || '') : (g.caption_en || ''),
      }));
      setItems(mapped);
      setLoading(false);
    })();
  }, [language, isRtl]);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const showPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev === null ? null : (prev - 1 + items.length) % items.length));
  }, [items.length]);
  const showNext = useCallback(() => {
    setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % items.length));
  }, [items.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') (isRtl ? showNext : showPrev)();
      if (e.key === 'ArrowRight') (isRtl ? showPrev : showNext)();
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
          <span className="section-kicker"><i />{copy.gallery.kicker}</span>
          <h2>{copy.gallery.title}</h2>
          <p>{copy.gallery.intro}</p>
        </div>
        <div className="gallery-grid reveal" ref={sectionRef}>
          {loading ? (
            <div className="section-loading" />
          ) : items.length > 0 ? (
            items.map((item, index) => (
              <button
                key={index}
                className={`gallery-tile tile-${index % 8}`}
                onClick={() => setLightboxIndex(index)}
                type="button"
                aria-label={item.caption}
              >
                <img src={item.image} alt={item.caption} loading="lazy" />
                <span className="gallery-corner" aria-hidden="true" />
                <span className="gallery-caption">{item.caption}</span>
              </button>
            ))
          ) : null}
        </div>
        <button className="gallery-more" onClick={() => navigate('/gallery')}>{copy.gallery.seeMore}</button>
      </div>

      {lightboxIndex !== null && (
        <div className="lightbox" onClick={closeLightbox} role="dialog" aria-modal="true">
          <button className="lightbox-close" onClick={closeLightbox} type="button" aria-label="Close"><X size={24} /></button>
          <button className="lightbox-arrow lightbox-prev" onClick={(e) => { e.stopPropagation(); showPrev(); }} type="button" aria-label="Previous"><PrevIcon size={28} /></button>
          <img src={items[lightboxIndex].image} alt={items[lightboxIndex].caption} onClick={(e) => e.stopPropagation()} />
          <button className="lightbox-arrow lightbox-next" onClick={(e) => { e.stopPropagation(); showNext(); }} type="button" aria-label="Next"><NextIcon size={28} /></button>
          <span className="lightbox-caption" onClick={(e) => e.stopPropagation()}>{items[lightboxIndex].caption}</span>
        </div>
      )}
    </section>
  );
}
