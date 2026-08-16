import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';
import { TatreezDivider } from '@/components/TatreezDivider';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { supabase, type GalleryImage } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';

type GalleryItem = { id: string; image: string; caption: string };

const PAGE_SIZE = 12;

export function GalleryPage() {
  const { language, copy, setLanguage } = useLanguage();
  const isRtl = language === 'ar';
  const navigate = useNavigate();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const sectionRef = useReveal<HTMLDivElement>();

  const fetchPage = useCallback(async (offset: number, append: boolean) => {
    if (append) setLoadingMore(true);
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('display_order', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);
    if (error || !data) {
      setItems([]);
      setHasMore(false);
      setLoading(false);
      setLoadingMore(false);
      return;
    }
    const mapped: GalleryItem[] = (data as GalleryImage[]).map((g) => ({
      id: g.id,
      image: g.image_url,
      caption: isRtl ? (g.caption_ar || '') : (g.caption_en || ''),
    }));
    setItems((prev) => (append ? [...prev, ...mapped] : mapped));
    setHasMore(mapped.length === PAGE_SIZE);
    setLoading(false);
    setLoadingMore(false);
  }, [isRtl]);

  useEffect(() => {
    fetchPage(0, false);
  }, [fetchPage]);

  const loadMore = () => fetchPage(items.length, true);

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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div className="app-shell">
      <Header language={language} copy={copy} onLanguageChange={setLanguage} />
      <main>
        <section className="gallery-page-section">
          <TatreezDivider />
          <div className="section-shell">
            <div className="section-heading">
              <span className="section-kicker"><i />{copy.gallery.kicker}</span>
              <h2>{copy.pages.galleryTitle}</h2>
              <p>{copy.pages.galleryIntro}</p>
            </div>
            <div className="gallery-grid reveal" ref={sectionRef}>
              {loading ? (
                <div className="section-loading" />
              ) : items.length > 0 ? (
                items.map((item, index) => (
                  <button
                    key={item.id}
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
            {!loading && hasMore && (
              <div className="page-load-more">
                <button
                  type="button"
                  className="outline-button"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? <span className="section-loading inline" /> : copy.pages.loadMore}
                </button>
              </div>
            )}
            {!loading && !hasMore && items.length > 0 && (
              <p className="page-no-more">{copy.pages.noMore}</p>
            )}
            {!loading && items.length === 0 && (
              <button type="button" className="outline-button page-back-link" onClick={() => navigate('/')}>
                {copy.pages.backToGallery}
              </button>
            )}
          </div>
        </section>
      </main>
      <Footer copy={copy} />

      {lightboxIndex !== null && (
        <div className="lightbox" onClick={closeLightbox} role="dialog" aria-modal="true">
          <button className="lightbox-close" onClick={closeLightbox} type="button" aria-label="Close"><X size={24} /></button>
          <button className="lightbox-arrow lightbox-prev" onClick={(e) => { e.stopPropagation(); showPrev(); }} type="button" aria-label="Previous"><PrevIcon size={28} /></button>
          <img src={items[lightboxIndex].image} alt={items[lightboxIndex].caption} onClick={(e) => e.stopPropagation()} />
          <button className="lightbox-arrow lightbox-next" onClick={(e) => { e.stopPropagation(); showNext(); }} type="button" aria-label="Next"><NextIcon size={28} /></button>
          <span className="lightbox-caption" onClick={(e) => e.stopPropagation()}>{items[lightboxIndex].caption}</span>
        </div>
      )}
    </div>
  );
}
