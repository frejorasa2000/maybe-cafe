import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Charges the cart via the /api/create-payment serverless function, which
// talks to Square with the secret access token (never exposed to the
// browser) and recomputes the total itself instead of trusting sourceId's
// caller-supplied amount.
export const submitPayment = createAsyncThunk('checkout/submit', async (payload, { rejectWithValue }) => {
  try {
    const res = await fetch('/api/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return rejectWithValue(data.error || 'No pudimos procesar el pago.');
    }
    return data;
  } catch {
    return rejectWithValue('No hay conexión con el servidor en este momento.');
  }
});

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState: {
    isOpen: false,
    status: 'idle', // idle | submitting | success | error
    error: null,
    receipt: null,
  },
  reducers: {
    openCheckout(state) {
      state.isOpen = true;
    },
    closeCheckout(state) {
      state.isOpen = false;
    },
    resetCheckout(state) {
      state.status = 'idle';
      state.error = null;
      state.receipt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitPayment.pending, (state) => {
        state.status = 'submitting';
        state.error = null;
      })
      .addCase(submitPayment.fulfilled, (state, action) => {
        state.status = 'success';
        state.receipt = action.payload;
      })
      .addCase(submitPayment.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload || 'Ocurrió un error inesperado.';
      });
  },
});

export const { openCheckout, closeCheckout, resetCheckout } = checkoutSlice.actions;
export default checkoutSlice.reducer;
