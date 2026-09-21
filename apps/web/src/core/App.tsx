import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '../shared/components';
import { DashboardPage } from '../features/dashboard';
import { InvoicesPage } from '../features/invoices';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
