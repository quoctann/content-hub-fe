import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AdminContent, AdminContentUpdatePayload } from '@/types/admin';
import { useEffect, useRef, useState } from 'react';

type FieldName = 'title' | 'text_data' | 'ocr_text' | 'caption' | 'link';
type Values = Record<FieldName, string>;

interface AdminEditDialogProps {
  item: AdminContent;
  items: AdminContent[];
  onNavigate: (item: AdminContent) => void;
  onSave: (id: number, payload: AdminContentUpdatePayload) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}

const FIELD_LABELS: Record<FieldName, string> = {
  title: 'Title',
  text_data: 'Text Data',
  ocr_text: 'OCR Text',
  caption: 'Caption',
  link: 'Image URL',
};
const FIELD_KEY = 'admin-editor-fields-v1';
const SPLIT_KEY = 'admin-editor-split-v1';
const defaultFields: Record<FieldName, boolean> = {
  title: true,
  text_data: true,
  ocr_text: true,
  caption: true,
  link: true,
};

function readPreferences<T>(key: string, fallback: T): T {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? 'null');
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}

export default function AdminEditDialog({
  item,
  items,
  onNavigate,
  onSave,
  onClose,
  saving,
}: AdminEditDialogProps) {
  const [values, setValues] = useState<Values>(() => ({
    title: item.title ?? '',
    text_data: item.text_data ?? '',
    ocr_text: item.ocr_text ?? '',
    caption: item.caption ?? '',
    link: item.link ?? '',
  }));
  const [visibleFields, setVisibleFields] = useState<Record<FieldName, boolean>>(() =>
    readPreferences(FIELD_KEY, defaultFields),
  );
  const [split, setSplit] = useState(() => readPreferences(SPLIT_KEY, 44));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const dragStart = useRef<{ x: number; split: number } | null>(null);
  const original = {
    title: item.title ?? '',
    text_data: item.text_data ?? '',
    ocr_text: item.ocr_text ?? '',
    caption: item.caption ?? '',
    link: item.link ?? '',
  };
  const dirty = JSON.stringify(values) !== JSON.stringify(original);
  const index = items.findIndex((entry) => entry.id === item.id);
  const previous = index > 0 ? items[index - 1] : null;
  const next = index >= 0 && index < items.length - 1 ? items[index + 1] : null;

  useEffect(() => {
    localStorage.setItem(FIELD_KEY, JSON.stringify(visibleFields));
  }, [visibleFields]);
  useEffect(() => {
    localStorage.setItem(SPLIT_KEY, String(split));
  }, [split]);
  function leave(nextItem?: AdminContent | null) {
    if (dirty && !window.confirm('You have unsaved changes. Discard them?')) return;
    if (nextItem) onNavigate(nextItem);
    else onClose();
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.key === 'Escape' &&
        !saving &&
        (!dirty || window.confirm('You have unsaved changes. Discard them?'))
      )
        onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saving, dirty, onClose]);

  function change(field: FieldName, value: string) {
    if (field === 'link') setImageError(false);
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function save(andNext = false) {
    setFormError(null);
    const nextErrors: Record<string, string> = {};
    if (values.link.trim()) {
      try {
        if (!['http:', 'https:'].includes(new URL(values.link.trim()).protocol))
          nextErrors.link = 'Image URL must use http or https.';
      } catch {
        nextErrors.link = 'Enter a valid URL.';
      }
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    try {
      await onSave(item.id, {
        title: values.title.trim() || null,
        text_data: values.text_data.trim() || null,
        ocr_text: values.ocr_text.trim() || null,
        caption: values.caption.trim() || null,
        link: values.link.trim() || null,
      });
      if (andNext && next) onNavigate(next);
      else if (!andNext) onClose();
    } catch {
      setFormError('Unable to save content. Please try again.');
    }
  }

  function startDrag(event: React.PointerEvent) {
    dragStart.current = { x: event.clientX, split };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function drag(event: React.PointerEvent) {
    if (!dragStart.current) return;
    const width = event.currentTarget.parentElement?.getBoundingClientRect().width ?? 1000;
    setSplit(
      Math.max(
        30,
        Math.min(
          65,
          dragStart.current.split + ((event.clientX - dragStart.current.x) / width) * 100,
        ),
      ),
    );
  }
  function endDrag() {
    dragStart.current = null;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Review and edit content"
    >
      <div className="mx-auto flex h-full max-h-[calc(100vh-1rem)] w-full max-w-[1500px] flex-col overflow-hidden rounded-lg border border-border bg-popover shadow-xl sm:max-h-[calc(100vh-2rem)]">
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-2 sm:px-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold">Review content #{item.id}</h2>
            <p className="text-xs text-muted-foreground">
              {item.type} · {item.is_hidden ? 'Hidden' : 'Visible'}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Fields
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Show editor fields</DropdownMenuLabel>
                {(Object.keys(FIELD_LABELS) as FieldName[]).map((field) => (
                  <DropdownMenuCheckboxItem
                    key={field}
                    checked={visibleFields[field]}
                    onCheckedChange={(checked) =>
                      setVisibleFields((current) => ({ ...current, [field]: checked }))
                    }
                  >
                    {FIELD_LABELS[field]}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon-sm" onClick={() => leave()} aria-label="Close">
              ×
            </Button>
          </div>
        </header>
        <div
          className="flex min-h-0 flex-1 flex-col md:flex-row"
          onPointerMove={drag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <section
            className="flex min-h-[24vh] min-w-0 items-center justify-center bg-muted/30 p-3 md:min-h-0"
            style={{ flex: `0 0 ${split}%` }}
          >
            {item.type === 'image' && values.link && !imageError ? (
              <img
                src={values.link}
                alt={values.title || 'Content preview'}
                className="max-h-full max-w-full object-contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="text-center text-sm text-muted-foreground">
                {imageError ? 'Image could not be loaded.' : 'No image preview available.'}
              </div>
            )}
          </section>
          <div
            className="hidden w-2 shrink-0 cursor-col-resize items-center justify-center border-x border-border bg-muted/50 hover:bg-primary/30 md:flex"
            onPointerDown={startDrag}
            role="separator"
            aria-label="Resize image preview"
            tabIndex={0}
          >
            <span className="h-8 w-0.5 bg-border" />
          </div>
          <section className="min-h-0 min-w-0 flex-1 overflow-y-auto p-3 sm:p-4">
            <div className="mb-3 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
              <span className="rounded bg-muted px-2 py-1">
                Updated: {item.updated_at ? new Date(item.updated_at).toLocaleString() : '—'}
              </span>
              <span className="rounded bg-muted px-2 py-1">
                {dirty ? 'Unsaved changes' : 'Saved'}
              </span>
            </div>
            {formError && (
              <div className="mb-3 rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </div>
            )}
            <form
              className="grid grid-cols-1 gap-3 lg:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                void save();
              }}
            >
              {visibleFields.title && (
                <Field label="Title" error={errors.title}>
                  <Input
                    value={values.title}
                    onChange={(e) => change('title', e.target.value)}
                    aria-invalid={Boolean(errors.title)}
                  />
                </Field>
              )}
              {visibleFields.caption && (
                <Field label="Caption">
                  <Input
                    value={values.caption}
                    onChange={(e) => change('caption', e.target.value)}
                  />
                </Field>
              )}
              {visibleFields.text_data && (
                <Field label="Text Data" className="lg:col-span-2">
                  <textarea
                    className="min-h-28 w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    value={values.text_data}
                    onChange={(e) => change('text_data', e.target.value)}
                  />
                </Field>
              )}
              {visibleFields.ocr_text && (
                <Field label="OCR Text" className="lg:col-span-2">
                  <textarea
                    className="min-h-24 w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    value={values.ocr_text}
                    onChange={(e) => change('ocr_text', e.target.value)}
                  />
                </Field>
              )}
              {visibleFields.link && (
                <Field label="Image URL" error={errors.link} className="lg:col-span-2">
                  <Input
                    type="url"
                    value={values.link}
                    onChange={(e) => change('link', e.target.value)}
                    aria-invalid={Boolean(errors.link)}
                  />
                </Field>
              )}
            </form>
          </section>
        </div>
        <footer className="flex shrink-0 flex-wrap items-center gap-2 border-t border-border bg-popover px-3 py-2 sm:px-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => leave(previous)}
            disabled={!previous || saving}
          >
            ← Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => leave(next)}
            disabled={!next || saving}
          >
            Next →
          </Button>
          <span className="mr-auto text-xs text-muted-foreground">
            {index + 1} / {items.length}
          </span>
          <Button variant="outline" size="sm" onClick={() => leave()} disabled={saving}>
            Discard
          </Button>
          <Button size="sm" onClick={() => void save(true)} disabled={saving || !next}>
            {saving ? 'Saving…' : 'Save & Next'}
          </Button>
          <Button size="sm" onClick={() => void save()} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </footer>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  className = '',
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-semibold">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
