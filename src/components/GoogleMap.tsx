import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { Loader } from '@googlemaps/js-api-loader'
import { setSelectedPharmacy } from '../store/pharmacySlice'
import type { Pharmacy } from '@/types'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

interface MarkerData {
  marker: any
  infoWindow: any
}

export default function GoogleMap(): React.JSX.Element {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<MarkerData[]>([])
  const dispatch = useAppDispatch()

  const { pharmacies, selectedCity, selectedPharmacy } = useAppSelector(state => state.pharmacy)
  const { mapExpanded, language } = useAppSelector(state => state.ui)

  // Default coordinates for Podgorica
  const defaultCenter = { lat: 42.4415, lng: 19.2621 }

  const getCenterCoordinates = (): { lat: number; lng: number } => {
    if (selectedCity) {
      // Use first pharmacy in selected city as center
      const cityPharmacies = pharmacies.filter(p => p.city_id === selectedCity.id)
      if (cityPharmacies.length > 0) {
        return {
          lat: cityPharmacies[0].lat || 0,
          lng: cityPharmacies[0].lng || 0
        }
      }
    }
    return defaultCenter
  }

  const initializeMap = async (): Promise<void> => {
    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['maps', 'marker']
    })

    try {
      await loader.load()

      const center = getCenterCoordinates()

      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center,
        zoom: 13,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      })

      updateMarkers()
    } catch (error) {
      console.error('Error loading Google Maps:', error)
    }
  }

  const updateMarkers = (): void => {
    if (!mapInstanceRef.current) return

    // Clear existing markers
    markersRef.current.forEach(markerData => markerData.marker.setMap(null))
    markersRef.current = []

    // Create new markers
    pharmacies.forEach((pharmacy: Pharmacy) => {
      const position = {
        lat: pharmacy.lat || 0,
        lng: pharmacy.lng || 0
      }

      // Determine marker color based on pharmacy type
      let markerColor = '#8168f0' // default blue
      if (pharmacy.is_24h) {
        markerColor = '#31c2a7' // green for 24/7
      } else if (pharmacy.open_sunday) {
        markerColor = '#f08c1a' // orange for Sunday open
      }

      const marker = new google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: language === 'me' ? pharmacy.name_me : (pharmacy.name_en || pharmacy.name_me),
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: markerColor,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 8
        }
      })

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: createInfoWindowContent(pharmacy)
      })

      marker.addListener('click', () => {
        // Close other info windows
        markersRef.current.forEach(({ infoWindow: iw }: MarkerData) => {
          if (iw) iw.close()
        })

        infoWindow.open(mapInstanceRef.current, marker)
        dispatch(setSelectedPharmacy(pharmacy))
      })

      markersRef.current.push({ marker, infoWindow })
    })

    // Adjust map bounds to fit all markers
    if (pharmacies.length > 0) {
      const bounds = new google.maps.LatLngBounds()
      pharmacies.forEach((pharmacy: Pharmacy) => {
        bounds.extend({
          lat: pharmacy.lat || 0,
          lng: pharmacy.lng || 0
        })
      })
      mapInstanceRef.current.fitBounds(bounds)
    }
  }

  const createInfoWindowContent = (pharmacy: Pharmacy): string => {
    const name = language === 'me' ? pharmacy.name_me : (pharmacy.name_en || pharmacy.name_me)
    const badges = []

    if (pharmacy.is_24h) {
      badges.push('<span class="bg-green-500 text-white px-2 py-1 text-xs rounded-full">24/7</span>')
    }
    if (pharmacy.open_sunday) {
      badges.push('<span class="bg-orange-500 text-white px-2 py-1 text-xs rounded-full">Nedjelja</span>')
    }

    return `
      <div class="p-3 max-w-xs">
        <h3 class="font-semibold text-gray-800 mb-2">${name}</h3>
        <p class="text-sm text-gray-600 mb-2">${pharmacy.address}</p>
        <div class="mb-2">${badges.join(' ')}</div>
        <div class="text-xs text-gray-500">
          <p><strong>Radno vrijeme:</strong> ${pharmacy.hours_monfri}</p>
          ${pharmacy.phone ? `<p><strong>Telefon:</strong> ${pharmacy.phone}</p>` : ''}
          ${pharmacy.website ? `<p><a href="${pharmacy.website}" target="_blank" class="text-blue-600 hover:underline">Web sajt</a></p>` : ''}
        </div>
      </div>
    `
  }

  useEffect(() => {
    // Add a small delay to ensure DOM is ready
    const initTimer = setTimeout(() => {
      if (mapRef.current && GOOGLE_MAPS_API_KEY) {
        initializeMap()
      }
    }, 100)

    return () => {
      clearTimeout(initTimer)
      markersRef.current.forEach(({ marker }: MarkerData) => {
        if (marker) marker.setMap(null)
      })
      markersRef.current = []
    }
  }, [])

  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMarkers()
    }
  }, [pharmacies, language])

  useEffect(() => {
    if (mapInstanceRef.current && selectedCity) {
      const center = getCenterCoordinates()
      mapInstanceRef.current.setCenter(center)
    }
  }, [selectedCity])

  // Focus on selected pharmacy
  useEffect(() => {
    if (selectedPharmacy && mapInstanceRef.current) {
      const position = {
        lat: selectedPharmacy.lat || 0,
        lng: selectedPharmacy.lng || 0
      }
      mapInstanceRef.current.setCenter(position)
      mapInstanceRef.current.setZoom(15)

      // Open the corresponding info window
      const markerData = markersRef.current.find(({ marker }: MarkerData) => {
        const markerPos = marker.getPosition()
        return Math.abs(markerPos.lat() - position.lat) < 0.0001 &&
               Math.abs(markerPos.lng() - position.lng) < 0.0001
      })

      if (markerData) {
        // Close other info windows
        markersRef.current.forEach(({ infoWindow }: MarkerData) => {
          if (infoWindow) infoWindow.close()
        })
        markerData.infoWindow.open(mapInstanceRef.current, markerData.marker)
      }
    }
  }, [selectedPharmacy])

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className={`w-full ${mapExpanded ? 'h-96 md:h-[500px]' : 'h-64 md:h-80'} bg-gray-100 transition-all duration-300 rounded-lg flex items-center justify-center`}>
        <div className="text-center text-text-secondary">
          <div className="text-4xl mb-2">🗺️</div>
          <p>Google Maps API key not configured</p>
          <p className="text-sm mt-1">Add VITE_GOOGLE_MAPS_API_KEY to .env</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={mapRef}
      className={`w-full ${mapExpanded ? 'h-96 md:h-[500px]' : 'h-64 md:h-80'} bg-gray-100 transition-all duration-300 rounded-lg`}
      style={{ minHeight: '200px' }}
    />
  )
}