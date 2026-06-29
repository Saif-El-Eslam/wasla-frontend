export type ToastTone = 'success' | 'error' | 'info';

export type ToastMessage = {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
};

type ToastInput = Omit<ToastMessage, 'id' | 'tone'> & {
  tone?: ToastTone;
};

type ToastListener = (message: ToastMessage) => void;

const listeners = new Set<ToastListener>();

function emit(input: ToastInput) {
  const message: ToastMessage = {
    id: crypto.randomUUID(),
    tone: input.tone ?? 'info',
    title: input.title,
    description: input.description,
  };

  listeners.forEach((listener) => listener(message));
}

export const toast = {
  success: (title: string, description?: string) => emit({ tone: 'success', title, description }),
  error: (title: string, description?: string) => emit({ tone: 'error', title, description }),
  info: (title: string, description?: string) => emit({ tone: 'info', title, description }),
};

export function subscribeToToasts(listener: ToastListener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
