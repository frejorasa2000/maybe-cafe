import { lazy, Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import HomePage from './pages/HomePage';
import OrderStatusPage from './pages/OrderStatusPage';
import { fetchCatalog } from './features/catalog/catalogSlice';

// The admin panel is only for the owner — loaded on demand so it never adds
// weight to the public site.
const AdminPage = lazy(() => import('./pages/AdminPage'));

export default function App() {
  const dispatch = useDispatch();
  const isAdmin = window.location.pathname.replace(/\/+$/, '') === '/admin';

  useEffect(() => {
    if (!isAdmin) dispatch(fetchCatalog());
  }, [dispatch, isAdmin]);

  if (isAdmin) {
    return (
      <Suspense fallback={null}>
        <AdminPage />
      </Suspense>
    );
  }
  const orderId = new URLSearchParams(window.location.search).get('order');
  return orderId ? <OrderStatusPage orderId={orderId} /> : <HomePage />;
}
