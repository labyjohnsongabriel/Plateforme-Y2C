'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  Facebook, 
  Instagram, 
  Linkedin, 
  Twitter, 
  MapPin, 
  Phone, 
  Mail, 
  Send,
  Heart
} from 'lucide-react';

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com/youthcomputing', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com/youthcomputing', label: 'Instagram' },
  { icon: Linkedin, href: 'https://linkedin.com/company/youthcomputing', label: 'LinkedIn' },
  { icon: Twitter, href: 'https://twitter.com/youthcomputing', label: 'Twitter' },
];

const quickLinks = [
  { name: 'Accueil', href: '/' },
  { name: 'À Propos', href: '/a-propos' },
  { name: 'Formations', href: '/formations' },
  { name: 'Communauté Y2C', href: '/communaute-y2c' },
  { name: 'Projets', href: '/projets' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
];

const contactInfo = [
  { icon: MapPin, text: 'Fianarantsoa, Madagascar' },
  { icon: Phone, text: '+261 34 00 000 00' },
  { icon: Mail, text: 'contact@youthcomputing.mg' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary dark:bg-primary-dark text-white">
      <div className="container-custom section-padding">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-10 h-10">
                <Image
                  src="/images/brand/logo-white.svg"
                  alt="Youth Computing"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-ubuntu font-bold text-lg">
                Youth Computing
              </span>
            </div>
            <p className="text-white/70 text-sm mb-4">
              Promouvoir l&apos;inclusion numérique et l&apos;innovation à Madagascar
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="font-ubuntu font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-ubuntu font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              {contactInfo.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li key={index} className="flex items-center gap-3 text-white/70 text-sm">
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span>{item.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-ubuntu font-semibold mb-4">Newsletter</h3>
            <p className="text-white/70 text-sm mb-4">
              Abonnez-vous pour recevoir nos actualités
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary-dark transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/60">
            <p>
              © {currentYear} Youth Computing. Tous droits réservés.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/mentions-legales" className="hover:text-white transition-colors">
                Mentions légales
              </Link>
              <Link href="/politique-confidentialite" className="hover:text-white transition-colors">
                Politique de confidentialité
              </Link>
              <Link href="/cgv" className="hover:text-white transition-colors">
                CGV
              </Link>
            </div>
            <p className="flex items-center gap-1">
              Fait avec <Heart className="h-3 w-3 text-secondary" /> à Madagascar
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}