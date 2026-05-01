import { useState, useEffect, useCallback } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import { useData } from '../contexts/DataContext'
import { useI18n } from '../i18n/I18nContext'

const mapContainerStyle = { width: '100%', height: '500px', borderRadius: '0.5rem' }
const defaultCenter = { lat: -14.235, lng: -51.925 } // Center of Brazil
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || ''

export default function MapPage() {
  const { getChurches, getTopChurches } = useData()
  const { t } = useI18n()
  const [selectedChurch, setSelectedChurch] = useState<any | null>(null)
  const [churches, setChurches] = useState<any[]>([])
  const [topChurches, setTopChurches] = useState<any[]>([])
  const [map, setMap] = useState<google.maps.Map | null>(null)

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

  const states = [...new Set(churches.map(c => c.state))].sort()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{t('map.title')}</h1>
      <p className="text-gray-600 mb-6">{t('map.subtitle')}</p>
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
              {churches.map((c: any) => (
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
                    <p className="text-xs text-gray-600 mt-1">📍 {selectedChurch.city}, {selectedChurch.state}</p>
                    <p className="text-xs text-gray-600">👤 {selectedChurch.pastorName}</p>
                    <p className="text-xs text-gray-600">👥 {selectedChurch.memberCount} {t('map.members')}</p>
                    <p className="text-xs text-gray-600">📊 {t('map.engagement')}: {selectedChurch.engagementScore}</p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          ) : (
            <FallbackMap churches={churches} selectedChurch={selectedChurch?.id} onSelect={setSelectedChurch} />
          )}
        </div>

        <div className="space-y-6">
          {selectedChurch && !isLoaded && (
            <div className="bg-white border rounded-lg p-5">
              <h3 className="font-semibold text-lg mb-2">{selectedChurch.name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>📍 {selectedChurch.city}, {selectedChurch.state}</p>
                <p>👤 {selectedChurch.pastorName}</p>
                <p>👥 {selectedChurch.memberCount} {t('map.members')}</p>
                <p>📊 {t('map.engagement')}: {selectedChurch.engagementScore}</p>
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
            <h3 className="font-semibold mb-3">{t('map.allChurches')} ({churches.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {churches.map((c: any) => (
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
