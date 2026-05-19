import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeroSection() {
  const [current, setCurrent] = useState(0);

  const { data: slides = [], isLoading } = useQuery({
    queryKey: ['hero-banners'],
    queryFn: () => api.entities.Banner.filter({ active: true }, { column: 'sort_order', order: 'asc' }),
  });

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (isLoading) {
    return <div className="w-full aspect-[3/1] md:aspect-[1920/336] bg-gray-100 animate-pulse" />;
  }

  if (slides.length === 0) return null;

  const safeCurrent = current % slides.length || 0;
  const slide = slides[safeCurrent];
  const linkUrl = slide.category ? `/catalogo?categoria=${slide.category}` : '/catalogo';
  const imageUrl = slide.image_url;

  return (
    <section className="relative w-full overflow-hidden bg-gray-100">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <Link to={linkUrl} className="block w-full aspect-[3/1] md:aspect-[1920/336]">
            <picture className="w-full h-full">
              {slide.mobile_image_url && (
                <source media="(max-width: 767px)" srcSet={slide.mobile_image_url} />
              )}
              <img
                src={imageUrl}
                alt={slide.title || 'Banner'}
                className="w-full h-full object-cover block"
              />
            </picture>
          </Link>
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
          <button onClick={() => setCurrent((current - 1 + slides.length) % slides.length)}>
            <ChevronLeft className="h-4 w-4 text-white/70 hover:text-white drop-shadow transition-colors" />
          </button>
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-0.5 rounded-full transition-all duration-500 ${i === safeCurrent ? 'w-6 bg-white' : 'w-3 bg-white/40'}`}
              />
            ))}
          </div>
          <button onClick={() => setCurrent((current + 1) % slides.length)}>
            <ChevronRight className="h-4 w-4 text-white/70 hover:text-white drop-shadow transition-colors" />
          </button>
        </div>
      )}
    </section>
  );
}
