import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminCreateContent, adminGetUploadLimits, adminUploadMedia } from '@/services/admin.service';
import type { AdminMediaUploadResponse, AdminUploadLimits } from '@/types/admin';
import { useEffect, useRef, useState } from 'react';

type QueueStatus = 'queued' | 'uploading' | 'creating' | 'completed' | 'failed' | 'rejected' | 'uncertain';

interface QueueItem {
  id: string;
  file: File;
  title: string;
  caption: string;
  status: QueueStatus;
  result?: AdminMediaUploadResponse;
  error?: string;
  previewUrl: string;
}

interface AdminBulkUploadProps {
  onCompleted: () => Promise<void>;
}

const fallbackLimits: AdminUploadLimits = {
  enabled: false,
  max_batch_files: 5,
  max_file_bytes: 10 * 1024 * 1024,
  allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'],
};

function titleFromFile(name: string) {
  return name.replace(/\.[^.]+$/, '');
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Request failed. Please try again.';
}

export default function AdminBulkUpload({ onCompleted }: AdminBulkUploadProps) {
  const [limits, setLimits] = useState<AdminUploadLimits>(fallbackLimits);
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loadingLimits, setLoadingLimits] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const previewUrls = useRef(new Set<string>());

  useEffect(() => {
    adminGetUploadLimits()
      .then(setLimits)
      .catch(() => undefined)
      .finally(() => setLoadingLimits(false));
  }, []);

  useEffect(() => () => {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function updateItem(id: string, update: Partial<QueueItem>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...update } : item)));
  }

  function addFiles(files: FileList | null) {
    if (!files) return;
    const available = Math.max(0, limits.max_batch_files - items.length);
    const accepted = Array.from(files).slice(0, available).map((file) => ({
      id: crypto.randomUUID(), file, title: titleFromFile(file.name), caption: '', previewUrl: URL.createObjectURL(file), status: (!limits.allowed_mime_types.includes(file.type) || file.size > limits.max_file_bytes) ? 'rejected' as const : 'queued' as const,
      error: !limits.allowed_mime_types.includes(file.type) ? 'Unsupported file type.' : file.size > limits.max_file_bytes ? 'File exceeds the configured size limit.' : undefined,
    }));
    accepted.forEach((item) => previewUrls.current.add(item.previewUrl));
    setItems((current) => [...current, ...accepted]);
  }

  function removeItem(item: QueueItem) {
    URL.revokeObjectURL(item.previewUrl);
    previewUrls.current.delete(item.previewUrl);
    setItems((current) => current.filter((candidate) => candidate.id !== item.id));
  }

  async function process(item: QueueItem) {
    try {
      let result = item.result;
      if (!result) {
        updateItem(item.id, { status: 'uploading', error: undefined });
        try {
          result = await adminUploadMedia(item.file);
        } catch (error) {
          updateItem(item.id, { status: 'uncertain', error: `${errorMessage(error)} The upload outcome is unknown; do not retry until it is checked in ImageKit.` });
          return false;
        }
        updateItem(item.id, { result });
      }
      updateItem(item.id, { status: 'creating', error: undefined });
      try {
        await adminCreateContent({ type: result.type, link: result.url, title: item.title || undefined, caption: item.caption || undefined });
      } catch (error) {
        updateItem(item.id, { status: 'uncertain', error: `${errorMessage(error)} Check the content list before creating this item again.` });
        return false;
      }
      updateItem(item.id, { status: 'completed' });
      return true;
    } catch (error) {
      updateItem(item.id, { status: 'failed', error: errorMessage(error) });
      return false;
    }
  }

  async function submit() {
    const eligible = items.filter((item) => item.status === 'queued' || item.status === 'failed');
    if (!eligible.length) return;
    setSubmitting(true);
    let cursor = 0;
    let created = false;
    async function worker() {
      while (cursor < eligible.length) {
        const item = eligible[cursor++];
        if (await process(item)) created = true;
      }
    }
    await Promise.all([worker(), worker()]);
    setSubmitting(false);
    if (created) await onCompleted();
  }

  if (loadingLimits) return <p className="text-sm text-muted-foreground">Loading upload settings...</p>;
  if (!limits.enabled) return <p className="text-sm text-muted-foreground">Uploads are not configured. Use manual entry instead.</p>;

  return <div className="space-y-4">
    <div>
      <label className="block text-sm font-semibold mb-2 text-foreground" htmlFor="admin-upload-files">Files</label>
      <Input id="admin-upload-files" type="file" multiple accept={limits.allowed_mime_types.join(',')} disabled={submitting} onChange={(event) => { addFiles(event.target.files); event.currentTarget.value = ''; }} />
      <p className="mt-1 text-xs text-muted-foreground">Up to {limits.max_batch_files} files, {Math.floor(limits.max_file_bytes / 1024 / 1024)} MiB each. JPEG, PNG, WebP, and MP4.</p>
    </div>
    {items.map((item) => <div key={item.id} className="rounded-md border border-border p-3 space-y-3">
      <div className="flex items-center justify-between gap-2 text-sm"><span className="truncate">{item.file.name} ({Math.ceil(item.file.size / 1024)} KB)</span>{item.status !== 'completed' && !submitting && <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(item)}>Remove</Button>}</div>
      <div className="flex flex-col gap-3 sm:flex-row">
        {item.file.type.startsWith('image/') ? <img src={item.previewUrl} alt={`Preview of ${item.file.name}`} className="h-28 w-full rounded-md border border-border object-cover sm:w-40" /> : <video src={item.previewUrl} controls preload="metadata" className="h-28 w-full rounded-md border border-border bg-black sm:w-40">Your browser cannot preview this video.</video>}
        <div className="flex-1 space-y-2">
          <Input value={item.title} disabled={submitting || item.status === 'completed'} placeholder="Title" onChange={(event) => updateItem(item.id, { title: event.target.value })} />
          <Input value={item.caption} disabled={submitting || item.status === 'completed'} placeholder="Caption" onChange={(event) => updateItem(item.id, { caption: event.target.value })} />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{item.error ?? item.status}</p>
      {item.status === 'failed' && !submitting && <Button type="button" variant="outline" size="sm" onClick={() => updateItem(item.id, { status: 'queued', error: undefined })}>Retry upload</Button>}
    </div>)}
    <Button type="button" disabled={submitting || !items.some((item) => item.status === 'queued' || item.status === 'failed')} onClick={submit}>{submitting ? 'Uploading...' : 'Upload and create content'}</Button>
  </div>;
}
