import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { IInvoice, IPayment } from '@paydraft/shared';
import { invoicesApi, paymentsApi, ApiError } from '../../shared/api';
import { formatUSDC, formatDate, formatDateTime } from '../../shared/utils';

export const PaymentPage: React.FC = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = React.useState<IInvoice | null>(null);
  const [payment, setPayment] = React.useState<IPayment | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [paying, setPaying] = React.useState(false);

  const fetchData = async () => {
    if (!paymentId) return;

    try {
      setLoading(true);
      setError(null);

      const invoiceList = await invoicesApi.list();
      const foundInvoice = invoiceList.find(inv => inv.paymentId === paymentId);

      if (!foundInvoice) {
        setError('Invoice not found for this payment ID');
        return;
      }

      setInvoice(foundInvoice);

      if (foundInvoice.status !== 'unpaid' && foundInvoice.status !== 'draft') {
        const existingPayment = await paymentsApi.getPaymentByInvoice(foundInvoice.id);
        if (existingPayment) {
          setPayment(existingPayment);
        }
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load payment information');
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [paymentId]);

  React.useEffect(() => {
    if (invoice?.status === 'paid' && !paying) {
      setTimeout(() => {
        navigate(`/receipts/${invoice.id}`);
      }, 2000);
    }
  }, [invoice?.status, invoice?.id, navigate, paying]);

  const handlePay = async () => {
    if (!invoice) return;

    try {
      setPaying(true);
      setError(null);

      const initiatedPayment = await paymentsApi.initiatePayment(invoice.id);
      setPayment(initiatedPayment);

      await fetchData();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Payment failed. Please try again.');
      }
      setPaying(false);
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
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-600">{error || 'Payment information not found'}</p>
        </div>
      </div>
    );
  }

  const isPaid = invoice.status === 'paid';
  const isPending = invoice.status === 'pending';
  const canPay = invoice.status === 'unpaid' && !paying;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-700"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-800">
              <strong className="font-bold">LOCAL DEMO PAYMENT:</strong> This payment uses demo-signing on
              the backend with a local Solana validator. No browser wallet is required. Demo USDC tokens
              have <strong className="font-bold">NO MONETARY VALUE</strong>.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-solana-purple to-solana-green px-6 py-8">
          <h1 className="text-3xl font-bold text-white">Payment Request</h1>
          <p className="mt-2 text-purple-100">Invoice {invoice.invoiceNumber}</p>
        </div>

        <div className="px-6 py-8 space-y-6">
          {isPaid && payment && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <svg
                  className="h-8 w-8 text-green-600 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h2 className="text-xl font-bold text-green-900">Payment Confirmed</h2>
                  <p className="text-green-700">This invoice has been paid successfully</p>
                </div>
              </div>
              {payment.transactionSignature && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="text-sm text-green-700 mb-2">
                    <strong>Transaction Signature:</strong>
                  </p>
                  <p className="text-xs font-mono text-green-900 break-all bg-green-100 p-2 rounded">
                    {payment.transactionSignature}
                  </p>
                </div>
              )}
            </div>
          )}

          {isPending && payment && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                <div>
                  <h2 className="text-xl font-bold text-blue-900">Payment Pending</h2>
                  <p className="text-blue-700">
                    Your payment is being processed. This may take a few moments.
                  </p>
                </div>
              </div>
              {payment.transactionSignature && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-sm text-blue-700 mb-2">
                    <strong>Transaction Signature:</strong>
                  </p>
                  <p className="text-xs font-mono text-blue-900 break-all bg-blue-100 p-2 rounded">
                    {payment.transactionSignature}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Bill To</h3>
              <div className="text-sm text-gray-900">
                <p className="font-semibold">{invoice.clientName}</p>
                <p>{invoice.clientEmail}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Bill From</h3>
              <div className="text-sm text-gray-900">
                <p className="font-semibold">{invoice.freelancerName}</p>
                <p>{invoice.freelancerEmail}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Invoice Date</h3>
              <p className="text-sm text-gray-900">{formatDate(invoice.issuedDate)}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Due Date</h3>
              <p className="text-sm text-gray-900">{formatDate(invoice.dueDate)}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>
            <div className="space-y-3">
              {invoice.lineItems.map((item, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.quantity} × {formatUSDC(item.unitPrice)} Demo USDC
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 ml-4">
                    {formatUSDC(item.amount)} Demo USDC
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t-2 border-gray-300 pt-6">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">Total Amount Due</span>
              <span className="text-3xl font-bold text-solana-purple">
                {formatUSDC(invoice.total)} Demo USDC
              </span>
            </div>
          </div>

          {invoice.notes && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}

          {payment && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
              <dl className="grid grid-cols-1 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        payment.status
                      )}`}
                    >
                      {payment.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Payment ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono break-all">{payment.id}</dd>
                </div>
                {payment.blockTime && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Block Time</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDateTime(new Date(payment.blockTime * 1000).toISOString())}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            {canPay ? (
              <button
                onClick={handlePay}
                disabled={paying}
                className="w-full px-6 py-4 border border-transparent text-lg font-medium rounded-lg shadow-lg text-white bg-gradient-to-r from-solana-purple to-solana-green hover:from-solana-purple-dark hover:to-solana-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solana-purple disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {paying ? 'Processing Payment...' : 'Pay with Demo USDC'}
              </button>
            ) : isPending ? (
              <div className="bg-gray-100 text-center py-4 rounded-lg">
                <p className="text-gray-600">Payment is being processed...</p>
              </div>
            ) : isPaid ? (
              <div className="space-y-4">
                <div className="bg-gray-100 text-center py-4 rounded-lg">
                  <p className="text-gray-600">This invoice has been paid</p>
                  <p className="text-sm text-gray-500 mt-2">Redirecting to receipt...</p>
                </div>
                <Link
                  to={`/receipts/${invoice.id}`}
                  className="block w-full text-center px-6 py-4 border border-solana-purple text-lg font-medium rounded-lg text-solana-purple hover:bg-solana-purple hover:text-white transition-all"
                >
                  View Receipt
                </Link>
              </div>
            ) : (
              <div className="bg-gray-100 text-center py-4 rounded-lg">
                <p className="text-gray-600">Payment not available for this invoice status</p>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}
        </div>
      </div>

      <div className="text-center">
        <Link
          to="/"
          className="text-solana-purple hover:text-solana-purple-dark font-medium text-sm"
        >
          ← Return to Dashboard
        </Link>
      </div>
    </div>
  );
};
