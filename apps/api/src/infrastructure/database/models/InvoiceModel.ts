import mongoose, { Schema, Document } from 'mongoose';
import { IInvoice } from '@paydraft/shared';

interface ILineItemDocument {
  description: string;
  quantity: number;
  unitPrice: string;
  amount: string;
}

export interface IInvoiceDocument extends Omit<IInvoice, 'id' | 'createdAt' | 'updatedAt'>, Document {
  _id: mongoose.Types.ObjectId;
}

const lineItemSchema = new Schema<ILineItemDocument>({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: String, required: true },
  amount: { type: String, required: true },
}, { _id: false });

const invoiceSchema = new Schema<IInvoiceDocument>({
  invoiceNumber: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['draft', 'unpaid', 'pending', 'paid', 'overdue'],
    default: 'draft'
  },
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  clientWalletAddress: { type: String },
  freelancerName: { type: String, required: true },
  freelancerEmail: { type: String, required: true },
  freelancerWalletAddress: { type: String, required: true },
  lineItems: { type: [lineItemSchema], required: true },
  subtotal: { type: String, required: true },
  total: { type: String, required: true },
  currency: { type: String, required: true },
  dueDate: { type: String, required: true },
  issuedDate: { type: String, required: true },
  notes: { type: String },
  paymentId: { type: String },
}, { 
  timestamps: true,
  toJSON: {
    transform: (_, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ createdAt: -1 });

export const InvoiceModel = mongoose.model<IInvoiceDocument>('Invoice', invoiceSchema);
