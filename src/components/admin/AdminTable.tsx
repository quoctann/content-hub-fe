import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AdminContent, AdminContentUpdatePayload } from '@/types/admin';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnSizingState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import AdminDeleteConfirmDialog from './AdminDeleteConfirmDialog';
import AdminEditDialog from './AdminEditDialog';

const LS_SORT_KEY = 'admin-table-sort';
const LS_SIZE_KEY = 'admin-table-col-size';
const LS_VISIBILITY_KEY = 'admin-table-column-visibility-v1';

interface AdminTableProps {
  data: AdminContent[];
  loading: boolean;
  onToggleHide: (id: number, hidden: boolean) => Promise<void>;
  onUpdate: (id: number, payload: AdminContentUpdatePayload) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onBulkHide: (ids: number[], hidden: boolean) => Promise<void>;
  onBulkDelete: (ids: number[]) => Promise<void>;
}

const helper = createColumnHelper<AdminContent>();

function Thumbnail({ item }: { item: AdminContent }) {
  if (item.type !== 'image' || !item.link) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }
  return (
    <img
      src={item.link}
      alt={item.title ?? 'image'}
      className="w-12 h-12 object-cover rounded border border-border"
      loading="lazy"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  );
}

function truncate(str: string | null | undefined, len = 60): string {
  if (!str) return '—';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

export default function AdminTable({
  data,
  loading,
  onToggleHide,
  onUpdate,
  onDelete,
  onBulkHide,
  onBulkDelete,
}: AdminTableProps) {
  // ── Persisted state ──────────────────────────────────────────────────────
  const [sorting, setSorting] = useState<SortingState>(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_SORT_KEY) ?? '[]');
    } catch {
      return [];
    }
  });

  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_SIZE_KEY) ?? '{}');
    } catch {
      return {};
    }
  });
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_VISIBILITY_KEY) ?? '{}');
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(LS_SORT_KEY, JSON.stringify(sorting));
  }, [sorting]);

  useEffect(() => {
    localStorage.setItem(LS_SIZE_KEY, JSON.stringify(columnSizing));
  }, [columnSizing]);
  useEffect(() => {
    localStorage.setItem(LS_VISIBILITY_KEY, JSON.stringify(columnVisibility));
  }, [columnVisibility]);

  // ── Row selection (for bulk actions) ─────────────────────────────────────
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // ── Dialog state ──────────────────────────────────────────────────────────
  const [editTarget, setEditTarget] = useState<AdminContent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminContent | null>(null);
  const [dialogSaving, setDialogSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = [
    helper.display({
      id: 'select',
      size: 40,
      minSize: 40,
      maxSize: 54,
      enableResizing: false,
      enableHiding: false,
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllRowsSelected() || (table.getIsSomeRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
          aria-label="Select all"
          className="ml-1"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={`Select row ${row.original.id}`}
          className="ml-1"
        />
      ),
    }),

    helper.accessor('id', {
      header: 'ID',
      id: 'id',
      size: 70,
      minSize: 55,
      maxSize: 140,
      cell: (i) => <span className="text-xs font-mono text-muted-foreground">{i.getValue()}</span>,
    }),

    helper.accessor('type', {
      header: 'Type',
      id: 'type',
      size: 80,
      minSize: 65,
      maxSize: 130,
      cell: (i) => {
        const type = i.getValue();
        const bgColor =
          type === 'text'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
            : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200';
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${bgColor}`}>
            {type}
          </span>
        );
      },
    }),

    helper.accessor('is_hidden', {
      header: 'Visible',
      id: 'is_hidden',
      size: 80,
      minSize: 70,
      maxSize: 140,
      cell: (i) => (
        <span
          className={`text-xs font-semibold ${i.getValue() ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
        >
          {i.getValue() ? 'Hidden' : 'Visible'}
        </span>
      ),
    }),

    helper.accessor('title', {
      header: 'Title',
      id: 'title',
      size: 180,
      minSize: 120,
      maxSize: 420,
      cell: (i) => (
        <span title={i.getValue() ?? ''} className="block truncate">
          {truncate(i.getValue(), 40)}
        </span>
      ),
    }),

    helper.accessor('text_data', {
      header: 'Text Data',
      id: 'text_data',
      size: 200,
      minSize: 140,
      maxSize: 500,
      cell: (i) => (
        <span className="text-muted-foreground block truncate" title={i.getValue() ?? ''}>
          {truncate(i.getValue(), 60)}
        </span>
      ),
    }),

    helper.accessor('ocr_text', {
      header: 'OCR Text',
      id: 'ocr_text',
      size: 180,
      minSize: 140,
      maxSize: 500,
      cell: (i) => (
        <span className="text-muted-foreground block truncate" title={i.getValue() ?? ''}>
          {truncate(i.getValue(), 50)}
        </span>
      ),
    }),

    helper.accessor('caption', {
      header: 'Caption',
      id: 'caption',
      size: 160,
      minSize: 120,
      maxSize: 420,
      cell: (i) => (
        <span className="text-muted-foreground block truncate" title={i.getValue() ?? ''}>
          {truncate(i.getValue(), 40)}
        </span>
      ),
    }),

    // Thumbnail column (image type only)
    helper.display({
      id: 'thumbnail',
      header: 'Thumbnail',
      size: 80,
      minSize: 70,
      maxSize: 140,
      cell: ({ row }) => <Thumbnail item={row.original} />,
    }),

    helper.accessor('updated_at', {
      header: 'Last Update',
      id: 'updated_at',
      size: 160,
      minSize: 130,
      maxSize: 260,
      cell: (i) => (i.getValue() ? new Date(i.getValue()!).toLocaleString() : '—'),
    }),

    // Actions column
    helper.display({
      id: 'actions',
      header: 'Actions',
      size: 180,
      minSize: 150,
      maxSize: 300,
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;
        const isToggling = togglingId === item.id;
        return (
          <div className="flex flex-wrap gap-1">
            <Button
              variant="outline"
              size="sm"
              className={`h-7 px-2 text-xs ${
                item.is_hidden
                  ? 'border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 hover:text-green-600'
                  : 'border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950 hover:text-orange-600'
              }`}
              title={item.is_hidden ? 'Show' : 'Hide'}
              disabled={isToggling}
              onClick={async () => {
                setTogglingId(item.id);
                try {
                  await onToggleHide(item.id, !item.is_hidden);
                } finally {
                  setTogglingId(null);
                }
              }}
            >
              {isToggling ? '…' : item.is_hidden ? 'Show' : 'Hide'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600"
              onClick={() => setEditTarget(item)}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
              onClick={() => setDeleteTarget(item)}
            >
              Delete
            </Button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnSizing, rowSelection, columnVisibility },
    onSortingChange: (s) => {
      setSorting(s);
    },
    onColumnSizingChange: (s) => {
      setColumnSizing(s);
    },
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getRowId: (row) => String(row.id),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: 'onChange',
    enableColumnResizing: true,
    enableRowSelection: true,
  });

  // ── Bulk action bar ───────────────────────────────────────────────────────
  const selectedIds = table.getSelectedRowModel().rows.map((r) => r.original.id);

  async function handleBulkHide(hidden: boolean) {
    setBulkLoading(true);
    try {
      await onBulkHide(selectedIds, hidden);
      setRowSelection({});
    } finally {
      setBulkLoading(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Bulk action bar */}
      {selectedIds.length > 0 && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center bg-primary text-primary-foreground px-4 py-3 rounded-lg">
          <span className="font-semibold">
            {selectedIds.length} row{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 ml-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleBulkHide(false)}
              disabled={bulkLoading}
            >
              {bulkLoading ? '…' : 'Bulk Show'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleBulkHide(true)}
              disabled={bulkLoading}
            >
              {bulkLoading ? '…' : 'Bulk Hide'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowBulkDeleteConfirm(true)}
              disabled={bulkLoading}
              className="bg-red-600 text-white hover:bg-red-700 border-none"
            >
              {bulkLoading ? '…' : 'Bulk Delete'}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setRowSelection({})}>
              Clear
            </Button>
          </div>
        </div>
      )}

      <div className="mb-2 flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Show columns</DropdownMenuLabel>
            {table
              .getAllLeafColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(checked) => column.toggleVisibility(!!checked)}
                >
                  {column.id === 'is_hidden'
                    ? 'Visible'
                    : column.id === 'text_data'
                      ? 'Text Data'
                      : column.id === 'ocr_text'
                        ? 'OCR Text'
                        : column.id === 'updated_at'
                          ? 'Last Update'
                          : column.id[0].toUpperCase() + column.id.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                setColumnVisibility({});
                setColumnSizing({});
                setSorting([]);
              }}
            >
              Reset preferences
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="border border-border rounded-lg overflow-x-auto bg-card relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">Loading…</span>
            </div>
          </div>
        )}
        <table
          className="table-fixed border-collapse text-sm"
          style={{ width: table.getTotalSize(), minWidth: '100%' }}
        >
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-border">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`relative text-left px-3 py-2 font-semibold text-muted-foreground ${header.column.getCanSort() ? 'cursor-pointer hover:bg-muted select-none' : ''}`}
                    style={{ width: header.getSize() }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="text-xs text-muted-foreground">
                          {header.column.getIsSorted() === 'asc'
                            ? ' ↑'
                            : header.column.getIsSorted() === 'desc'
                              ? ' ↓'
                              : ' ↕'}
                        </span>
                      )}
                    </div>
                    {/* Resize handle */}
                    {header.column.getCanResize() && (
                      <div
                        className={`select-none touch-none w-4 h-full absolute right-[-8px] top-0 z-10 cursor-col-resize after:absolute after:left-[7px] after:top-0 after:h-full after:w-px after:bg-border hover:after:bg-primary ${header.column.getIsResizing() ? 'bg-primary/20' : ''}`}
                        onMouseDown={(event) => {
                          event.stopPropagation();
                          header.getResizeHandler()(event);
                        }}
                        onTouchStart={(event) => {
                          event.stopPropagation();
                          header.getResizeHandler()(event);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading && table.getRowModel().rows.length === 0 && (
              <>
                {Array.from({ length: 7 }).map((_, rowIndex) => (
                  <tr key={`skeleton-${rowIndex}`} className="border-b border-border">
                    {columns.map((column) => (
                      <td key={column.id} className="px-4 py-3">
                        <div className="h-4 rounded bg-muted/40 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            )}
            {!loading && table.getRowModel().rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  No records found.
                </td>
              </tr>
            )}
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`border-b border-border hover:bg-muted/50 transition-colors ${row.getIsSelected() ? 'bg-primary/5' : ''}`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-3 py-2 text-sm"
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Dialog */}
      {editTarget && (
        <AdminEditDialog
          key={editTarget.id}
          item={editTarget}
          items={data}
          onNavigate={setEditTarget}
          saving={dialogSaving}
          onClose={() => setEditTarget(null)}
          onSave={async (id, payload) => {
            setDialogSaving(true);
            try {
              await onUpdate(id, payload);
              setEditTarget(null);
            } finally {
              setDialogSaving(false);
            }
          }}
        />
      )}

      {/* Delete Confirm Dialog */}
      {deleteTarget && (
        <AdminDeleteConfirmDialog
          loading={dialogSaving}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={async () => {
            setDialogSaving(true);
            try {
              await onDelete(deleteTarget.id);
              setDeleteTarget(null);
            } finally {
              setDialogSaving(false);
            }
          }}
        />
      )}
      {/* Bulk Delete Confirm Dialog */}
      {showBulkDeleteConfirm && (
        <AdminDeleteConfirmDialog
          loading={bulkLoading}
          title={`Delete ${selectedIds.length} items?`}
          message={`Are you sure you want to permanently delete ${selectedIds.length} selected items? This action cannot be undone.`}
          onCancel={() => setShowBulkDeleteConfirm(false)}
          onConfirm={async () => {
            setBulkLoading(true);
            try {
              await onBulkDelete(selectedIds);
              setRowSelection({});
              setShowBulkDeleteConfirm(false);
            } finally {
              setBulkLoading(false);
            }
          }}
        />
      )}
    </>
  );
}
