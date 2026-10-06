import { lazy, Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import HomePage from './pages/HomePage';
import OrderStatusPage from './pages/OrderStatusPage';
import { fetchCatalog } from './features/catalog/catalogSlice';

// The admin panel is only for the owner — loaded on demand so it never adds
// weight to the public site.
const AdminPage = lazy(() => import('./pages/AdminPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));

export default function App() {
  const dispatch = useDispatch();
  const path = window.location.pathname.replace(/\/+$/, '');
  const isAdmin = path === '/admin';
  const isPrivacy = path === '/privacy';

  useEffect(() => {
    if (!isAdmin && !isPrivacy) dispatch(fetchCatalog());
  }, [dispatch, isAdmin, isPrivacy]);

  if (isPrivacy) {
    return (
      <Suspense fallback={null}>
        <PrivacyPage />
      </Suspense>
    );
  }

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
