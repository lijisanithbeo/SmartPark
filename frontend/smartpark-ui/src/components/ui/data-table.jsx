import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'

export function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No data found.',
  emptyIcon,
  pageSize = 10,
  searchable = false,
  searchPlaceholder = 'Search...',
  onSearch,
  className,
}) {
  const [currentPage, setCurrentPage] = React.useState(1)
  const [searchValue, setSearchValue] = React.useState('')

  const filteredData = React.useMemo(() => {
    if (!searchable || !searchValue.trim()) return data
    const lower = searchValue.toLowerCase()
    return data.filter(row =>
      columns.some(col => {
        const val = row[col.key]
        return val != null && String(val).toLowerCase().includes(lower)
      })
    )
  }, [data, searchValue, searchable, columns])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))

  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])

  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchValue, data])

  function handleSearch(e) {
    const val = e.target.value
    setSearchValue(val)
    if (onSearch) onSearch(val)
  }

  return (
    <div className={cn('space-y-4', className)}>
      {searchable && (
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={handleSearch}
          className="max-w-sm"
        />
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(col => (
                <TableHead key={col.key} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, rowIdx) => (
                <TableRow key={rowIdx}>
                  {columns.map(col => (
                    <TableCell key={col.key}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0">
                  <EmptyState
                    icon={emptyIcon}
                    title={emptyMessage}
                    className="py-10"
                  />
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <TableRow key={row.id ?? rowIdx}>
                  {columns.map(col => (
                    <TableCell key={col.key} className={col.className}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
