'use client';

import { motion } from 'framer-motion';
import { PageTransition } from '../../../components/shared/PageTransition';
import { ContactForm } from './components/ContactForm';
import { ContactInfo } from './components/ContactInfo';
import { ContactMap } from './components/ContactMap';

export default function ContactPage() {
  return (
    <PageTransition>
      <div className="container-custom py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="font-ubuntu text-4xl font-bold md:text-5xl">
            Contactez-<span className="text-secondary">nous</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            N'hésitez pas à nous contacter pour toute question ou collaboration
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
          <div>
            <ContactInfo />
          </div>
        </div>

        <div className="mt-12">
          <ContactMap />
        </div>
      </div>
    </PageTransition>
  );
}