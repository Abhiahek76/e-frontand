import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import { heroSlides } from "../data/product";

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback(
    (index) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 600);
    },
    [isTransitioning]
  );

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % heroSlides.length);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length);
  }, [currentSlide, goToSlide]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, nextSlide]);

  const slide = heroSlides[currentSlide];

  return (
    <section className="relative min-h-[85vh] lg:min-h-[90vh] overflow-hidden">
      {/* Background Images */}
      {heroSlides.map((s, index) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={s.image}
            alt={s.heading}
            className="w-full h-full object-cover scale-105"
            onError={(e) => {
              e.currentTarget.src = "/fallback.jpg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative container-custom h-full min-h-[85vh] lg:min-h-[90vh] flex items-center">
        <div className="max-w-2xl py-20 lg:py-0">
          {/* Subtitle Badge */}
          <div
            key={`badge-${currentSlide}`}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/10 backdrop-blur-sm text-background text-sm font-medium mb-6 animate-fade-up"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            {slide.subtitle} • {slide.title}
          </div>

          {/* Heading */}
          <h1
            key={`heading-${currentSlide}`}
            className="text-4xl sm:text-5xl lg:text-7xl font-serif font-semibold text-background leading-[1.1] mb-6 animate-fade-up stagger-1"
          >
            {slide.heading}
          </h1>

          {/* Description */}
          <p
            key={`desc-${currentSlide}`}
            className="text-lg lg:text-xl text-background/85 max-w-lg mb-8 animate-fade-up stagger-2"
          >
            {slide.description}
          </p>

          {/* CTA Buttons */}
          <div
            key={`cta-${currentSlide}`}
            className="flex flex-col sm:flex-row gap-4 animate-fade-up stagger-3"
          >
            {/* Primary */}
            <Link
              to={slide.ctaLink}
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md
                         bg-background text-foreground font-medium text-base
                         hover:opacity-90 transition"
            >
              {slide.cta}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>

            {/* Secondary */}
            <Link
              to="/shop"
              className="inline-flex items-center justify-center px-6 py-3 rounded-md
                         border border-background/30 text-background font-medium
                         hover:bg-background/10 hover:border-background/50 transition"
            >
              Browse All
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-0 right-0 container-custom flex items-center justify-between">
        {/* Dots & Play/Pause */}
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`carousel-dot ${
                  index === currentSlide ? "carousel-dot-active" : ""
                }`}
                aria-label={`Go to slide ${index + 1}`}
                type="button"
              />
            ))}
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
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

        {/* Arrows */}
        <div className="flex gap-2">
          <button
            onClick={prevSlide}
            className="p-3 rounded-full bg-background/10 backdrop-blur-sm text-background hover:bg-background/20 transition-all hover:scale-105"
            aria-label="Previous slide"
            type="button"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="p-3 rounded-full bg-background/10 backdrop-blur-sm text-background hover:bg-background/20 transition-all hover:scale-105"
            aria-label="Next slide"
            type="button"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Slide Counter */}
      <div className="absolute top-1/2 right-8 -translate-y-1/2 hidden lg:flex flex-col items-center gap-2 text-background/60">
        <span className="text-3xl font-serif font-semibold text-background">
          0{currentSlide + 1}
        </span>
        <div className="w-px h-12 bg-background/30" />
        <span className="text-sm">0{heroSlides.length}</span>
      </div>
    </section>
  );
};

export default HeroCarousel;
