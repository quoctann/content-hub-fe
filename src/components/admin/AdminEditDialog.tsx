import { useState } from 'react';
import type { AdminContent, AdminContentUpdatePayload } from '@/types/admin';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AdminEditDialogProps {
  item: AdminContent;
  onSave: (id: number, payload: AdminContentUpdatePayload) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}

export default function AdminEditDialog({ item, onSave, onClose, saving }: AdminEditDialogProps) {
  const [values, setValues] = useState({
    title: item.title ?? '',
    text_data: item.text_data ?? '',
    ocr_text: item.ocr_text ?? '',
    caption: item.caption ?? '',
    link: item.link ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const nextErrors: Record<string, string> = {};
    if (!values.title.trim()) {
      nextErrors.title = 'Title is required.';
    }

    if (values.link.trim()) {
      try {
        const url = new URL(values.link.trim());
        if (!['http:', 'https:'].includes(url.protocol)) {
          nextErrors.link = 'Image URL must use http or https.';
        }
      } catch {
        nextErrors.link = 'Enter a valid URL.';
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});

    const payload: AdminContentUpdatePayload = {
      title: values.title.trim() || null,
      text_data: values.text_data.trim() || null,
      ocr_text: values.ocr_text.trim() || null,
      caption: values.caption.trim() || null,
      link: values.link.trim() || null,
    };

    try {
      await onSave(item.id, payload);
    } catch {
      setFormError('Unable to save content. Please try again.');
    }
  }

  const isBusy = saving;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-popover border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Edit content"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Edit Content</h2>
          <button
            className="text-2xl text-muted-foreground hover:text-foreground transition-colors w-8 h-8 flex items-center justify-center"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Immutable info */}
        <div className="flex flex-wrap gap-2 mb-6 p-3 bg-muted rounded-md">
          <span className="text-xs font-mono bg-background px-2 py-1 rounded">ID: {item.id}</span>
          <span className="text-xs font-mono bg-background px-2 py-1 rounded">
            Type: {item.type}
          </span>
          <span className="text-xs font-mono bg-background px-2 py-1 rounded">
            Updated: {item.updated_at ? new Date(item.updated_at).toLocaleString() : '—'}
          </span>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {formError && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">Title</label>
            <Input
              name="title"
              value={values.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Content title"
              aria-invalid={Boolean(errors.title)}
            />
            {errors.title && <p className="mt-2 text-xs text-destructive">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">Text Data</label>
            <textarea
              className="w-full px-3 py-2 border border-input rounded-md bg-transparent text-sm font-mono resize-none outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
              name="text_data"
              rows={4}
              value={values.text_data}
              onChange={(e) => handleChange('text_data', e.target.value)}
              placeholder="Text content..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">OCR Text</label>
            <textarea
              className="w-full px-3 py-2 border border-input rounded-md bg-transparent text-sm font-mono resize-none outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
              name="ocr_text"
              rows={3}
              value={values.ocr_text}
              onChange={(e) => handleChange('ocr_text', e.target.value)}
              placeholder="OCR extracted text..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">Caption</label>
            <Input
              name="caption"
              value={values.caption}
              onChange={(e) => handleChange('caption', e.target.value)}
              placeholder="Image caption..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">Image URL</label>
            <Input
              name="link"
              type="url"
              value={values.link}
              onChange={(e) => handleChange('link', e.target.value)}
              placeholder="https://..."
              aria-invalid={Boolean(errors.link)}
            />
            {errors.link && <p className="mt-2 text-xs text-destructive">{errors.link}</p>}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 pt-4">
            <Button type="submit" disabled={isBusy} className="w-full sm:flex-1">
              {isBusy ? 'Saving…' : 'Save'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isBusy}
              className="w-full sm:flex-1"
            >
              Discard changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
