import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '../shared/components';
import { DashboardPage } from '../features/dashboard';
import { 
  InvoicesPage, 
  CreateInvoicePage, 
  EditInvoicePage, 
  InvoiceDetailPage 
} from '../features/invoices';
import { PaymentPage } from '../features/payment';
import { ReceiptPage } from '../features/receipt';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="invoices/new" element={<CreateInvoicePage />} />
          <Route path="invoices/:id" element={<InvoiceDetailPage />} />
          <Route path="invoices/:id/edit" element={<EditInvoicePage />} />
          <Route path="pay/:paymentId" element={<PaymentPage />} />
          <Route path="receipts/:invoiceId" element={<ReceiptPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
