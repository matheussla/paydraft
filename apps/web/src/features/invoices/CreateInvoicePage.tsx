import React from 'react';
import { InvoiceForm } from './components';

export const CreateInvoicePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
        <p className="mt-2 text-sm text-gray-600">
          Create a new invoice as a draft. You can issue it later to make it payable.
        </p>
      </div>

      <InvoiceForm mode="create" />
    </div>
  );
};
