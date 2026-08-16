'use client';

import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import communityAnimation from '../../../../../public/animations/community.json';

export function CommunityPresentation() {
  return (
    <section className="mb-12">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="order-2 lg:order-1"
        >
          <div className="h-64 w-full lg:h-96">
            <Lottie animationData={communityAnimation} loop={true} autoplay={true} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="order-1 lg:order-2"
        >
          <h2 className="font-ubuntu text-2xl font-bold text-primary dark:text-white">
            Une communauté pour les passionnés des NTIC
          </h2>
          <p className="mt-4 text-muted-foreground">
            La communauté Y2C est un espace d'échange et de partage pour les étudiants
            et passionnés des Nouvelles Technologies de l'Information et de la Communication
            à Madagascar.
          </p>
          <ul className="mt-6 space-y-2">
            <li className="flex items-center gap-2 text-sm">
              <span className="text-secondary">✓</span>
              Échanger avec d'autres passionnés
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="text-secondary">✓</span>
              Participer à des événements exclusifs
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="text-secondary">✓</span>
              Accéder à des ressources éducatives
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="text-secondary">✓</span>
              Collaborer sur des projets innovants
            </li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
}