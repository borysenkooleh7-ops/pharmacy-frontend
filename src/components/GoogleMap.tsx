import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { Loader } from '@googlemaps/js-api-loader'
import { setSelectedPharmacy } from '../store/pharmacySlice'
import { deletePharmacy, fetchPharmacies } from '../store/slices/pharmaciesSlice'
import { API_CONFIG } from '../config/api'
import type { Pharmacy } from '../store/slices/types'

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
  const { language } = useAppSelector(state => state.ui)

  // Check if user is admin by looking for admin key in sessionStorage
  const isAdmin = (): boolean => {
    try {
      const adminKey = sessionStorage.getItem('adminKey')
      return adminKey === API_CONFIG.ADMIN_KEY
    } catch {
      return false
    }
  }

  // Handle pharmacy deletion for admin users
  const handleDeletePharmacy = async (pharmacyId: number): Promise<void> => {
    console.log('Delete button clicked for pharmacy ID:', pharmacyId)
    console.log('Is admin:', isAdmin())

    if (!isAdmin()) {
      alert('Not authorized. Please login as admin first.')
      return
    }

    if (window.confirm(`Are you sure you want to delete pharmacy with ID ${pharmacyId}?`)) {
      try {
        console.log('Attempting to delete pharmacy...')
        await dispatch(deletePharmacy(pharmacyId)).unwrap()
        console.log('Pharmacy deleted successfully')
        alert('Pharmacy deleted successfully')
        // Refresh pharmacy list for current city
        if (selectedCity) {
          window.location.reload() // Simple refresh to update the map
        }
      } catch (error: any) {
        console.error('Delete failed:', error)
        alert(`Failed to delete pharmacy: ${error.message || 'Unknown error'}`)
      }
    }
  }

  // Default coordinates for Podgorica
  const defaultCenter = { lat: 42.4415, lng: 19.2621 }

  const getCenterCoordinates = (): { lat: number; lng: number } => {
    if (selectedCity) {
      // Use first pharmacy in selected city with valid coordinates as center
      const cityPharmacies = pharmacies.filter(p => {
        if (!p.city_id || p.city_id !== selectedCity.id || !p.lat || !p.lng) {
          return false
        }
        const lat = Number(p.lat)
        const lng = Number(p.lng)
        return !isNaN(lat) && !isNaN(lng)
      })
      if (cityPharmacies.length > 0) {
        return {
          lat: Number(cityPharmacies[0].lat),
          lng: Number(cityPharmacies[0].lng)
        }
      }
    }
    return defaultCenter
  }

  const initializeMap = async (): Promise<void> => {
    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['maps', 'marker', 'streetView']
    })

    try {
      await loader.load()

      const center = getCenterCoordinates()

      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center,
        zoom: 18,
        mapId: 'DEMO_MAP_ID',
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: google.maps.ControlPosition.TOP_CENTER,
          mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain']
        },
        streetViewControl: true,
        streetViewControlOptions: {
          position: google.maps.ControlPosition.RIGHT_TOP
        },
        fullscreenControl: true,
        zoomControl: true,
        rotateControl: true,
        rotateControlOptions: {
          position: google.maps.ControlPosition.LEFT_CENTER
        },
        tilt: 45,
        heading: 0,
        gestureHandling: 'greedy',
        clickableIcons: true,
        isFractionalZoomEnabled: true
      })

      // Enable 45° imagery for satellite and hybrid map types (post-deprecation)
      mapInstanceRef.current.addListener('maptypeid_changed', () => {
        const mapType = mapInstanceRef.current.getMapTypeId()
        if (mapType === 'satellite' || mapType === 'hybrid') {
          mapInstanceRef.current.setTilt(45)
        }
      })

      // Update markers after map is initialized, even if pharmacies array is currently empty
      updateMarkers()
    } catch (error) {
      console.error('Error loading Google Maps:', error)
    }
  }

  const updateMarkers = (): void => {
    if (!mapInstanceRef.current) return

    // Clear existing markers
    markersRef.current.forEach(markerData => markerData.marker.map = null)
    markersRef.current = []

    // Create new markers
    pharmacies.forEach((pharmacy: Pharmacy) => {
      // Skip pharmacies without valid coordinates
      if (!pharmacy.lat || !pharmacy.lng) {
        return
      }

      // Convert to numbers and validate
      const lat = Number(pharmacy.lat)
      const lng = Number(pharmacy.lng)

      if (isNaN(lat) || isNaN(lng)) {
        return
      }

      const position = {
        lat,
        lng
      }

      // Determine marker color based on pharmacy type - using even darker, more distinctive colors
      let markerColor = '#0f379a' // very dark blue-black for default
      let borderColor = '#ffffff'
      let iconColor = '#ffffff'

      if (pharmacy.is_24h) {
        markerColor = '#027d12' // very dark green for 24/7
      } else if (pharmacy.open_sunday) {
        markerColor = '#d51a03' // very dark brown-orange for Sunday open
      }

      // Create container for pulsing effect
      const markerContainer = document.createElement('div')
      markerContainer.style.position = 'relative'
      markerContainer.style.width = '30px'
      markerContainer.style.height = '30px'
      markerContainer.style.display = 'flex'
      markerContainer.style.alignItems = 'center'
      markerContainer.style.justifyContent = 'center'
      markerContainer.style.cursor = 'pointer'

      // Add CSS animation styles to the document if not already added
      if (!document.getElementById('pharmacy-marker-styles')) {
        const styleSheet = document.createElement('style')
        styleSheet.id = 'pharmacy-marker-styles'
        styleSheet.innerHTML = `
          @keyframes pulse-ring {
            0% {
              transform: scale(0.3);
              opacity: 1;
            }
            40% {
              transform: scale(0.7);
              opacity: 0.6;
            }
            100% {
              transform: scale(1);
              opacity: 0;
            }
          }
          @keyframes marker-bounce {
            0%, 100% {
              transform: rotate(45deg) scale(1) translateY(0);
            }
            25% {
              transform: rotate(45deg) scale(1.3) translateY(-2px);
            }
            50% {
              transform: rotate(45deg) scale(1.1) translateY(0);
            }
            75% {
              transform: rotate(45deg) scale(1.25) translateY(-1px);
            }
          }
          @keyframes marker-glow {
            0%, 100% {
              box-shadow: 0 0 10px rgba(255,255,255,0.8), 0 0 20px currentColor, 0 0 30px currentColor;
            }
            50% {
              box-shadow: 0 0 20px rgba(255,255,255,1), 0 0 40px currentColor, 0 0 50px currentColor;
            }
          }
        `
        document.head.appendChild(styleSheet)
      }

      // Create pulsing ring
      const pulseRing = document.createElement('div')
      pulseRing.style.position = 'absolute'
      pulseRing.style.width = '15px'
      pulseRing.style.height = '15px'
      pulseRing.style.backgroundColor = markerColor
      pulseRing.style.opacity = '0.7'
      pulseRing.style.borderRadius = '50%'
      pulseRing.style.animation = 'pulse-ring 1.5s infinite ease-out'
      pulseRing.style.border = `2px solid ${markerColor}`
      markerContainer.appendChild(pulseRing)

      // Create second pulsing ring with delay
      const pulseRing2 = document.createElement('div')
      pulseRing2.style.position = 'absolute'
      pulseRing2.style.width = '15px'
      pulseRing2.style.height = '15px'
      pulseRing2.style.backgroundColor = markerColor
      pulseRing2.style.opacity = '0.7'
      pulseRing2.style.borderRadius = '50%'
      pulseRing2.style.animation = 'pulse-ring 1.5s infinite ease-out'
      pulseRing2.style.animationDelay = '0.5s'
      pulseRing2.style.border = `2px solid ${markerColor}`
      markerContainer.appendChild(pulseRing2)

      // Create third pulsing ring for more activity
      const pulseRing3 = document.createElement('div')
      pulseRing3.style.position = 'absolute'
      pulseRing3.style.width = '15px'
      pulseRing3.style.height = '15px'
      pulseRing3.style.backgroundColor = markerColor
      pulseRing3.style.opacity = '0.7'
      pulseRing3.style.borderRadius = '50%'
      pulseRing3.style.animation = 'pulse-ring 1.5s infinite ease-out'
      pulseRing3.style.animationDelay = '1s'
      pulseRing3.style.border = `2px solid ${markerColor}`
      markerContainer.appendChild(pulseRing3)

      // Create marker element with pharmacy cross shape
      const markerElement = document.createElement('div')
      markerElement.style.width = '14px'
      markerElement.style.height = '14px'
      markerElement.style.backgroundColor = markerColor
      markerElement.style.border = `2px solid ${borderColor}`
      markerElement.style.position = 'absolute'
      markerElement.style.borderRadius = '3px'
      markerElement.style.transform = 'rotate(45deg)'
      markerElement.style.zIndex = '2'
      markerElement.style.animation = 'marker-bounce 1.2s infinite ease-in-out, marker-glow 2s infinite ease-in-out'
      markerElement.style.filter = `drop-shadow(0 0 5px ${markerColor}) drop-shadow(0 0 10px ${markerColor})`

      // Add pharmacy cross icon
      const crossIcon = document.createElement('div')
      crossIcon.innerHTML = '+'
      crossIcon.style.color = iconColor
      crossIcon.style.fontSize = '10px'
      crossIcon.style.fontWeight = '900'
      crossIcon.style.position = 'absolute'
      crossIcon.style.top = '50%'
      crossIcon.style.left = '50%'
      crossIcon.style.transform = 'translate(-50%, -50%) rotate(-45deg)'
      crossIcon.style.lineHeight = '1'
      crossIcon.style.textShadow = `0 0 5px rgba(255,255,255,0.8), 0 0 10px rgba(255,255,255,0.6)`
      markerElement.appendChild(crossIcon)

      markerContainer.appendChild(markerElement)

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position,
        map: mapInstanceRef.current,
        title: language === 'me' ? pharmacy.name_me : (pharmacy.name_en || pharmacy.name_me),
        content: markerContainer
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

        infoWindow.open({
          map: mapInstanceRef.current,
          anchor: marker
        })

        // Add event listener for delete button after info window opens
        setTimeout(() => {
          const deleteButton = document.getElementById(`delete-pharmacy-${pharmacy.id}`)
          console.log('Looking for delete button with ID:', `delete-pharmacy-${pharmacy.id}`)
          console.log('Delete button found:', !!deleteButton)
          console.log('Is admin check:', isAdmin())

          if (deleteButton && isAdmin()) {
            console.log('Adding click event listener to delete button')
            deleteButton.addEventListener('click', (e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('Delete button clicked')
              handleDeletePharmacy(pharmacy.id)
            })
          } else if (deleteButton && !isAdmin()) {
            console.log('Delete button found but user is not admin')
          } else if (!deleteButton) {
            console.log('Delete button not found in DOM')
          }
        }, 100)

        dispatch(setSelectedPharmacy(pharmacy))
      })

      markersRef.current.push({ marker, infoWindow })
    })

    // Adjust map bounds to fit all markers with valid coordinates
    const validPharmacies = pharmacies.filter(pharmacy => {
      if (!pharmacy.lat || !pharmacy.lng) return false
      const lat = Number(pharmacy.lat)
      const lng = Number(pharmacy.lng)
      return !isNaN(lat) && !isNaN(lng)
    })

    if (validPharmacies.length > 0) {
      const bounds = new google.maps.LatLngBounds()
      validPharmacies.forEach((pharmacy: Pharmacy) => {
        bounds.extend({
          lat: Number(pharmacy.lat),
          lng: Number(pharmacy.lng)
        })
      })
      mapInstanceRef.current.fitBounds(bounds)

      // Restore tilt after fitBounds() - fitBounds resets tilt to 0
      setTimeout(() => {
        const currentMapType = mapInstanceRef.current.getMapTypeId()
        if (currentMapType === 'satellite' || currentMapType === 'hybrid') {
          mapInstanceRef.current.setTilt(45)
        }
      }, 100)
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

    const adminDeleteButton = isAdmin() ?
      `<button
         id="delete-pharmacy-${pharmacy.id}"
         class="mt-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs rounded-md transition-colors duration-200"
         style="cursor: pointer;">
         🗑️ Delete
       </button>` : ''

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
        ${adminDeleteButton}
      </div>
    `
  }

  useEffect(() => {
    // Add a small delay to ensure DOM is ready and wait for selected city
    const initTimer = setTimeout(() => {
      if (mapRef.current && GOOGLE_MAPS_API_KEY && selectedCity) {
        initializeMap()
      }
    }, 100)

    return () => {
      clearTimeout(initTimer)
      markersRef.current.forEach(({ marker }: MarkerData) => {
        if (marker) marker.map = null
      })
      markersRef.current = []
    }
  }, [selectedCity, pharmacies])

  useEffect(() => {
    if (mapInstanceRef.current) {
      // Always update markers when pharmacies data changes, even if empty
      updateMarkers()
    }
  }, [pharmacies, language])

  // Additional effect to handle the case where map initializes before pharmacy data loads
  useEffect(() => {
    if (mapInstanceRef.current && pharmacies.length > 0) {
      // Update markers when pharmacies become available after map initialization
      updateMarkers()
    }
  }, [pharmacies.length])

  useEffect(() => {
    if (mapInstanceRef.current && selectedCity) {
      const center = getCenterCoordinates()
      mapInstanceRef.current.setCenter(center)

      // Preserve tilt when changing city
      setTimeout(() => {
        const currentMapType = mapInstanceRef.current.getMapTypeId()
        if (currentMapType === 'satellite' || currentMapType === 'hybrid') {
          mapInstanceRef.current.setTilt(45)
        }
      }, 100)
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

      // Preserve tilt when focusing on pharmacy
      setTimeout(() => {
        const currentMapType = mapInstanceRef.current.getMapTypeId()
        if (currentMapType === 'satellite' || currentMapType === 'hybrid') {
          mapInstanceRef.current.setTilt(45)
        }
      }, 100)

      // Open the corresponding info window
      const markerData = markersRef.current.find(({ marker }: MarkerData) => {
        const markerPos = marker.position
        return Math.abs(markerPos.lat - position.lat) < 0.0001 &&
               Math.abs(markerPos.lng - position.lng) < 0.0001
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
      <div className="w-full h-[700px] bg-gray-100 transition-all duration-300 rounded-lg flex items-center justify-center">
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
      className="w-full h-[700px] bg-gray-100 transition-all duration-300 rounded-lg"
    />
  )
}