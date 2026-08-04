import { useEffect, useRef } from 'react'
import maplibregl from '@neshan-maps-platform/maplibre-sdk'
import type { Map as MapLibreMap, Marker } from 'maplibre-gl'
import { NESHAN_API_KEY, NESHAN_STYLE_URL } from '../../lib/neshan'
import styles from './NeshanMap.module.scss'

export interface NeshanMapProps {
  lat: number
  lng: number
  zoom?: number
  interactive?: boolean
  className?: string
}

/** Neshan MapLibre map with a single marker — see docs/hotel-detail-plan.md. */
export function NeshanMap({ lat, lng, zoom = 15, interactive = true, className }: NeshanMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markerRef = useRef<Marker | null>(null)

  // Map/marker are created once; lat/lng updates are applied in the effect
  // below instead of recreating the whole map instance.
  useEffect(() => {
    if (!containerRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: NESHAN_STYLE_URL,
      center: [lng, lat],
      zoom,
      apiKey: NESHAN_API_KEY,
      interactive,
    })
    const marker = new maplibregl.Marker().setLngLat([lng, lat]).addTo(map)

    mapRef.current = map
    markerRef.current = marker

    return () => {
      marker.remove()
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive])

  useEffect(() => {
    mapRef.current?.setCenter([lng, lat])
    markerRef.current?.setLngLat([lng, lat])
  }, [lat, lng])

  return <div ref={containerRef} className={[styles.map, className].filter(Boolean).join(' ')} />
}
