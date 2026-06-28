import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Settings, Save, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import parkingService from '@/services/parkingService'
import pricingService from '@/services/pricingService'
import { useAuth } from '@/context/AuthContext'

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: `${String(i).padStart(2, '0')}:00`,
}))

function HourSelect({ value, onChange, label }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="relative">
        <select
          className="w-full h-10 rounded-md border border-input bg-background px-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
          value={value}
          onChange={e => onChange(parseInt(e.target.value))}
        >
          {HOURS.map(h => (
            <option key={h.value} value={h.value}>{h.label}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  )
}

function RateInput({ label, value, onChange, description }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
        <input
          type="number"
          min="0"
          step="5"
          value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="w-full h-10 rounded-md border border-input bg-background pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    </div>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
          checked ? 'bg-primary' : 'bg-muted'
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

const EMPTY_CONFIG = {
  normalRate: 50,
  weekdayPeakEnabled: false,
  weekdayPeakStartHour: 9,
  weekdayPeakEndHour: 21,
  weekdayPeakRate: 80,
  weekendPeakEnabled: false,
  weekendPeakStartHour: 10,
  weekendPeakEndHour: 22,
  weekendPeakRate: 100,
}

export default function OwnerPricingConfig() {
  const { user } = useAuth()
  const [locations, setLocations] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [config, setConfig] = useState(EMPTY_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load owner's locations
  useEffect(() => {
    parkingService.getMyLocations()
      .then(data => {
        setLocations(data)
        if (data.length > 0) setSelectedId(data[0].id)
      })
      .catch(() => toast.error('Could not load locations'))
      .finally(() => setLoading(false))
  }, [])

  // Load pricing config when location changes
  useEffect(() => {
    if (!selectedId) return
    setLoading(true)
    pricingService.getConfig(selectedId)
      .then(c => setConfig({
        normalRate:           c.normalRate,
        weekdayPeakEnabled:   c.weekdayPeakEnabled,
        weekdayPeakStartHour: c.weekdayPeakStartHour,
        weekdayPeakEndHour:   c.weekdayPeakEndHour,
        weekdayPeakRate:      c.weekdayPeakRate,
        weekendPeakEnabled:   c.weekendPeakEnabled,
        weekendPeakStartHour: c.weekendPeakStartHour,
        weekendPeakEndHour:   c.weekendPeakEndHour,
        weekendPeakRate:      c.weekendPeakRate,
      }))
      .catch(() => toast.error('Could not load pricing config'))
      .finally(() => setLoading(false))
  }, [selectedId])

  const set = (key, value) => setConfig(prev => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    if (!selectedId) return
    setSaving(true)
    try {
      await pricingService.saveConfig(selectedId, {
        normalRate:           config.normalRate,
        weekdayPeakEnabled:   config.weekdayPeakEnabled,
        weekdayPeakStartHour: config.weekdayPeakStartHour,
        weekdayPeakEndHour:   config.weekdayPeakEndHour,
        weekdayPeakRate:      config.weekdayPeakRate,
        weekendPeakEnabled:   config.weekendPeakEnabled,
        weekendPeakStartHour: config.weekendPeakStartHour,
        weekendPeakEndHour:   config.weekendPeakEndHour,
        weekendPeakRate:      config.weekendPeakRate,
      })
      toast.success('Pricing config saved!')
    } catch {
      toast.error('Failed to save pricing config')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <p className="text-muted-foreground">Set base rates and peak pricing for your locations</p>

      {/* Location selector */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-1.5">
            <Label>Select Location</Label>
            <div className="relative">
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                value={selectedId ?? ''}
                onChange={e => setSelectedId(parseInt(e.target.value))}
                disabled={loading || locations.length === 0}
              >
                {locations.length === 0
                  ? <option>No locations found</option>
                  : locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.locationName}</option>
                  ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedId && !loading && (
        <>
          {/* Normal Rate */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                Base Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <RateInput
                label="Normal Hourly Rate"
                description="Applied outside peak hours"
                value={config.normalRate}
                onChange={v => set('normalRate', v)}
              />
            </CardContent>
          </Card>

          {/* Weekday Peak */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Weekday Peak Pricing</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <Toggle
                label="Enable Weekday Peak"
                checked={config.weekdayPeakEnabled}
                onChange={v => set('weekdayPeakEnabled', v)}
              />
              {config.weekdayPeakEnabled && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-3">
                    <HourSelect
                      label="Peak Start"
                      value={config.weekdayPeakStartHour}
                      onChange={v => set('weekdayPeakStartHour', v)}
                    />
                    <HourSelect
                      label="Peak End"
                      value={config.weekdayPeakEndHour}
                      onChange={v => set('weekdayPeakEndHour', v)}
                    />
                  </div>
                  <RateInput
                    label="Weekday Peak Rate"
                    value={config.weekdayPeakRate}
                    onChange={v => set('weekdayPeakRate', v)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Applied Mon–Fri between {String(config.weekdayPeakStartHour).padStart(2,'0')}:00 and {String(config.weekdayPeakEndHour).padStart(2,'0')}:00
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Weekend Peak */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Weekend Peak Pricing</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <Toggle
                label="Enable Weekend Peak"
                checked={config.weekendPeakEnabled}
                onChange={v => set('weekendPeakEnabled', v)}
              />
              {config.weekendPeakEnabled && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-3">
                    <HourSelect
                      label="Peak Start"
                      value={config.weekendPeakStartHour}
                      onChange={v => set('weekendPeakStartHour', v)}
                    />
                    <HourSelect
                      label="Peak End"
                      value={config.weekendPeakEndHour}
                      onChange={v => set('weekendPeakEndHour', v)}
                    />
                  </div>
                  <RateInput
                    label="Weekend Peak Rate"
                    value={config.weekendPeakRate}
                    onChange={v => set('weekendPeakRate', v)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Applied Sat–Sun between {String(config.weekendPeakStartHour).padStart(2,'0')}:00 and {String(config.weekendPeakEndHour).padStart(2,'0')}:00
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save Pricing Config'}
          </Button>
        </>
      )}
    </div>
  )
}
