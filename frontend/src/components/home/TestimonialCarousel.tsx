'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const testimonials = [
  {
    id: 1,
    name: 'Marie R.',
    role: 'Développeuse Full-Stack',
    content: 'Youth Computing m\'a permis de développer mes compétences en programmation et de trouver ma voie dans le développement web. Une expérience transformative !',
    avatar: '/images/team/avatar-1.jpg',
    rating: 5,
  },
  {
    id: 2,
    name: 'Jean-Claude M.',
    role: 'Étudiant en Informatique',
    content: 'La communauté Y2C est incroyable ! J\'ai rencontré des personnes passionnées et j\'ai participé à des projets concrets qui ont boosté ma carrière.',
    avatar: '/images/team/avatar-2.jpg',
    rating: 5,
  },
  {
    id: 3,
    name: 'Aina R.',
    role: 'Entrepreneur Tech',
    content: 'Grâce aux formations de Youth Computing, j\'ai pu lancer ma startup et créer des solutions innovantes pour le marché malgache.',
    avatar: '/images/team/avatar-3.jpg',
    rating: 4,
  },
];

export default function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <div className="relative max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-border"
        >
          <Quote className="h-12 w-12 text-secondary/30 mb-6" />
          <p className="text-lg md:text-xl text-foreground/80 mb-6 italic">
            "{testimonials[current].content}"
          </p>
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted">
              <Image
                src={testimonials[current].avatar}
                alt={testimonials[current].name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="font-semibold font-ubuntu">
                {testimonials[current].name}
              </div>
              <div className="text-sm text-muted-foreground">
                {testimonials[current].role}
              </div>
            </div>
            <div className="ml-auto flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'text-sm',
                    i < testimonials[current].rating
                      ? 'text-yellow-500'
                      : 'text-muted'
                  )}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center gap-3 mt-6">
        <button
          onClick={prev}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                current === index
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}