'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, GraduationCap, Heart, Briefcase } from 'lucide-react';

interface StatsCounterProps {
  stats: {
    members: number;
    formations: number;
    beneficiaries: number;
    projects: number;
  };
}

const StatItem = ({ 
  value, 
  label, 
  icon: Icon, 
  delay 
}: { 
  value: number; 
  label: string; 
  icon: any; 
  delay: number;
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay }}
      className="text-center"
    >
      <div className="flex justify-center mb-3">
        <div className="p-3 rounded-full bg-primary/10 dark:bg-primary/20">
          <Icon className="h-8 w-8 text-primary dark:text-primary-light" />
        </div>
      </div>
      <div className="text-3xl md:text-4xl font-bold font-ubuntu text-foreground">
        {count}+
      </div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </motion.div>
  );
};

export default function StatsCounter({ stats }: StatsCounterProps) {
  const items = [
    { value: stats.members, label: 'Membres Actifs', icon: Users },
    { value: stats.formations, label: 'Formations', icon: GraduationCap },
    { value: stats.beneficiaries, label: 'Bénéficiaires', icon: Heart },
    { value: stats.projects, label: 'Projets', icon: Briefcase },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {items.map((item, index) => (
        <StatItem
          key={index}
          value={item.value}
          label={item.label}
          icon={item.icon}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
}
