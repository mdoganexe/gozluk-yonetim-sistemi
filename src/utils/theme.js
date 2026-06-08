// Karanlık mod yönetimi (localStorage'da kalıcı)
const STORAGE_KEY = 'theme';

export const getTheme = () => localStorage.getItem(STORAGE_KEY) || 'light';

export const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export const setTheme = (theme) => {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
};

export const toggleTheme = () => {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
};

// Uygulama açılışında çağrılır (FOUC'u önlemek için erken)
export const initTheme = () => {
  applyTheme(getTheme());
};
