import { useState, useEffect, useCallback, useMemo } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import { useData } from '../contexts/DataContext'
import { useI18n } from '../i18n/I18nContext'
import { Filter, MapPin, Users, BarChart3, User } from 'lucide-react'

const mapContainerStyle = { width: '100%', height: '500px', borderRadius: '0.5rem' }
const defaultCenter = { lat: -14.235, lng: -51.925 } // Center of Brazil
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || ''

const REGIONS: Record<string, string[]> = {
  'Norte': ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'],
  'Nordeste': ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
  'Centro-Oeste': ['DF', 'GO', 'MT', 'MS'],
  'Sudeste': ['ES', 'MG', 'RJ', 'SP'],
  'Sul': ['PR', 'RS', 'SC'],
}

const MEMBER_RANGES = [
  { label: 'Todos', min: 0, max: Infinity },
  { label: 'Até 50', min: 0, max: 50 },
  { label: '51–100', min: 51, max: 100 },
  { label: '101–300', min: 101, max: 300 },
  { label: '301–500', min: 301, max: 500 },
  { label: '500+', min: 501, max: Infinity },
]


export default function MapPage() {
  const { getChurches, getTopChurches } = useData()
  const { t } = useI18n()
  const [selectedChurch, setSelectedChurch] = useState<any | null>(null)
  const [churches, setChurches] = useState<any[]>([])
  const [topChurches, setTopChurches] = useState<any[]>([])
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [regionFilter, setRegionFilter] = useState<string>('')
  const [memberFilter, setMemberFilter] = useState<number>(0)
  const [showFilters, setShowFilters] = useState(true)

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_KEY,
  })

  useEffect(() => { getChurches().then(setChurches); getTopChurches(5).then(setTopChurches) }, [])

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => { setMap(null) }, [])

  const handleMarkerClick = (church: any) => {
    setSelectedChurch(church)
    if (map) {
      map.panTo({ lat: church.lat, lng: church.lng })
      map.setZoom(10)
    }
  }

  const filteredChurches = useMemo(() => {
    let result = churches
    if (regionFilter) {
      const regionStates = REGIONS[regionFilter] || []
      result = result.filter(c => regionStates.includes(c.state?.toUpperCase()))
    }
    const range = MEMBER_RANGES[memberFilter]
    if (range && memberFilter > 0) {
      result = result.filter(c => (c.memberCount || 0) >= range.min && (c.memberCount || 0) <= range.max)
    }
    return result
  }, [churches, regionFilter, memberFilter])

  const states = [...new Set(filteredChurches.map(c => c.state))].sort()
  const activeFilters = (regionFilter ? 1 : 0) + (memberFilter > 0 ? 1 : 0)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{t('map.title')}</h1>
      <p className="text-gray-600 mb-4">{t('map.subtitle')}</p>

      {/* Filters */}
      <div className="mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 mb-3"
        >
          <Filter size={16} />
          {t('map.filters')}
          {activeFilters > 0 && (
            <span className="bg-gray-900 text-white text-xs px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {showFilters && (
          <div className="bg-white border rounded-lg p-4 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('map.region')}</label>
              <select
                value={regionFilter}
                onChange={e => setRegionFilter(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="">{t('map.allRegions')}</option>
                {Object.keys(REGIONS).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('map.memberCount')}</label>
              <select
                value={memberFilter}
                onChange={e => setMemberFilter(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
              >
                {MEMBER_RANGES.map((r, i) => (
                  <option key={i} value={i}>{r.label} {i > 0 ? t('map.members') : ''}</option>
                ))}
              </select>
            </div>
            {activeFilters > 0 && (
              <button
                onClick={() => { setRegionFilter(''); setMemberFilter(0) }}
                className="text-sm text-red-600 hover:text-red-800 px-3 py-2"
              >
                {t('map.clearFilters')}
              </button>
            )}
            <div className="text-xs text-gray-400 self-center">
              {filteredChurches.length} {t('map.of')} {churches.length} {t('map.affiliatedChurches')}
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={defaultCenter}
              zoom={4}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={{ mapTypeControl: false, streetViewControl: false, fullscreenControl: true }}
            >
              {filteredChurches.map((c: any) => (
                <Marker
                  key={c.id}
                  position={{ lat: c.lat, lng: c.lng }}
                  title={c.name}
                  onClick={() => handleMarkerClick(c)}
                  icon={{
                    url: 'https://maps.google.com/mapfiles/ms/icons/red-church.png',
                    scaledSize: new google.maps.Size(32, 32),
                  }}
                />
              ))}
              {selectedChurch && (
                <InfoWindow
                  position={{ lat: selectedChurch.lat, lng: selectedChurch.lng }}
                  onCloseClick={() => setSelectedChurch(null)}
                >
                  <div className="p-1 min-w-[180px]">
                    <h3 className="font-semibold text-sm">{selectedChurch.name}</h3>
                    <p className="text-xs text-gray-600 mt-1 flex items-center gap-1"><MapPin size={12} /> {selectedChurch.city}, {selectedChurch.state}</p>
                    <p className="text-xs text-gray-600 flex items-center gap-1"><User size={12} /> {selectedChurch.pastorName}</p>
                    <p className="text-xs text-gray-600 flex items-center gap-1"><Users size={12} /> {selectedChurch.memberCount} {t('map.members')}</p>
                    <p className="text-xs text-gray-600 flex items-center gap-1"><BarChart3 size={12} /> {t('map.engagement')}: {selectedChurch.engagementScore}</p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          ) : (
            <FallbackMap churches={filteredChurches} selectedChurch={selectedChurch?.id} onSelect={setSelectedChurch} />
          )}
        </div>

        <div className="space-y-6">
          {selectedChurch && !isLoaded && (
            <div className="bg-white border rounded-lg p-5">
              <h3 className="font-semibold text-lg mb-2">{selectedChurch.name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p className="flex items-center gap-1"><MapPin size={14} /> {selectedChurch.city}, {selectedChurch.state}</p>
                <p className="flex items-center gap-1"><User size={14} /> {selectedChurch.pastorName}</p>
                <p className="flex items-center gap-1"><Users size={14} /> {selectedChurch.memberCount} {t('map.members')}</p>
                <p className="flex items-center gap-1"><BarChart3 size={14} /> {t('map.engagement')}: {selectedChurch.engagementScore}</p>
              </div>
              <button onClick={() => setSelectedChurch(null)} className="mt-3 text-gray-900 text-sm hover:underline">{t('trails.close')}</button>
            </div>
          )}
          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold mb-3">{t('map.topChurches')}</h3>
            <div className="space-y-3">
              {topChurches.map((c: any, i: number) => (
                <div key={c.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded p-1" onClick={() => handleMarkerClick(c)}>
                  <span className={`font-bold text-sm w-6 ${i < 3 ? 'text-gray-900' : 'text-gray-400'}`}>{i + 1}º</span>
                  <div className="flex-1"><p className="text-sm font-medium">{c.name}</p><p className="text-xs text-gray-500">{c.city}/{c.state}</p></div>
                  <span className="text-sm font-bold text-gray-900">{c.engagementScore}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold mb-2">{t('map.churchesByState')}</h3>
            <div className="flex flex-wrap gap-2">{states.map(uf => (<span key={uf} className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">{uf}</span>))}</div>
          </div>
          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold mb-3">{t('map.allChurches')} ({filteredChurches.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredChurches.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between text-sm cursor-pointer hover:bg-gray-50 rounded p-2" onClick={() => handleMarkerClick(c)}>
                  <div><p className="font-medium">{c.name}</p><p className="text-xs text-gray-500">{c.city}/{c.state}</p></div>
                  <span className="text-xs text-gray-400">{c.memberCount} {t('map.members')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Fallback SVG map when Google Maps key is not available
function FallbackMap({ churches, selectedChurch, onSelect }: { churches: any[]; selectedChurch?: string; onSelect: (c: any) => void }) {
  const { t } = useI18n()
  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 border rounded-lg p-6 relative" style={{ minHeight: '500px' }}>
      <p className="text-center text-gray-500 text-sm mb-2">{t('map.fallbackTitle')} — {churches.length} {t('map.affiliatedChurches')}</p>
      <p className="text-center text-xs text-gray-400 mb-4">{t('map.configureKey')}</p>
      <svg viewBox="0 0 600 600" className="w-full h-auto">
        <rect width="600" height="600" fill="none" />
        {churches.map((c: any) => {
          const x = ((c.lng + 75) / 40) * 500 + 50
          const y = ((c.lat + 35) / 35) * 450 + 50
          return (
            <g key={c.id} onClick={() => onSelect(c)} className="cursor-pointer">
              <circle cx={x} cy={y} r={selectedChurch === c.id ? 12 : 8} fill={selectedChurch === c.id ? '#4f46e5' : '#6366f1'} stroke="white" strokeWidth="2" />
              <text x={x} y={y - 14} textAnchor="middle" fontSize="10" fill="#374151" fontWeight="500">{c.state}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
