import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AdminContentCreatePayload } from '@/types/admin';
import type { ContentType } from '@/types/content';
import { useState } from 'react';

interface AdminAddDialogProps {
  onAdd: (payload: AdminContentCreatePayload) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}

export default function AdminAddDialog({ onAdd, onClose, saving }: AdminAddDialogProps) {
  const [type, setType] = useState<ContentType>('text');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: AdminContentCreatePayload = {
      type,
      title: (fd.get('title') as string) || undefined,
      text_data: (fd.get('text_data') as string) || undefined,
      ocr_text: (fd.get('ocr_text') as string) || undefined,
      caption: (fd.get('caption') as string) || undefined,
      link: (fd.get('link') as string) || undefined,
    };
    onAdd(payload);
  }

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
        aria-label="Add content"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Add Content</h2>
          <button
            className="text-2xl text-muted-foreground hover:text-foreground transition-colors w-8 h-8 flex items-center justify-center"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">Type *</label>
            <Select value={type} onValueChange={(e) => setType(e as ContentType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">Title</label>
            <Input name="title" placeholder="Content title" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">Text Data</label>
            <textarea
              className="w-full px-3 py-2 border border-input rounded-md bg-transparent text-sm font-mono resize-none outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
              name="text_data"
              rows={4}
              placeholder="Text content..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">OCR Text</label>
            <textarea
              className="w-full px-3 py-2 border border-input rounded-md bg-transparent text-sm font-mono resize-none outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
              name="ocr_text"
              rows={3}
              placeholder="OCR extracted text..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">Caption</label>
            <Input name="caption" placeholder="Image caption..." />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">Image URL</label>
            <Input name="link" type="url" placeholder="https://..." />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 pt-4">
            <Button type="submit" disabled={saving} className="w-full sm:flex-1">
              {saving ? 'Adding…' : 'Add'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="w-full sm:flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
