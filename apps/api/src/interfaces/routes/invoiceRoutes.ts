import { Router } from 'express';
import { InvoiceController } from '../controllers/InvoiceController.js';

export const createInvoiceRoutes = (controller: InvoiceController): Router => {
  const router = Router();

  router.post('/api/invoices', controller.createInvoice);
  router.get('/api/invoices', controller.listInvoices);
  router.get('/api/invoices/:id', controller.getInvoice);
  router.patch('/api/invoices/:id', controller.updateInvoice);
  router.delete('/api/invoices/:id', controller.deleteInvoice);
  router.post('/api/invoices/:id/issue', controller.issueInvoice);

  return router;
};
