import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../../shared/api';

export const ReceiptPage: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const [receiptHTML, setReceiptHTML] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchReceipt = async () => {
      if (!invoiceId) {
        setError('Invoice ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const html = await apiClient.get<string>(`/api/receipts/${invoiceId}`);
        setReceiptHTML(html);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load receipt');
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [invoiceId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-solana-purple"></div>
      </div>
    );
  }

  if (error || !receiptHTML) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-600">{error || 'Receipt not found'}</p>
        </div>
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-solana-purple hover:text-solana-purple-dark font-medium text-sm"
          >
            ← Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="print:hidden flex justify-between items-center mb-6">
        <Link
          to="/"
          className="text-solana-purple hover:text-solana-purple-dark font-medium text-sm"
        >
          ← Return to Dashboard
        </Link>
        <button
          onClick={handlePrint}
          className="px-6 py-2 bg-solana-purple text-white rounded-lg hover:bg-solana-purple-dark transition-colors"
        >
          Print Receipt
        </button>
      </div>

      <div 
        dangerouslySetInnerHTML={{ __html: receiptHTML }}
      />
    </div>
  );
};
