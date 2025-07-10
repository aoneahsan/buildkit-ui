import React, { useState } from 'react';
import { DataTable as PrimeDataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useTheme } from '../../providers/ThemeProvider';
import { useTracking } from '../../hooks';
import { cn } from '../../utils';

export interface DataTableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  filter?: boolean;
  body?: (rowData: any) => React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export interface DataTableProps extends Omit<React.ComponentProps<typeof PrimeDataTable>, 'value'> {
  data: any[];
  columns: DataTableColumn[];
  trackingMetadata?: Record<string, any>;
  selectionMode?: 'single' | 'multiple' | 'checkbox';
  onSelectionChange?: (selection: any) => void;
  loading?: boolean;
  emptyMessage?: string;
  title?: string;
  showGridlines?: boolean;
  striped?: boolean;
  size?: 'small' | 'normal' | 'large';
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  className,
  trackingMetadata,
  selectionMode,
  onSelectionChange,
  loading = false,
  emptyMessage = 'No records found',
  title,
  showGridlines = false,
  striped = true,
  size = 'normal',
  paginator = true,
  rows = 10,
  rowsPerPageOptions = [5, 10, 25, 50],
  ...props
}) => {
  const { theme } = useTheme();
  const { trackEvent } = useTracking({ 
    componentType: 'DataTable',
    componentProps: trackingMetadata 
  });
  
  const [selection, setSelection] = useState<any>(null);
  const [globalFilter, setGlobalFilter] = useState('');

  const handleSelectionChange = (e: any) => {
    setSelection(e.value);
    trackEvent('datatable_selection_change', { 
      selectionMode,
      selectedCount: Array.isArray(e.value) ? e.value.length : 1,
      ...trackingMetadata 
    });
    onSelectionChange?.(e.value);
  };

  const handleSort = (e: any) => {
    trackEvent('datatable_sort', { 
      field: e.sortField,
      order: e.sortOrder,
      ...trackingMetadata 
    });
  };

  const handleFilter = (e: any) => {
    trackEvent('datatable_filter', { 
      filters: Object.keys(e.filters),
      ...trackingMetadata 
    });
  };

  const handlePage = (e: any) => {
    trackEvent('datatable_page_change', { 
      page: e.page,
      rows: e.rows,
      ...trackingMetadata 
    });
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'p-datatable-sm';
      case 'large':
        return 'p-datatable-lg';
      default:
        return '';
    }
  };

  const tableClasses = cn(
    'buildkit-datatable',
    getSizeClass(),
    showGridlines && 'p-datatable-gridlines',
    striped && 'p-datatable-striped',
    className
  );

  const header = (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {title && (
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
      )}
      <div className="relative">
        <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input
          type="text"
          value={globalFilter}
          onChange={(e) => {
            setGlobalFilter(e.target.value);
            trackEvent('datatable_global_search', { 
              query: e.target.value,
              ...trackingMetadata 
            });
          }}
          placeholder="Search..."
          className={cn(
            'pl-10 pr-4 py-2',
            'border rounded-lg',
            'bg-white dark:bg-gray-800',
            'border-gray-300 dark:border-gray-600',
            'text-gray-900 dark:text-white',
            'placeholder-gray-400 dark:placeholder-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-buildkit-500',
            'transition-colors duration-200'
          )}
        />
      </div>
    </div>
  );

  return (
    <div className="buildkit-datatable-container">
      <PrimeDataTable
        {...props}
        value={data}
        selection={selection}
        onSelectionChange={selectionMode ? handleSelectionChange : undefined}
        selectionMode={selectionMode as any}
        dataKey="id"
        className={tableClasses}
        loading={loading}
        emptyMessage={emptyMessage}
        header={header}
        globalFilter={globalFilter}
        paginator={paginator}
        rows={rows}
        rowsPerPageOptions={rowsPerPageOptions}
        onSort={handleSort}
        onFilter={handleFilter}
        onPage={handlePage}
        removableSort
        resizableColumns
        reorderableColumns
        pt={{
          root: { 
            className: cn(
              'overflow-hidden',
              'border rounded-lg',
              'bg-white dark:bg-gray-800',
              'border-gray-200 dark:border-gray-700'
            )
          },
          wrapper: { className: 'overflow-auto' },
          header: { 
            className: cn(
              'px-6 py-4',
              'border-b border-gray-200 dark:border-gray-700',
              'bg-gray-50 dark:bg-gray-900/50'
            )
          },
          table: { className: 'w-full' },
          thead: { className: 'bg-gray-50 dark:bg-gray-900/50' },
          tbody: { className: 'bg-white dark:bg-gray-800' },
          tr: { 
            className: cn(
              'border-b border-gray-200 dark:border-gray-700',
              'hover:bg-gray-50 dark:hover:bg-gray-700/50',
              'transition-colors duration-150'
            )
          },
          th: { 
            className: cn(
              'px-6 py-3',
              'text-left text-xs font-medium',
              'text-gray-500 dark:text-gray-400',
              'uppercase tracking-wider'
            )
          },
          td: { 
            className: cn(
              'px-6 py-4',
              'text-sm text-gray-900 dark:text-white'
            )
          },
          loadingOverlay: { 
            className: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm' 
          },
          loadingIcon: { className: 'text-buildkit-500' },
          paginator: { 
            className: cn(
              'px-6 py-3',
              'border-t border-gray-200 dark:border-gray-700',
              'bg-gray-50 dark:bg-gray-900/50'
            )
          }
        }}
      >
        {columns.map((col) => (
          <Column
            key={col.field}
            field={col.field}
            header={col.header}
            sortable={col.sortable}
            filter={col.filter}
            body={col.body}
            style={col.style}
            className={col.className}
          />
        ))}
      </PrimeDataTable>
    </div>
  );
};