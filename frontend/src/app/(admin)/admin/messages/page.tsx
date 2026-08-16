'use client';

import { useState, useEffect } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { MessagesTable } from './components/MessagesTable';
import { contact } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminMessagesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await contact.getAll();
        setData(response.data.data || []);
      } catch (error) {
        toast.error('Erreur lors du chargement des messages');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="font-ubuntu text-3xl font-bold text-foreground">
            Messages de contact
          </h1>
          <p className="text-muted-foreground">Consultez et répondez aux messages</p>
        </div>
        <MessagesTable data={data} loading={loading} />
      </div>
    </PageTransition>
  );
}