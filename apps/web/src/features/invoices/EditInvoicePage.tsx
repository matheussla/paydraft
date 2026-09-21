import React from 'react';
import { useParams, Link } from 'react-router-dom';
import type { IInvoice } from '@paydraft/shared';
import { invoicesApi, ApiError } from '../../shared/api';
import { InvoiceForm } from './components';

export const EditInvoicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = React.useState<IInvoice | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await invoicesApi.get(id);
        setInvoice(data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Failed to load invoice');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-solana-purple"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold mb-2">Error loading invoice</h3>
          <p className="text-red-600">{error || 'Invoice not found'}</p>
        </div>
        <Link
          to="/invoices"
          className="text-solana-purple hover:text-solana-purple-dark font-medium"
        >
          ← Back to invoices
        </Link>
      </div>
    );
  }

  if (invoice.status !== 'draft') {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-yellow-800 font-semibold mb-2">Cannot edit issued invoice</h3>
          <p className="text-yellow-700">
            This invoice has been issued and cannot be edited. Only draft invoices can be modified.
          </p>
        </div>
        <Link
          to={`/invoices/${invoice.id}`}
          className="text-solana-purple hover:text-solana-purple-dark font-medium"
        >
          ← Back to invoice
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to={`/invoices/${invoice.id}`}
          className="text-solana-purple hover:text-solana-purple-dark font-medium text-sm mb-2 inline-block"
        >
          ← Back to invoice
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Invoice</h1>
        <p className="mt-2 text-sm text-gray-600">
          Update invoice details. Changes can only be made while the invoice is in draft status.
        </p>
      </div>

      <InvoiceForm invoice={invoice} mode="edit" />
    </div>
  );
};
