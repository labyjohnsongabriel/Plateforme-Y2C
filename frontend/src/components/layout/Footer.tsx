'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { footerNavigation } from '@/config/navigation';
import { siteConfig } from '@/config/site';

export function Footer() {
  const year = new Date().getFullYear();

  const socialIcons = {
    facebook: Facebook,
    instagram: Instagram,
    linkedin: Linkedin,
    twitter: Twitter,
  };

  return (
    <footer className="bg-primary text-white">
      <div className="container-custom py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h3 className="font-ubuntu text-2xl font-bold">
              <span className="text-white">Youth</span>
              <span className="text-secondary">Computing</span>
            </h3>
            <p className="text-sm text-white/70">
              Association pour la promotion des NTIC à Madagascar.
            </p>
            <div className="flex gap-3">
              {footerNavigation.social.map((item) => {
                const Icon = socialIcons[item.icon as keyof typeof socialIcons];
                return Icon ? (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="rounded-full bg-white/10 p-2 transition-colors hover:bg-secondary"
                    aria-label={item.label}
                  >
                    <Icon className="h-4 w-4" />
                  </motion.a>
                ) : null;
              })}
            </div>
          </motion.div>

          {/* Company */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h4 className="font-ubuntu font-semibold">Youth Computing</h4>
            <ul className="space-y-2 text-sm text-white/70">
              {footerNavigation.company.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 transition-colors hover:text-secondary"
                  >
                    <ChevronRight className="h-3 w-3" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <h4 className="font-ubuntu font-semibold">Services</h4>
            <ul className="space-y-2 text-sm text-white/70">
              {footerNavigation.services.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 transition-colors hover:text-secondary"
                  >
                    <ChevronRight className="h-3 w-3" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            <h4 className="font-ubuntu font-semibold">Contact</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary" />
                <span>{siteConfig.contact.email}</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary" />
                <span>{siteConfig.contact.phone}</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary" />
                <span>{siteConfig.contact.address}</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-white/10 pt-6 text-center text-sm text-white/50">
          <p>
            &copy; {year} Youth Computing. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}