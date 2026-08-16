'use client';

import { ExportToExcel } from '@/components/admin/ExportToExcel';
import { useRegistrationsData } from '@/hooks/useRegistrationsData';

export function ExportButton() {
  const { data, loading } = useRegistrationsData();

  const columns = [
    { key: 'firstName', label: 'Prénom' },
    { key: 'lastName', label: 'Nom' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Téléphone' },
    { key: 'status', label: 'Statut' },
    { key: 'paymentStatus', label: 'Paiement' },
    { key: 'createdAt', label: 'Date d\'inscription' },
  ];

  return <ExportToExcel data={data || []} filename="inscriptions" columns={columns} />;
}