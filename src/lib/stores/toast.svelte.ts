export type ToastType = "success" | "error" | "warning" | "info" | "primary";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
  duration?: number;
}

let toasts = $state<ToastItem[]>([]);

export const toastStore = {
  get all() { return toasts; },

  add(message: string, type: ToastType = "info", title?: string, duration = 3000) {
    const id = Math.random().toString(36).substring(2, 9);
    toasts.push({ id, message, type, title, duration });

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  },

  remove(id: string) {
    const index = toasts.findIndex(t => t.id === id);
    if (index !== -1) toasts.splice(index, 1);
  },

  // Helper cepat
  success: (msg: string, title?: string) => toastStore.add(msg, "success", title),
  error: (msg: string, title?: string) => toastStore.add(msg, "error", title),
  warning: (msg: string, title?: string) => toastStore.add(msg, "warning", title),
  info: (msg: string, title?: string) => toastStore.add(msg, "info", title),
};