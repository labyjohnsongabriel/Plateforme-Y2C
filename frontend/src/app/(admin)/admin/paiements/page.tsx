'use client';

import { useState, useEffect } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { PaymentsTable } from './components/PaymentsTable';
import { payments } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminPaymentsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await payments.getAll();
        setData(response.data.data || []);
      } catch (error) {
        toast.error('Erreur lors du chargement des paiements');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="font-ubuntu text-3xl font-bold text-foreground">
            Paiements
          </h1>
          <p className="text-muted-foreground">Consultez et gérez les paiements</p>
        </div>
        <PaymentsTable data={data} loading={loading} />
      </div>
    </PageTransition>
  );
}