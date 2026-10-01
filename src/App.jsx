import HomePage from './pages/HomePage';
import OrderStatusPage from './pages/OrderStatusPage';

export default function App() {
  const orderId = new URLSearchParams(window.location.search).get('order');
  return orderId ? <OrderStatusPage orderId={orderId} /> : <HomePage />;
}
