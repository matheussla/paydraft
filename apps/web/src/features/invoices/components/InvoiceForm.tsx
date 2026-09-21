import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { IInvoice, ICreateInvoiceRequest, ILineItem } from '@paydraft/shared';
import { LineItemsEditor } from './LineItemsEditor';
import { invoicesApi, ApiError } from '../../../shared/api';

interface InvoiceFormProps {
  invoice?: IInvoice;
  mode: 'create' | 'edit';
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, mode }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isIssued = invoice && invoice.status !== 'draft';

  const [formData, setFormData] = React.useState({
    clientName: invoice?.clientName || '',
    clientEmail: invoice?.clientEmail || '',
    clientWalletAddress: invoice?.clientWalletAddress || '',
    freelancerName: invoice?.freelancerName || '',
    freelancerEmail: invoice?.freelancerEmail || '',
    freelancerWalletAddress: invoice?.freelancerWalletAddress || '',
    lineItems: (invoice?.lineItems || [
      { description: '', quantity: 1, unitPrice: '0', amount: '0' },
    ]) as ILineItem[],
    currency: invoice?.currency || 'Demo USDC',
    dueDate: invoice?.dueDate ? new Date(invoice.dueDate).toISOString().slice(0, 16) : '',
    notes: invoice?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dueDateISO = new Date(formData.dueDate).toISOString();

      if (mode === 'create') {
        const payload: ICreateInvoiceRequest = {
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          clientWalletAddress: formData.clientWalletAddress || undefined,
          freelancerName: formData.freelancerName,
          freelancerEmail: formData.freelancerEmail,
          freelancerWalletAddress: formData.freelancerWalletAddress,
          lineItems: formData.lineItems,
          currency: formData.currency,
          dueDate: dueDateISO,
          notes: formData.notes || undefined,
        };

        const created = await invoicesApi.create(payload);
        navigate(`/invoices/${created.id}`);
      } else if (invoice) {
        const updated = await invoicesApi.update(invoice.id, {
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          clientWalletAddress: formData.clientWalletAddress || undefined,
          lineItems: formData.lineItems,
          dueDate: dueDateISO,
          notes: formData.notes || undefined,
        });
        navigate(`/invoices/${updated.id}`);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to save invoice');
      }
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Client Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">
              Client Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="clientName"
              value={formData.clientName}
              onChange={(e) => handleChange('clientName', e.target.value)}
              disabled={isIssued}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-solana-purple focus:ring-solana-purple sm:text-sm border px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            />
          </div>

          <div>
            <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Client Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="clientEmail"
              value={formData.clientEmail}
              onChange={(e) => handleChange('clientEmail', e.target.value)}
              disabled={isIssued}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-solana-purple focus:ring-solana-purple sm:text-sm border px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="clientWalletAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Client Wallet Address (Optional)
            </label>
            <input
              type="text"
              id="clientWalletAddress"
              value={formData.clientWalletAddress}
              onChange={(e) => handleChange('clientWalletAddress', e.target.value)}
              disabled={isIssued}
              placeholder="Local demo wallet address"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-solana-purple focus:ring-solana-purple sm:text-sm border px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Freelancer Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="freelancerName" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="freelancerName"
              value={formData.freelancerName}
              onChange={(e) => handleChange('freelancerName', e.target.value)}
              disabled={isIssued}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-solana-purple focus:ring-solana-purple sm:text-sm border px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            />
          </div>

          <div>
            <label htmlFor="freelancerEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Your Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="freelancerEmail"
              value={formData.freelancerEmail}
              onChange={(e) => handleChange('freelancerEmail', e.target.value)}
              disabled={isIssued}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-solana-purple focus:ring-solana-purple sm:text-sm border px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="freelancerWalletAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Your Wallet Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="freelancerWalletAddress"
              value={formData.freelancerWalletAddress}
              onChange={(e) => handleChange('freelancerWalletAddress', e.target.value)}
              disabled={isIssued}
              placeholder="Local demo wallet address"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-solana-purple focus:ring-solana-purple sm:text-sm border px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <LineItemsEditor
          items={formData.lineItems}
          onChange={(items) => setFormData((prev) => ({ ...prev, lineItems: items }))}
          disabled={isIssued}
        />
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Additional Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="dueDate"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-solana-purple focus:ring-solana-purple sm:text-sm border px-3 py-2"
              required
            />
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <input
              type="text"
              id="currency"
              value={formData.currency}
              disabled
              className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border px-3 py-2 bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              rows={4}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes or payment instructions"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-solana-purple focus:ring-solana-purple sm:text-sm border px-3 py-2"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solana-purple"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || isIssued}
          className="px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-solana-purple hover:bg-solana-purple-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solana-purple disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Invoice' : 'Update Invoice'}
        </button>
      </div>
    </form>
  );
};
