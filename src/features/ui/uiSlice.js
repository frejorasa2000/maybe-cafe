import { createSlice } from '@reduxjs/toolkit';

function getStoredTheme() {
  if (typeof window === 'undefined') return 'light';
  return window.localStorage.getItem('maybeCafeTheme') === 'dark' ? 'dark' : 'light';
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    mobileMenuOpen: false,
    introDone: false,
    language: 'en', // 'en' | 'es' — English by default, toggle to Spanish
    theme: getStoredTheme(), // 'light' | 'dark' — light (cream) by default
  },
  reducers: {
    openMobileMenu(state) {
      state.mobileMenuOpen = true;
    },
    closeMobileMenu(state) {
      state.mobileMenuOpen = false;
    },
    toggleMobileMenu(state) {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    markIntroDone(state) {
      state.introDone = true;
    },
    setLanguage(state, action) {
      state.language = action.payload;
    },
    toggleLanguage(state) {
      state.language = state.language === 'en' ? 'es' : 'en';
    },
    setTheme(state, action) {
      state.theme = action.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

export const {
  openMobileMenu,
  closeMobileMenu,
  toggleMobileMenu,
  markIntroDone,
  setLanguage,
  toggleLanguage,
  setTheme,
  toggleTheme,
} = uiSlice.actions;
export default uiSlice.reducer;
