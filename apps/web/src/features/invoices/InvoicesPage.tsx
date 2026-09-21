import React from 'react';
import { Link } from 'react-router-dom';
import { useInvoices } from '../../shared/hooks';
import { InvoiceTable } from './components';

export const InvoicesPage: React.FC = () => {
  const { invoices, loading, error } = useInvoices();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-solana-purple"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <Link
            to="/invoices/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-solana-purple hover:bg-solana-purple-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solana-purple"
          >
            Create Invoice
          </Link>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold mb-2">Error loading invoices</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <Link
          to="/invoices/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-solana-purple hover:bg-solana-purple-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solana-purple"
        >
          Create Invoice
        </Link>
      </div>

      <InvoiceTable invoices={invoices} />
    </div>
  );
};
