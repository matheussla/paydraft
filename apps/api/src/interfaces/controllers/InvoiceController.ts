import { Request, Response } from 'express';
import { IInvoiceService } from '../../domain/interfaces/IInvoiceService.js';
import { 
  createInvoiceRequestSchema, 
  updateInvoiceRequestSchema,
  createApiError,
  createValidationError,
  createNotFoundError,
  IValidationErrorDetail
} from '@paydraft/shared';

export class InvoiceController {
  constructor(private readonly invoiceService: IInvoiceService) {}

  createInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = createInvoiceRequestSchema.parse(req.body);
      const invoice = await this.invoiceService.createInvoice(validatedData);
      res.status(201).json({ data: invoice });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errors' in error) {
        const zodError = error as { errors: Array<{ path: (string | number)[]; message: string }> };
        const errors: IValidationErrorDetail[] = zodError.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        res.status(400).json({ error: createValidationError(errors) });
      } else {
        const message = error instanceof Error ? error.message : 'Failed to create invoice';
        res.status(500).json({ error: createApiError('INTERNAL_SERVER_ERROR', message) });
      }
    }
  };

  getInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const invoice = await this.invoiceService.getInvoice(id);

      if (!invoice) {
        res.status(404).json({ error: createNotFoundError('Invoice', id) });
        return;
      }

      res.status(200).json({ data: invoice });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get invoice';
      res.status(500).json({ error: createApiError('INTERNAL_SERVER_ERROR', message) });
    }
  };

  listInvoices = async (_req: Request, res: Response): Promise<void> => {
    try {
      const invoices = await this.invoiceService.listInvoices();
      res.status(200).json({ data: invoices });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to list invoices';
      res.status(500).json({ error: createApiError('INTERNAL_SERVER_ERROR', message) });
    }
  };

  updateInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const validatedData = updateInvoiceRequestSchema.parse(req.body);
      const invoice = await this.invoiceService.updateInvoice(id, validatedData);

      if (!invoice) {
        res.status(404).json({ error: createNotFoundError('Invoice', id) });
        return;
      }

      res.status(200).json({ data: invoice });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errors' in error) {
        const zodError = error as { errors: Array<{ path: (string | number)[]; message: string }> };
        const errors: IValidationErrorDetail[] = zodError.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        res.status(400).json({ error: createValidationError(errors) });
      } else {
        const message = error instanceof Error ? error.message : 'Failed to update invoice';
        res.status(500).json({ error: createApiError('INTERNAL_SERVER_ERROR', message) });
      }
    }
  };

  deleteInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const deleted = await this.invoiceService.deleteInvoice(id);

      if (!deleted) {
        res.status(404).json({ error: createNotFoundError('Invoice', id) });
        return;
      }

      res.status(200).json({ data: { success: true } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete invoice';
      res.status(500).json({ error: createApiError('INTERNAL_SERVER_ERROR', message) });
    }
  };

  issueInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const invoice = await this.invoiceService.issueInvoice(id);

      if (!invoice) {
        res.status(404).json({ error: createNotFoundError('Invoice', id) });
        return;
      }

      res.status(200).json({ data: invoice });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to issue invoice';
      res.status(500).json({ error: createApiError('INTERNAL_SERVER_ERROR', message) });
    }
  };
}
