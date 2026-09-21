import React from 'react';
import type { IInvoice } from '@paydraft/shared';
import { formatUSDC } from '../../../shared/utils';

interface DashboardSummaryProps {
  invoices: IInvoice[];
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({ invoices }) => {
  const stats = React.useMemo(() => {
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const unpaidInvoices = invoices.filter(inv => 
      inv.status === 'unpaid' || inv.status === 'pending'
    ).length;
    const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;

    const totalRevenue = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + BigInt(inv.total), BigInt(0));

    const pendingRevenue = invoices
      .filter(inv => inv.status === 'unpaid' || inv.status === 'pending')
      .reduce((sum, inv) => sum + BigInt(inv.total), BigInt(0));

    const overdueRevenue = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + BigInt(inv.total), BigInt(0));

    return {
      totalInvoices,
      paidInvoices,
      unpaidInvoices,
      overdueInvoices,
      totalRevenue: formatUSDC(totalRevenue.toString()),
      pendingRevenue: formatUSDC(pendingRevenue.toString()),
      overdueRevenue: formatUSDC(overdueRevenue.toString()),
    };
  }, [invoices]);

  const statCards = [
    {
      label: 'Total Revenue',
      value: `${stats.totalRevenue} Demo USDC`,
      color: 'text-solana-purple',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Pending Revenue',
      value: `${stats.pendingRevenue} Demo USDC`,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'Overdue Revenue',
      value: `${stats.overdueRevenue} Demo USDC`,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  const countCards = [
    { label: 'Total Invoices', value: stats.totalInvoices, color: 'text-gray-600' },
    { label: 'Paid', value: stats.paidInvoices, color: 'text-green-600' },
    { label: 'Unpaid', value: stats.unpaidInvoices, color: 'text-yellow-600' },
    { label: 'Overdue', value: stats.overdueInvoices, color: 'text-red-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className={`${stat.bgColor} rounded-lg p-6 shadow-sm`}>
            <h3 className="text-sm font-medium text-gray-600 mb-2">{stat.label}</h3>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {countCards.map((stat) => (
            <div key={stat.label}>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
