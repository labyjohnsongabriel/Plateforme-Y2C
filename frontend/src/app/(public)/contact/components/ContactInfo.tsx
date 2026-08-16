'use client';

import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { siteConfig } from '../../../../config/site';

export function ContactInfo() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <h3 className="font-ubuntu text-lg font-semibold">Informations de contact</h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 text-secondary" />
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{siteConfig.contact.email}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-5 w-5 text-secondary" />
            <div>
              <p className="font-medium">Téléphone</p>
              <p className="text-sm text-muted-foreground">{siteConfig.contact.phone}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 text-secondary" />
            <div>
              <p className="font-medium">Adresse</p>
              <p className="text-sm text-muted-foreground">{siteConfig.contact.address}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 text-secondary" />
            <div>
              <p className="font-medium">Horaires</p>
              <p className="text-sm text-muted-foreground">Lun - Ven: 8h - 17h</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}