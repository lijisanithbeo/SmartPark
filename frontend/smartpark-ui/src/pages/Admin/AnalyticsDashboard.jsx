import { useEffect, useState, useCallback } from 'react'
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import analyticsService from '@/services/analyticsService'

// ─── colour tokens ────────────────────────────────────────────────────────────
const COLOR_BLUE = '#0078d4'
const COLOR_TEAL = '#00b7c3'
const COLOR_PURPLE = '#8b5cf6'

// ─── helpers ─────────────────────────────────────────────────────────────────

function ChartCard({ title, loading, children, className }) {
  return (
    <Card className={cn('rounded-xl border bg-card shadow-sm', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[280px] w-full rounded-lg" />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}

function EmptyState({ label = 'No data available' }) {
  return (
    <div className="flex h-[280px] flex-col items-center justify-center gap-2 text-muted-foreground">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10 opacity-25"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l4-4 4 4 4-4" />
      </svg>
      <p className="text-sm">{label}</p>
    </div>
  )
}

const tickStyle = { fontSize: 11, fill: 'currentColor', opacity: 0.6 }

function CustomTooltip({ active, payload, label, prefix = '', suffix = '' }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }} className="text-xs">
          {entry.name}: {prefix}{Number(entry.value).toLocaleString()}{suffix}
        </p>
      ))}
    </div>
  )
}

// ─── gradient defs shared across area charts ─────────────────────────────────
// Recharts renders children of chart components inside SVG context,
// so native SVG elements (lowercase) work directly here.
function AreaGradients() {
  return (
    <defs>
      <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%"  stopColor={COLOR_BLUE} stopOpacity={0.25} />
        <stop offset="95%" stopColor={COLOR_BLUE} stopOpacity={0.02} />
      </linearGradient>
      <linearGradient id="gradTeal" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%"  stopColor={COLOR_TEAL} stopOpacity={0.25} />
        <stop offset="95%" stopColor={COLOR_TEAL} stopOpacity={0.02} />
      </linearGradient>
    </defs>
  )
}

const gridProps = { strokeDasharray: '3 3', opacity: 0.3 }

// ─── date-range tab component ─────────────────────────────────────────────────
const DATE_RANGES = [
  { label: '7 Days',  value: '7' },
  { label: '30 Days', value: '30' },
  { label: '90 Days', value: '90' },
]

function DateRangeTabs({ value, onChange }) {
  return (
    <div className="flex gap-1 rounded-lg border bg-muted p-1 w-fit">
      {DATE_RANGES.map(({ label, value: v }) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            value === v
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState('30')

  // static data (no dateRange dependency)
  const [peakHours,   setPeakHours]   = useState([])
  const [peakDays,    setPeakDays]    = useState([])
  const [locationPerf, setLocationPerf] = useState([])

  // trend data (re-fetched on dateRange change)
  const [resvTrend,  setResvTrend]  = useState([])
  const [revTrend,   setRevTrend]   = useState([])
  const [occTrend,   setOccTrend]   = useState([])

  // loading flags
  const [loadingStatic,  setLoadingStatic]  = useState(true)
  const [loadingTrends,  setLoadingTrends]  = useState(true)

  // fetch static data once
  useEffect(() => {
    setLoadingStatic(true)
    Promise.all([
      analyticsService.getPeakHours(),
      analyticsService.getPeakDays(),
      analyticsService.getLocationPerformance(),
    ])
      .then(([hours, days, perf]) => {
        setPeakHours(hours ?? [])
        setPeakDays(days ?? [])
        setLocationPerf(perf ?? [])
      })
      .catch(() => toast.error('Failed to load peak hour / location data'))
      .finally(() => setLoadingStatic(false))
  }, [])

  // fetch trend data whenever dateRange changes
  const fetchTrends = useCallback((days) => {
    setLoadingTrends(true)
    Promise.all([
      analyticsService.getReservationTrend(days),
      analyticsService.getRevenueTrend(days),
      analyticsService.getOccupancyTrend(days),
    ])
      .then(([resv, rev, occ]) => {
        setResvTrend(resv ?? [])
        setRevTrend(rev ?? [])
        setOccTrend(occ ?? [])
      })
      .catch(() => toast.error('Failed to load trend data'))
      .finally(() => setLoadingTrends(false))
  }, [])

  useEffect(() => {
    fetchTrends(Number(dateRange))
  }, [dateRange, fetchTrends])

  return (
    <div className="space-y-6">
      {/* ── Page heading ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Booking trends, revenue insights, and location performance
          </p>
        </div>
        <DateRangeTabs value={dateRange} onChange={setDateRange} />
      </div>

      {/* ── Row 1: Peak Hours & Peak Days ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Bookings by Hour" loading={loadingStatic}>
          {peakHours.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={peakHours} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="hourLabel" tick={tickStyle} />
                <YAxis tick={tickStyle} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="bookingCount" name="Bookings" fill={COLOR_BLUE} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Bookings by Day" loading={loadingStatic}>
          {peakDays.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={peakDays} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="dayName" tick={tickStyle} />
                <YAxis tick={tickStyle} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="bookingCount" name="Bookings" fill={COLOR_PURPLE} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ── Row 2: Reservation Trend & Revenue Trend ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Reservation Trend" loading={loadingTrends}>
          {resvTrend.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={resvTrend} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <AreaGradients />
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="date" tick={tickStyle} />
                <YAxis tick={tickStyle} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="reservationCount"
                  name="Reservations"
                  stroke={COLOR_BLUE}
                  strokeWidth={2}
                  fill="url(#gradBlue)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Revenue Trend (₹)" loading={loadingTrends}>
          {revTrend.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revTrend} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <AreaGradients />
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="date" tick={tickStyle} />
                <YAxis tick={tickStyle} />
                <Tooltip content={<CustomTooltip prefix="₹" />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke={COLOR_TEAL}
                  strokeWidth={2}
                  fill="url(#gradTeal)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ── Row 3: Occupancy Trend ── */}
      <ChartCard title="Occupancy Trend (%)" loading={loadingTrends}>
        {occTrend.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={occTrend} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="date" tick={tickStyle} />
              <YAxis tick={tickStyle} domain={[0, 100]} unit="%" />
              <Tooltip content={<CustomTooltip suffix="%" />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="occupancyPercent"
                name="Occupancy"
                stroke={COLOR_BLUE}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* ── Row 4: Location Performance ── */}
      <ChartCard title="Location Performance" loading={loadingStatic}>
        {locationPerf.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Horizontal bar chart */}
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                layout="vertical"
                data={locationPerf}
                margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
              >
                <CartesianGrid {...gridProps} horizontal={false} />
                <XAxis type="number" tick={tickStyle} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="locationName"
                  tick={{ ...tickStyle, opacity: 0.8 }}
                  width={130}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="reservationCount" name="Reservations" fill={COLOR_BLUE} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>

            {/* Data table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Location</th>
                    <th className="pb-2 pr-4 font-medium">City</th>
                    <th className="pb-2 pr-4 font-medium text-right">Total Slots</th>
                    <th className="pb-2 pr-4 font-medium text-right">Reservations</th>
                    <th className="pb-2 pr-4 font-medium text-right">Revenue</th>
                    <th className="pb-2 font-medium text-right">Occupancy %</th>
                  </tr>
                </thead>
                <tbody>
                  {locationPerf.map((row, i) => (
                    <tr
                      key={row.locationName ?? i}
                      className="border-b last:border-0 hover:bg-muted/40 transition-colors"
                    >
                      <td className="py-2 pr-4 font-medium">{row.locationName ?? '—'}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{row.city ?? '—'}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">{row.totalSlots ?? '—'}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">{row.reservationCount ?? '—'}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">
                        {row.revenue != null ? `₹${Number(row.revenue).toLocaleString()}` : '—'}
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        {row.occupancy != null ? `${row.occupancy}%` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </ChartCard>
    </div>
  )
}
