import { create } from 'zustand';

type ThemeMode = 'light' | 'dark' | 'system';
type AppliedTheme = 'light' | 'dark';

const STORAGE_KEY = 'oraculum_theme';

const getSystemTheme = (): AppliedTheme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const resolveTheme = (mode: ThemeMode): AppliedTheme =>
  mode === 'system' ? getSystemTheme() : mode;

const applyTheme = (mode: ThemeMode) => {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = resolveTheme(mode);
};

const getInitialMode = (): ThemeMode => {
  if (typeof window === 'undefined') return 'system';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
};

interface ThemeState {
  mode: ThemeMode;
  appliedTheme: AppliedTheme;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

const initialMode = getInitialMode();
applyTheme(initialMode);

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: initialMode,
  appliedTheme: resolveTheme(initialMode),
  setMode: (mode) => {
    window.localStorage.setItem(STORAGE_KEY, mode);
    applyTheme(mode);
    set({ mode, appliedTheme: resolveTheme(mode) });
  },
  toggleTheme: () => {
    const current = get().appliedTheme;
    get().setMode(current === 'dark' ? 'light' : 'dark');
  },
  initializeTheme: () => {
    const mode = get().mode;
    applyTheme(mode);
    set({ appliedTheme: resolveTheme(mode) });
  },
}));
