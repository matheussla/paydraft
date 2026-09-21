import React from 'react';
import { Link } from 'react-router-dom';

export const InvoicesPage: React.FC = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <Link
          to="/invoices/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-solana-purple hover:bg-solana-purple-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solana-purple"
        >
          Create Invoice
        </Link>
      </div>
      <p className="text-gray-600">Invoice list will appear here</p>
    </div>
  );
};
