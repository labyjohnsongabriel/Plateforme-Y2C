'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, User, Briefcase } from 'lucide-react';

// Données statiques
const organigrammeData = {
  president: { name: 'Jean Rakoto', role: 'Président' },
  vicePresident: { name: 'Marie Claire', role: 'Vice-Présidente' },
  departments: [
    { name: 'Formations', head: 'David Andriamahazo', members: ['Sarah Raza', 'Lala Randria', 'Mamy Rakoto'] },
    { name: 'Technique', head: 'Rivo Andriamanantena', members: ['Tina Ravelo', 'Nivo Rakotomalala', 'Faly Ranaivo'] },
    { name: 'Communication', head: 'Hanta Razafindrakoto', members: ['Aina Ravelonirina', 'Mira Randria', 'Tahina Rakoto'] },
  ],
};

export function OrganigrammeSection() {
  return (
    <section className="py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mb-8"
      >
        <h2 className="font-ubuntu text-2xl font-bold text-primary dark:text-white">
          Organigramme
        </h2>
        <div className="mt-2 h-1 w-20 bg-secondary rounded-full" />
        <p className="mt-4 text-muted-foreground">
          Structure organisationnelle de Youth Computing
        </p>
      </motion.div>

      <div className="flex flex-col items-center">
        {/* Président */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-4"
        >
          <Card className="border-2 border-secondary/30 bg-secondary/5 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-3">
                <User className="h-6 w-6 text-secondary" />
                <div>
                  <h3 className="font-ubuntu text-xl font-semibold">{organigrammeData.president.name}</h3>
                  <p className="text-sm text-muted-foreground">{organigrammeData.president.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <ChevronDown className="mx-auto mt-2 h-6 w-6 text-muted-foreground animate-bounce" />
        </motion.div>

        {/* Vice-Président */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <Card className="border border-primary/20 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-ubuntu font-semibold">{organigrammeData.vicePresident.name}</h4>
                  <p className="text-sm text-muted-foreground">{organigrammeData.vicePresident.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <ChevronDown className="mx-auto mt-2 h-6 w-6 text-muted-foreground" />
        </motion.div>

        {/* Départements */}
        <div className="grid w-full gap-6 md:grid-cols-3">
          {organigrammeData.departments.map((dept, index) => (
            <motion.div
              key={dept.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <h4 className="font-ubuntu text-lg font-semibold text-primary">
                      {dept.name}
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Responsable : <span className="font-medium text-foreground">{dept.head}</span>
                  </p>
                  <div className="mt-3 space-y-1">
                    {dept.members.map((member) => (
                      <p key={member} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-secondary/60" />
                        {member}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}