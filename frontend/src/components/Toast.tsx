import { CheckCircle, XCircle } from 'lucide-react';

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface ToastContainerProps {
  toasts: ToastItem[];
}

export default function ToastContainer({ toasts }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'success' ? (
            <CheckCircle size={18} color="var(--green)" />
          ) : (
            <XCircle size={18} color="var(--red)" />
          )}
          {t.message}
        </div>
      ))}
    </div>
  );
}
