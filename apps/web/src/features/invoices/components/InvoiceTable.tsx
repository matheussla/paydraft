import React from 'react';
import type { IInvoice, InvoiceStatus } from '@paydraft/shared';
import { Link } from 'react-router-dom';
import { formatUSDC, formatDate } from '../../../shared/utils';

interface InvoiceTableProps {
  invoices: IInvoice[];
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({ invoices }) => {
  const [statusFilter, setStatusFilter] = React.useState<InvoiceStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredInvoices = React.useMemo(() => {
    let filtered = invoices;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        inv =>
          inv.invoiceNumber.toLowerCase().includes(query) ||
          inv.clientName.toLowerCase().includes(query) ||
          inv.clientEmail.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [invoices, statusFilter, searchQuery]);

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by invoice number, client name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-solana-purple focus:ring-solana-purple sm:text-sm px-4 py-2 border"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-solana-purple focus:ring-solana-purple sm:text-sm px-4 py-2 border"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="unpaid">Unpaid</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm px-6 py-12 text-center">
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'all' 
              ? 'No invoices match your filters' 
              : 'No invoices yet'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(invoice.issuedDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.clientName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {invoice.clientEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatUSDC(invoice.total)} Demo USDC
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/invoices/${invoice.id}`}
                        className="text-solana-purple hover:text-solana-purple-dark"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredInvoices.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          Showing {filteredInvoices.length} of {invoices.length} invoices
        </div>
      )}
    </div>
  );
};
