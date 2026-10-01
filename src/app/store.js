import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '../features/ui/uiSlice';
import reviewFormReducer from '../features/reviews/reviewFormSlice';
import reservationFormReducer from '../features/reservations/reservationFormSlice';
import cartReducer from '../features/cart/cartSlice';
import checkoutReducer from '../features/checkout/checkoutSlice';
import catalogReducer from '../features/catalog/catalogSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    reviewForm: reviewFormReducer,
    reservationForm: reservationFormReducer,
    cart: cartReducer,
    checkout: checkoutReducer,
    catalog: catalogReducer,
  },
});
