import React from 'react';
import type { ILineItem } from '@paydraft/shared';
import { formatUSDC, parseUSDC } from '../../../shared/utils';

interface LineItemsEditorProps {
  items: ILineItem[];
  onChange: (items: ILineItem[]) => void;
  disabled?: boolean;
}

export const LineItemsEditor: React.FC<LineItemsEditorProps> = ({
  items,
  onChange,
  disabled = false,
}) => {
  const handleAddItem = () => {
    onChange([
      ...items,
      {
        description: '',
        quantity: 1,
        unitPrice: '0',
        amount: '0',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof ILineItem, value: string | number) => {
    const newItems = [...items];
    const item = { ...newItems[index] };

    if (field === 'quantity') {
      item.quantity = Number(value);
      item.amount = (BigInt(item.unitPrice) * BigInt(item.quantity)).toString();
    } else if (field === 'unitPrice') {
      item.unitPrice = parseUSDC(value as string);
      item.amount = (BigInt(item.unitPrice) * BigInt(item.quantity)).toString();
    } else {
      item[field] = value as never;
    }

    newItems[index] = item;
    onChange(newItems);
  };

  const calculateTotal = () => {
    const total = items.reduce((sum, item) => sum + BigInt(item.amount), BigInt(0));
    return formatUSDC(total.toString());
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Line Items</h3>
        <button
          type="button"
          onClick={handleAddItem}
          disabled={disabled}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solana-purple disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Add Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          No line items yet. Click "Add Item" to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  disabled={disabled}
                  className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    disabled={disabled}
                    placeholder="e.g., Website Design"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-solana-purple focus:ring-solana-purple sm:text-sm border px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    disabled={disabled}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-solana-purple focus:ring-solana-purple sm:text-sm border px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Price (Demo USDC)
                  </label>
                  <input
                    type="text"
                    value={formatUSDC(item.unitPrice)}
                    onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                    disabled={disabled}
                    placeholder="0.00"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-solana-purple focus:ring-solana-purple sm:text-sm border px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="bg-white rounded-md px-3 py-2 border border-gray-300">
                    <span className="text-sm text-gray-600">Amount: </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatUSDC(item.amount)} Demo USDC
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-solana-purple-light bg-opacity-10 rounded-lg p-4 border-2 border-solana-purple">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-xl font-bold text-solana-purple">
                {calculateTotal()} Demo USDC
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
