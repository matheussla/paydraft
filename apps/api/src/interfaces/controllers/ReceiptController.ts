import { Request, Response } from 'express';
import { IReceiptService } from '../../domain/interfaces/IReceiptService.js';
import { createApiError, createNotFoundError } from '@paydraft/shared';

export class ReceiptController {
  constructor(private readonly receiptService: IReceiptService) {}

  getReceipt = async (req: Request, res: Response): Promise<void> => {
    try {
      const invoiceId = req.params.invoiceId as string;
      const html = await this.receiptService.generateReceiptHTML(invoiceId);

      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(html);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate receipt';

      if (message.includes('not found')) {
        res.status(404).json({ error: createNotFoundError('Invoice') });
      } else if (message.includes('must be paid')) {
        res.status(400).json({ error: createApiError('BAD_REQUEST', message) });
      } else {
        res.status(500).json({ error: createApiError('INTERNAL_SERVER_ERROR', message) });
      }
    }
  };
}
