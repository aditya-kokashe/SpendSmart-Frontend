import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export default function EmptyState({
  title = 'No data yet',
  message = 'Start by adding your first entry.',
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <Inbox />
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}
