interface AdminDeleteConfirmDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  title?: string;
  message?: string;
}

export default function AdminDeleteConfirmDialog({
  onConfirm,
  onCancel,
  loading,
  title = 'Are you sure?',
  message = 'This will permanently delete the content. This action cannot be undone.',
}: AdminDeleteConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-popover border border-border rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-label="Confirm delete"
      >
        <div className="text-4xl text-center mb-4">🗑</div>
        <h2 className="text-lg font-bold text-center text-foreground mb-3">{title}</h2>
        <p className="text-sm text-center text-muted-foreground mb-6">
          {message}
        </p>

        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 sm:justify-center">
          <button
            id="admin-delete-confirm-btn"
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 bg-destructive text-white hover:bg-destructive/90 px-4 py-2"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting…' : 'Yes, delete'}
          </button>
          <button
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 border border-border bg-transparent hover:bg-muted px-4 py-2"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
