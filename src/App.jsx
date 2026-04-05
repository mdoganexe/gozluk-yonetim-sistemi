import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './utils/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CustomerList from './pages/customers/CustomerList';
import CustomerDetail from './pages/customers/CustomerDetail';
import ProductList from './pages/products/ProductList';
import ProductDetail from './pages/products/ProductDetail';
import OrderList from './pages/orders/OrderList';
import OrderNew from './pages/orders/OrderNew';
import OrderDetail from './pages/orders/OrderDetail';
import OrderSlip from './pages/orders/OrderSlip';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Protected Route bileşeni
function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Order Slip - Separate page without layout for printing */}
        <Route
          path="/orders/:id/slip"
          element={
            <ProtectedRoute>
              <OrderSlip />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/customers" element={<CustomerList />} />
                  <Route path="/customers/:id" element={<CustomerDetail />} />
                  <Route path="/products" element={<ProductList />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/orders" element={<OrderList />} />
                  <Route path="/orders/new" element={<OrderNew />} />
                  <Route path="/orders/:id" element={<OrderDetail />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
