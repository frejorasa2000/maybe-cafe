import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Sends a new review to the business owner's inbox for review (via the
// /api/send-review serverless function, same pattern as the private-events
// form). It does NOT post to Google — only a real Google review, written at
// the link in siteInfo.js, shows up publicly on Google Maps/Search.
export const submitReview = createAsyncThunk('reviewForm/submit', async (payload, { rejectWithValue }) => {
  try {
    const res = await fetch('/api/send-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return rejectWithValue(data.error || 'No pudimos enviar tu reseña.');
    }
    return true;
  } catch {
    return rejectWithValue('No hay conexión con el servidor en este momento.');
  }
});

const reviewFormSlice = createSlice({
  name: 'reviewForm',
  initialState: {
    status: 'idle', // idle | submitting | success | error
    error: null,
  },
  reducers: {
    resetReviewForm(state) {
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitReview.pending, (state) => {
        state.status = 'submitting';
        state.error = null;
      })
      .addCase(submitReview.fulfilled, (state) => {
        state.status = 'success';
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload || 'Ocurrió un error inesperado.';
      });
  },
});

export const { resetReviewForm } = reviewFormSlice.actions;
export default reviewFormSlice.reducer;
