import { Router } from 'express';
import { ReceiptController } from '../controllers/ReceiptController.js';

export const createReceiptRoutes = (controller: ReceiptController): Router => {
  const router = Router();

  router.get('/api/receipts/:invoiceId', controller.getReceipt);

  return router;
};
