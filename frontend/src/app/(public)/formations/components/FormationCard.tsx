'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, Users, MapPin, ChevronRight, Calendar, Star, User } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency, formatDateShort } from '@/lib/utils';
import type { Formation } from '@/types';

interface FormationCardProps {
  formation: Formation;
  className?: string;
  index?: number;
}

export function FormationCard({ formation, className, index = 0 }: FormationCardProps) {
  const {
    title,
    slug,
    description,
    duration,
    level,
    price,
    category,
    imageUrl,
    isPublished,
    sessions,
    instructor,
    rating,
    reviewsCount,
  } = formation;

  const nextSession = sessions?.find((s) => new Date(s.startDate) > new Date());
  const hasSessions = sessions && sessions.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="h-full"
    >
      <Card className={cn('group h-full overflow-hidden transition-all duration-300 hover:shadow-xl', className)}>
        {/* Image */}
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-5xl font-bold text-primary/20">{title.charAt(0)}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Badges */}
          <Badge variant={isPublished ? 'default' : 'secondary'} className="absolute right-3 top-3">
            {isPublished ? 'Publié' : 'Brouillon'}
          </Badge>
          <Badge variant="outline" className="absolute left-3 top-3 border-white/20 bg-black/40 text-white backdrop-blur-sm">
            {category}
          </Badge>
          <Badge className="absolute bottom-3 left-3 bg-secondary text-white">{level}</Badge>
          {rating && (
            <Badge variant="outline" className="absolute bottom-3 right-3 bg-black/40 text-white backdrop-blur-sm border-white/20">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
              {rating.toFixed(1)} ({reviewsCount || 0})
            </Badge>
          )}
        </div>

        <CardHeader className="space-y-1">
          <CardTitle className="line-clamp-2 font-ubuntu text-xl">
            <Link href={`/formations/${slug}`} className="hover:text-secondary transition-colors">
              {title}
            </Link>
          </CardTitle>
          <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Métadonnées */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{formation.maxParticipants || 'Illimité'}</span>
            </div>
            {instructor && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span className="truncate max-w-[100px]">{instructor}</span>
              </div>
            )}
          </div>

          {/* Prochaine session */}
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-primary">
              {price && price > 0 ? formatCurrency(price) : 'Gratuit'}
            </span>
            {nextSession && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDateShort(nextSession.startDate)}
              </span>
            )}
          </div>

          {/* Indicateur de sessions */}
          {hasSessions && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
              {sessions.length} session(s) disponible(s)
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t pt-4">
          <Button asChild className="w-full gap-2 group-hover:bg-secondary/90">
            <Link href={`/formations/${slug}`}>
              Voir la formation
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}