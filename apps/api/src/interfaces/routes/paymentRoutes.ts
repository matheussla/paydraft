import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController.js';

export const createPaymentRoutes = (controller: PaymentController): Router => {
  const router = Router();

  router.post('/api/payments/initiate', controller.initiatePayment);
  router.post('/api/payments/verify', controller.verifyPayment);
  router.get('/api/payments/invoice/:invoiceId', controller.getPaymentByInvoice);

  return router;
};
