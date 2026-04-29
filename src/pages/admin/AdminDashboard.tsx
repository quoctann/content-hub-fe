import AdminAddDialog from '@/components/admin/AdminAddDialog';
import AdminTable from '@/components/admin/AdminTable';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  adminBulkToggleHide,
  adminBulkDeleteContent,
  adminCreateContent,
  adminDeleteContent,
  adminListContent,
  adminToggleHide,
  adminUpdateContent,
} from '@/services/admin.service';
import { useAuthStore } from '@/stores/auth.store';
import type {
  AdminContentCreatePayload,
  AdminContentUpdatePayload,
  AdminListResponse,
  AdminSearchFilter,
} from '@/types/admin';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  // ── Filter & Pagination state ─────────────────────────────────────────────
  const [filter, setFilter] = useState<AdminSearchFilter>({
    q: '',
    type: '',
    visible: '',
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageInput, setPageInput] = useState('1');

  // ── Data state ────────────────────────────────────────────────────────────
  const [response, setResponse] = useState<AdminListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Dialog state ──────────────────────────────────────────────────────────
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addSaving, setAddSaving] = useState(false);

  // ── Theme ─────────────────────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(() => {
    return (
      document.documentElement.classList.contains('dark') ||
      localStorage.getItem('admin-theme') === 'dark'
    );
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('admin-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('admin-theme', 'light');
    }
  }, [darkMode]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (f: AdminSearchFilter, p: number, ps: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminListContent(f, p, ps);
      setResponse(data);
    } catch {
      setError('Failed to load content. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + whenever filter/page/pageSize changes
  useEffect(() => {
    fetchData(filter, page, pageSize);
  }, [filter, page, pageSize, fetchData]);

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  // ── Search / filter handlers ──────────────────────────────────────────────
  const [localSearch, setLocalSearch] = useState(filter.q ?? '');
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearchChange(q: string) {
    setLocalSearch(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setFilter((f) => ({ ...f, q }));
      setPage(1);
      setPageInput('1');
    }, 500);
  }

  function handleTypeFilter(type: string) {
    setFilter((f) => ({
      ...f,
      type: (type === 'all-types' ? '' : type) as AdminSearchFilter['type'],
    }));
    setPage(1);
    setPageInput('1');
  }

  function handleVisibleFilter(visible: string) {
    setFilter((f) => ({
      ...f,
      visible: (visible === 'all-visibility' ? '' : visible) as AdminSearchFilter['visible'],
    }));
    setPage(1);
    setPageInput('1');
  }

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = response?.pagination.total_pages ?? 1;
  const totalCount = response?.pagination.total_count ?? 0;

  function goToPage(p: number) {
    const clamped = Math.max(1, Math.min(p, totalPages));
    setPage(clamped);
    setPageInput(String(clamped));
  }

  // ── CRUD handlers (passed to AdminTable) ─────────────────────────────────
  async function handleToggleHide(id: number, hidden: boolean) {
    try {
      setError(null);
      const updated = await adminToggleHide(id, hidden);
      setResponse((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((item) => (item.id === id ? updated : item)),
        };
      });
      toast.success(`Content ${hidden ? 'hidden' : 'shown'}.`);
    } catch {
      setError('Failed to update visibility. Please try again.');
      throw new Error('Toggle hide failed');
    }
  }

  async function handleUpdate(id: number, payload: AdminContentUpdatePayload) {
    try {
      setError(null);
      const updated = await adminUpdateContent(id, payload);
      setResponse((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((item) => (item.id === id ? updated : item)),
        };
      });
      toast.success('Content updated successfully.');
    } catch {
      setError('Failed to save changes. Please try again.');
      throw new Error('Update failed');
    }
  }

  async function handleDelete(id: number) {
    try {
      setError(null);
      await adminDeleteContent(id);
      setResponse((prev) => {
        if (!prev) return prev;
        const items = prev.items.filter((item) => item.id !== id);
        return {
          ...prev,
          items,
          pagination: {
            ...prev.pagination,
            total_count: prev.pagination.total_count - 1,
          },
        };
      });
      toast.success('Content deleted.');
    } catch {
      setError('Failed to delete content. Please try again.');
      throw new Error('Delete failed');
    }
  }

  async function handleBulkHide(ids: number[], hidden: boolean) {
    try {
      setError(null);
      const updatedItems = await adminBulkToggleHide(ids, hidden);
      setResponse((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((item) => {
            const updated = updatedItems.find((update) => update.id === item.id);
            return updated ?? item;
          }),
        };
      });
      toast.success(`Bulk ${hidden ? 'hide' : 'show'} completed.`);
    } catch {
      setError('Failed to update selection. Please try again.');
      throw new Error('Bulk hide failed');
    }
  }

  async function handleBulkDelete(ids: number[]) {
    try {
      setError(null);
      await adminBulkDeleteContent(ids);
      setResponse((prev) => {
        if (!prev) return prev;
        const remainingItems = prev.items.filter((item) => !ids.includes(item.id));
        return {
          ...prev,
          items: remainingItems,
          pagination: {
            ...prev.pagination,
            total_count: prev.pagination.total_count - (prev.items.length - remainingItems.length),
          },
        };
      });
      toast.success('Bulk delete completed.');
    } catch {
      setError('Failed to delete selection. Please try again.');
      throw new Error('Bulk delete failed');
    }
  }

  async function handleAdd(payload: AdminContentCreatePayload) {
    setAddSaving(true);
    try {
      await adminCreateContent(payload);
      setShowAddDialog(false);
      // Refresh to show the new item
      await fetchData(filter, 1, pageSize);
      setPage(1);
      setPageInput('1');
    } finally {
      setAddSaving(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/admin/login', { replace: true });
  }

  const items = response?.items ?? [];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen bg-background text-foreground`}>
      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-card flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-lg text-foreground">Admin Portal</span>
        </div>
        <div className="relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button id="admin-dash-menu-btn" variant="outline" size="sm">
                Menu ▾
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Manage content</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDarkMode((d) => !d)}>
                Theme ({darkMode ? 'Dark' : 'Light'})
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* ── Section header ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 mb-6">
          <h2 className="text-2xl font-bold text-foreground">Manage content</h2>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Input
              id="admin-search-input"
              type="search"
              placeholder="Search by ID, keyword…"
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full sm:flex-1 sm:min-w-60"
            />

            <Select onValueChange={(e) => handleTypeFilter(e)} value={filter.type ?? 'all-types'}>
              <SelectTrigger className="w-full sm:w-auto">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all-types">All types</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              onValueChange={(e) => handleVisibleFilter(e)}
              value={filter.visible ?? 'all-visibility'}
            >
              <SelectTrigger className="w-full sm:w-auto">
                <SelectValue placeholder="All visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all-visibility">All visibility</SelectItem>
                  <SelectItem value="true">Visible only</SelectItem>
                  <SelectItem value="false">Hidden only</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button
              id="admin-add-btn"
              className="w-full sm:w-auto"
              onClick={() => setShowAddDialog(true)}
            >
              + Add
            </Button>
          </div>
        </div>

        {/* ── Error banner ─────────────────────────────────────────────── */}
        {error && (
          <div
            className="bg-destructive/10 border border-destructive/30 rounded-md px-4 py-3 mb-6 text-destructive text-sm flex items-center gap-2"
            role="alert"
          >
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* ── Table ──────────────────────────────────────────────────── */}
        <AdminTable
          data={items}
          loading={loading}
          onToggleHide={handleToggleHide}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onBulkHide={handleBulkHide}
          onBulkDelete={handleBulkDelete}
        />

        {/* ── Pagination footer ────────────────────────────────────────── */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
          <span>
            Showing {items.length} / {totalCount} records
          </span>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPage(1);
                setPageInput('1');
              }}
            >
              <SelectTrigger className="w-full sm:w-auto">
                <SelectValue placeholder="Select page size" />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-1">
              <Button
                id="admin-prev-page-btn"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1 || loading}
              >
                ← Prev
              </Button>

              <Input
                id="admin-page-input"
                type="number"
                min={1}
                max={totalPages}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onBlur={() => goToPage(Number(pageInput))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') goToPage(Number(pageInput));
                }}
                className="w-20 text-center"
                aria-label="Page number"
              />
              <span className="text-muted-foreground text-sm">/ {totalPages}</span>

              <Button
                id="admin-next-page-btn"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages || loading}
              >
                Next →
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* ── Add dialog ───────────────────────────────────────────────── */}
      {showAddDialog && (
        <AdminAddDialog
          saving={addSaving}
          onAdd={handleAdd}
          onClose={() => setShowAddDialog(false)}
        />
      )}
    </div>
  );
}
