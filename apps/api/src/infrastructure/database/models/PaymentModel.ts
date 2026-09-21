import mongoose, { Schema, Document } from 'mongoose';
import { IPayment } from '@paydraft/shared';

export interface IPaymentDocument extends Omit<IPayment, 'id' | 'createdAt' | 'updatedAt'>, Document {
  _id: mongoose.Types.ObjectId;
}

const paymentSchema = new Schema<IPaymentDocument>({
  invoiceId: { type: String, required: true, index: true },
  amount: { type: String, required: true },
  currency: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  transactionSignature: { type: String, unique: true, sparse: true },
  fromWalletAddress: { type: String, required: true },
  toWalletAddress: { type: String, required: true },
  blockTime: { type: Number },
  confirmations: { type: Number },
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

paymentSchema.index({ invoiceId: 1 });
paymentSchema.index({ transactionSignature: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

export const PaymentModel = mongoose.model<IPaymentDocument>('Payment', paymentSchema);
