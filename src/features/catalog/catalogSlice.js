import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { DEFAULT_CATALOG } from '../../data/defaultCatalog';
import { menuFromCatalog, withDefaults } from '../../data/catalog';

// The menu/options/hours the owner edits in /admin. Starts with the bundled
// default so the page renders instantly, then swaps in the live copy.
// Ordering stays disabled until the live copy arrives, so nobody adds an item
// at a stale price.
export const fetchCatalog = createAsyncThunk('catalog/fetch', async () => {
  const res = await fetch('/api/catalog');
  if (!res.ok) throw new Error(`Catalog request failed (${res.status})`);
  return res.json();
});

const catalogSlice = createSlice({
  name: 'catalog',
  initialState: {
    data: DEFAULT_CATALOG,
    loaded: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalog.fulfilled, (state, action) => {
        state.data = withDefaults(action.payload, DEFAULT_CATALOG);
        state.loaded = true;
      })
      // The server falls back to the same default when its database is
      // unreachable, so ordering against the bundled copy is still consistent.
      .addCase(fetchCatalog.rejected, (state) => {
        state.loaded = true;
      });
  },
});

export default catalogSlice.reducer;

export const selectCatalog = (state) => state.catalog.data;
export const selectCatalogLoaded = (state) => state.catalog.loaded;

// Visible images of a photo list (gallery, menu boards), in order — memoized
// per list so components don't re-render on unrelated store changes.
function visibleList(key) {
  let source = null;
  let result = [];
  return (state) => {
    if (state.catalog.data[key] !== source) {
      source = state.catalog.data[key];
      result = (source || []).filter((g) => g.active);
    }
    return result;
  };
}
export const selectGallery = visibleList('gallery');
export const selectMenuBoards = visibleList('menuBoards');

// Memoized by catalog identity so components don't re-render on every store change.
let lastCatalog = null;
let lastMenu = [];
export function selectMenu(state) {
  if (state.catalog.data !== lastCatalog) {
    lastCatalog = state.catalog.data;
    lastMenu = menuFromCatalog(lastCatalog);
  }
  return lastMenu;
}
