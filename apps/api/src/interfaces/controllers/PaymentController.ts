import { Request, Response } from 'express';
import { IPaymentService } from '../../domain/interfaces/IPaymentService.js';
import {
  createApiError,
  createNotFoundError,
} from '@paydraft/shared';

export class PaymentController {
  constructor(private readonly paymentService: IPaymentService) {}

  initiatePayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { invoiceId } = req.body;

      if (!invoiceId) {
        res.status(400).json({ 
          error: createApiError('BAD_REQUEST', 'Invoice ID is required') 
        });
        return;
      }

      const payment = await this.paymentService.initiatePayment(invoiceId);
      res.status(201).json({ data: payment });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initiate payment';
      
      if (message.includes('not found')) {
        res.status(404).json({ error: createNotFoundError('Invoice') });
      } else if (message.includes('already paid')) {
        res.status(409).json({ error: createApiError('IDEMPOTENT_REPLAY', message) });
      } else if (message.includes('in flight')) {
        res.status(409).json({ error: createApiError('PAYMENT_IN_FLIGHT', message) });
      } else {
        res.status(500).json({ error: createApiError('INTERNAL_SERVER_ERROR', message) });
      }
    }
  };

  verifyPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { signature } = req.body;

      if (!signature) {
        res.status(400).json({ 
          error: createApiError('BAD_REQUEST', 'Transaction signature is required') 
        });
        return;
      }

      const payment = await this.paymentService.verifyPayment(signature);

      if (!payment) {
        res.status(200).json({ 
          data: { 
            verified: false 
          } 
        });
        return;
      }

      res.status(200).json({ 
        data: { 
          verified: true, 
          payment: {
            id: payment.id,
            invoiceId: payment.invoiceId,
            amount: payment.amount,
            status: payment.status,
          }
        } 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to verify payment';
      res.status(500).json({ error: createApiError('INTERNAL_SERVER_ERROR', message) });
    }
  };

  getPaymentByInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const invoiceId = req.params.invoiceId as string;
      const payment = await this.paymentService.getPaymentByInvoiceId(invoiceId);

      if (!payment) {
        res.status(404).json({ error: createNotFoundError('Payment', invoiceId) });
        return;
      }

      res.status(200).json({ data: payment });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get payment';
      res.status(500).json({ error: createApiError('INTERNAL_SERVER_ERROR', message) });
    }
  };
}
