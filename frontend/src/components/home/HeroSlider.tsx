'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const slides = [
  {
    id: 1,
    title: 'Youth Computing',
    subtitle: 'L\'avenir numérique de Madagascar',
    description: 'Promotion des NTIC et de l\'inclusion numérique pour tous',
    image: '/images/hero/slide-1.jpg',
    cta: 'Découvrir',
    link: '/a-propos',
  },
  {
    id: 2,
    title: 'Formations Innovantes',
    subtitle: 'Développez vos compétences',
    description: 'Des formations pratiques dans les technologies du futur',
    image: '/images/hero/slide-2.jpg',
    cta: 'Voir les formations',
    link: '/formations',
  },
  {
    id: 3,
    title: 'Communauté Y2C',
    subtitle: 'Rejoignez le mouvement',
    description: 'Une communauté dynamique de passionnés des NTIC',
    image: '/images/hero/slide-3.jpg',
    cta: 'Adhérer',
    link: '/communaute-y2c',
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  return (
    <section className="relative h-[90vh] min-h-[600px] w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <div className="relative h-full w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent dark:from-black/80 dark:via-black/60 z-10" />
            <Image
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              fill
              className="object-cover"
              priority
              quality={100}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Contenu */}
      <div className="absolute inset-0 z-20 flex items-center">
        <div className="container-custom">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-2xl"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-secondary text-white text-sm font-medium mb-4">
                {slides[currentSlide].subtitle}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-ubuntu text-white mb-4">
                {slides[currentSlide].title}
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-8">
                {slides[currentSlide].description}
              </p>
              <Button
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-white"
                onClick={() => {
                  window.location.href = slides[currentSlide].link;
                }}
              >
                {slides[currentSlide].cta}
              </Button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Contrôles */}
      <div className="absolute bottom-8 left-0 right-0 z-30 flex items-center justify-between container-custom">
        <div className="flex items-center gap-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentSlide(index);
                setIsAutoPlaying(false);
              }}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                currentSlide === index
                  ? 'w-8 bg-secondary'
                  : 'w-2 bg-white/50 hover:bg-white/80'
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevSlide}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* Indicateur de progression */}
      <div className="absolute bottom-0 left-0 z-30 h-1 bg-white/20 w-full">
        <motion.div
          className="h-full bg-secondary"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 5, ease: 'linear' }}
          key={currentSlide}
        />
      </div>
    </section>
  );
}