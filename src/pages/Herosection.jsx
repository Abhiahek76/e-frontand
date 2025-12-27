import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import { heroSlides } from "../data/product";

const AUTOPLAY_MS = 4000;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const m = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!m) return;

    const onChange = () => setReduced(!!m.matches);
    onChange();

    if (m.addEventListener) m.addEventListener("change", onChange);
    else m.addListener?.(onChange);

    return () => {
      if (m.removeEventListener) m.removeEventListener("change", onChange);
      else m.removeListener?.(onChange);
    };
  }, []);

  return reduced;
}

export default function HeroCarousel() {
  const reducedMotion = usePrefersReducedMotion();

  const slides = Array.isArray(heroSlides) ? heroSlides.filter(Boolean) : [];
  const total = slides.length;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const sectionRef = useRef(null);
  const touchStartX = useRef(null);

  // remember play state when tab hidden
  const wasPlayingRef = useRef(true);

  const safeIndex = total ? ((currentSlide % total) + total) % total : 0;
  const slide = useMemo(
    () => (total ? slides[safeIndex] : null),
    [slides, safeIndex, total]
  );

  // preload
  useEffect(() => {
    slides.slice(0, 3).forEach((s) => {
      if (!s?.image) return;
      const img = new Image();
      img.src = s.image;
    });
  }, [slides]);

  const goToSlide = useCallback(
    (index) => {
      if (!total) return;
      const next = ((index % total) + total) % total;
      setCurrentSlide(next);
    },
    [total]
  );

  const nextSlide = useCallback(() => {
    if (!total) return;
    setCurrentSlide((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (!total) return;
    setCurrentSlide((prev) => (prev - 1 + total) % total);
  }, [total]);

  //  Autoplay (setTimeout loop = reliable)
  useEffect(() => {
    if (!total) return;
    if (!isPlaying) return;

    // keep autoplay even if reducedMotion is on
    const id = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % total);
    }, AUTOPLAY_MS);

    return () => clearTimeout(id);
  }, [isPlaying, total, currentSlide]);

  // Pause when hidden + resume when visible
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        wasPlayingRef.current = isPlaying;
        setIsPlaying(false);
      } else {
        setIsPlaying(wasPlayingRef.current);
      }
    };

    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [isPlaying]);

  // keyboard
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const onKeyDown = (e) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };

    el.addEventListener("keydown", onKeyDown);
    return () => el.removeEventListener("keydown", onKeyDown);
  }, [nextSlide, prevSlide]);

  // swipe
  const onTouchStart = (e) => {
    touchStartX.current = e.touches?.[0]?.clientX ?? null;
  };
  const onTouchEnd = (e) => {
    const start = touchStartX.current;
    const end = e.changedTouches?.[0]?.clientX ?? null;
    if (start == null || end == null) return;

    const dx = end - start;
    if (Math.abs(dx) < 40) return;

    if (dx > 0) prevSlide();
    else nextSlide();

    touchStartX.current = null;
  };

  if (!slide) {
    return (
      <section className="container-custom py-16">
        <div className="rounded-2xl bg-muted p-8 text-center">
          <p className="text-foreground font-medium">No hero slides found.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please check <code>heroSlides</code> data.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      tabIndex={0}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="relative overflow-hidden outline-none
             h-[70svh] md:h-[75vh] lg:h-[88vh]"
      aria-label="Hero carousel"
    >
      {/* background (no click blocking) */}
      {slides.map((s, index) => {
        const active = index === safeIndex;
        return (
          <div
            key={s.id ?? index}
            className={[
              "absolute inset-0 transition-opacity duration-700 pointer-events-none",
              active ? "opacity-100" : "opacity-0",
            ].join(" ")}
            aria-hidden={!active}
          >
            <img
              src={s.image}
              alt={s.heading}
              className={[
                "w-full h-full object-cover",
                reducedMotion ? "" : "scale-105",
              ].join(" ")}
              loading={active ? "eager" : "lazy"}
              onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          </div>
        );
      })}

      {/* content */}
      <div className="relative container-custom h-screen flex items-center">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/15 backdrop-blur-sm text-background text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-primary" />
            {slide.subtitle} • {slide.title}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif font-semibold text-background leading-[1.08] mb-6">
            {slide.heading}
          </h1>

          <p className="text-lg lg:text-xl text-background/85 max-w-lg mb-8">
            {slide.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to={slide.ctaLink}
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-base hover:opacity-90 transition"
            >
              {slide.cta}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/shop"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-background/10 text-background font-medium hover:bg-background/15 transition"
            >
              Browse all
            </Link>
          </div>
        </div>
      </div>

      {/* controls */}
      <div className="absolute bottom-6 left-0 right-0 container-custom flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {slides.map((_, index) => {
              const active = index === safeIndex;
              return (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={[
                    "h-2.5 rounded-full transition-all",
                    active
                      ? "w-8 bg-primary"
                      : "w-2.5 bg-background/45 hover:bg-background/70",
                  ].join(" ")}
                  aria-label={`Go to slide ${index + 1}`}
                  type="button"
                />
              );
            })}
          </div>

          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="p-2 rounded-full bg-background/10 backdrop-blur-sm text-background hover:bg-background/20 transition-colors"
            aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
            type="button"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={prevSlide}
            className="p-3 rounded-full bg-background/10 backdrop-blur-sm text-background hover:bg-background/20 transition-all hover:scale-[1.03]"
            aria-label="Previous slide"
            type="button"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={nextSlide}
            className="p-3 rounded-full bg-background/10 backdrop-blur-sm text-background hover:bg-background/20 transition-all hover:scale-[1.03]"
            aria-label="Next slide"
            type="button"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* counter */}
      <div className="absolute top-1/2 right-8 -translate-y-1/2 hidden lg:flex flex-col items-center gap-2 text-background/60">
        <span className="text-3xl font-serif font-semibold text-background">
          {String(safeIndex + 1).padStart(2, "0")}
        </span>
        <div className="w-px h-12 bg-background/30" />
        <span className="text-sm">{String(total).padStart(2, "0")}</span>
      </div>
    </section>
  );
}
