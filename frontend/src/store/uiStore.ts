import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

interface UIStore {
  // Mobile nav drawer
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;

  // Toast notifications
  toasts: Toast[];
  toast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  drawerOpen: false,
  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),

  toasts: [],
  toast: (message, type = 'info') => {
    const id = crypto.randomUUID();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    // Auto-dismiss after 3 s
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
