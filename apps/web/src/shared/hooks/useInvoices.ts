import { useState, useEffect } from 'react';
import type { IInvoice } from '@paydraft/shared';
import { invoicesApi, ApiError } from '../api';

interface UseInvoicesResult {
  invoices: IInvoice[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useInvoices(): UseInvoicesResult {
  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await invoicesApi.list();
      setInvoices(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load invoices');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    invoices,
    loading,
    error,
    refresh: fetchInvoices,
  };
}
