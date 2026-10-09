import { createSlice } from '@reduxjs/toolkit';
import { estimateMinutes } from '../../data/estimatedTime';
import { optionsPrice } from '../../data/catalog';

// Same product + size + options stack into one line; different options get
// their own line so each drink keeps its own milk/syrup/foam/toppings.
function lineId(productId, sizeId, chosen) {
  const optionsKey = chosen.map((o) => `${o.groupId}:${o.id}`).join(',');
  return `${productId}::${sizeId}::${optionsKey}`;
}

function buildLine({ dish, size, selections = {}, chosen = [] }, quantity) {
  return {
    id: lineId(dish.id, size.id, chosen),
    productId: dish.id,
    name: dish.name,
    tag: dish.tag,
    image: dish.image,
    sizeId: size.id,
    sizeLabel: size.label,
    selections,
    options: chosen.map((o) => o.label),
    price: Math.round((size.price + optionsPrice(chosen)) * 100) / 100,
    quantity,
  };
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    isOpen: false,
    // { productId, sizeId } while the options modal is open; plus
    // { editId, selections } when it's editing a line already in the cart.
    customizing: null,
    items: [], // { id, productId, name, tag, image, sizeId, sizeLabel, selections, options, price, quantity }
  },
  reducers: {
    // `chosen` is the already-validated output of resolveSelections() against
    // the live catalog (CustomizeModal does that); the server re-checks it.
    addItem(state, action) {
      const line = buildLine(action.payload, 1);
      const existing = state.items.find((item) => item.id === line.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push(line);
      }
    },
    // Replaces a cart line with its edited version (new size/options/price),
    // keeping its place and quantity. If the result matches another line, the
    // two are merged.
    updateItem(state, action) {
      const { id, ...payload } = action.payload;
      const index = state.items.findIndex((item) => item.id === id);
      if (index === -1) return;
      const line = buildLine(payload, state.items[index].quantity);
      const twin = state.items.find((item, i) => i !== index && item.id === line.id);
      if (twin) {
        twin.quantity += line.quantity;
        state.items.splice(index, 1);
      } else {
        state.items[index] = line;
      }
    },
    openCustomize(state, action) {
      state.customizing = action.payload;
    },
    closeCustomize(state) {
      state.customizing = null;
    },
    incrementItem(state, action) {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) item.quantity += 1;
    },
    decrementItem(state, action) {
      const item = state.items.find((i) => i.id === action.payload);
      if (!item) return;
      item.quantity -= 1;
      if (item.quantity <= 0) {
        state.items = state.items.filter((i) => i.id !== action.payload);
      }
    },
    removeItem(state, action) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
    openCart(state) {
      state.isOpen = true;
    },
    closeCart(state) {
      state.isOpen = false;
    },
    toggleCart(state) {
      state.isOpen = !state.isOpen;
    },
  },
});

export const {
  addItem,
  updateItem,
  openCustomize,
  closeCustomize,
  incrementItem,
  decrementItem,
  removeItem,
  clearCart,
  openCart,
  closeCart,
  toggleCart,
} = cartSlice.actions;
export default cartSlice.reducer;

export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) => state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectCartTotal = (state) => state.cart.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
export const selectEstimatedMinutes = (state) => estimateMinutes(selectCartCount(state));
