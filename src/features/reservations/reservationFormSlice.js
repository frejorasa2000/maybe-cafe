import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Sends a new reservation request to the business owner's inbox (via the
// /api/send-reservation serverless function, same pattern as the reviews
// form), and triggers a confirmation email to the customer.
export const submitReservation = createAsyncThunk('reservationForm/submit', async (payload, { rejectWithValue }) => {
  try {
    const res = await fetch('/api/send-reservation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return rejectWithValue(data.error || 'No pudimos enviar tu solicitud de reservación.');
    }
    return true;
  } catch {
    return rejectWithValue('No hay conexión con el servidor en este momento.');
  }
});

const reservationFormSlice = createSlice({
  name: 'reservationForm',
  initialState: {
    status: 'idle', // idle | submitting | success | error
    error: null,
  },
  reducers: {
    resetReservationForm(state) {
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitReservation.pending, (state) => {
        state.status = 'submitting';
        state.error = null;
      })
      .addCase(submitReservation.fulfilled, (state) => {
        state.status = 'success';
      })
      .addCase(submitReservation.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload || 'Ocurrió un error inesperado.';
      });
  },
});

export const { resetReservationForm } = reservationFormSlice.actions;
export default reservationFormSlice.reducer;
