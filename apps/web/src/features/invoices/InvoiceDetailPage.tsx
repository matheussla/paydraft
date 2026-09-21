import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { IInvoice } from '@paydraft/shared';
import { invoicesApi, ApiError } from '../../shared/api';
import { formatUSDC, formatDate } from '../../shared/utils';

export const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = React.useState<IInvoice | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [issuing, setIssuing] = React.useState(false);

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

  React.useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleIssue = async () => {
    if (!invoice) return;

    try {
      setIssuing(true);
      const issued = await invoicesApi.issue(invoice.id);
      setInvoice(issued);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to issue invoice');
      }
    } finally {
      setIssuing(false);
    }
  };

  const handleDelete = async () => {
    if (!invoice || !confirm('Are you sure you want to delete this invoice?')) return;

    try {
      await invoicesApi.delete(invoice.id);
      navigate('/invoices');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to delete invoice');
      }
    }
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'unpaid':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canEdit = invoice.status === 'draft';
  const canIssue = invoice.status === 'draft';
  const canDelete = invoice.status === 'draft';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Link
            to="/invoices"
            className="text-solana-purple hover:text-solana-purple-dark font-medium text-sm mb-2 inline-block"
          >
            ← Back to invoices
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
          <div className="mt-2">
            <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
              {invoice.status}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          {canEdit && (
            <Link
              to={`/invoices/${invoice.id}/edit`}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solana-purple"
            >
              Edit
            </Link>
          )}
          {canIssue && (
            <button
              onClick={handleIssue}
              disabled={issuing}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-solana-green hover:bg-solana-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solana-green disabled:opacity-50"
            >
              {issuing ? 'Issuing...' : 'Issue Invoice'}
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete
            </button>
          )}
          {invoice.status !== 'draft' && invoice.status !== 'paid' && (
            <Link
              to={`/pay/${invoice.paymentId}`}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-solana-purple hover:bg-solana-purple-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solana-purple"
            >
              Pay Invoice
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{invoice.clientName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{invoice.clientEmail}</dd>
              </div>
              {invoice.clientWalletAddress && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Wallet Address</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono break-all">
                    {invoice.clientWalletAddress}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Line Items</h2>
            <div className="space-y-4">
              {invoice.lineItems.map((item, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{item.description}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Quantity: {item.quantity} × {formatUSDC(item.unitPrice)} Demo USDC
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {formatUSDC(item.amount)} Demo USDC
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t-2 border-gray-300">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-solana-purple">
                    {formatUSDC(invoice.total)} Demo USDC
                  </span>
                </div>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Invoice Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{invoice.invoiceNumber}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Issued Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(invoice.issuedDate)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(invoice.dueDate)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Currency</dt>
                <dd className="mt-1 text-sm text-gray-900">{invoice.currency}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Freelancer Information</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{invoice.freelancerName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{invoice.freelancerEmail}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Wallet Address</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono break-all">
                  {invoice.freelancerWalletAddress}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};
