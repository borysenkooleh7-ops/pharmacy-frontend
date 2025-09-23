import { useEffect, useState } from 'react'
import { fetchPharmacies, clearFilters, setSelectedCity, setPharmacies } from '../store/pharmacySlice'
import { setUserLocation, setLoadingLocation } from '../store/uiSlice'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import SearchAndFilterSection from '../components/SearchAndFilterSection'
import MapSection from '../components/MapSection'
import PharmacyList from '../components/PharmacyList'
import AdvertisingBanner from '../components/AdvertisingBanner'
import BenefitsSection from '../components/BenefitsSection'
import ErrorMessage from '../components/ui/ErrorMessage'
import { PageLoader } from '../components/ui/LoadingSpinner'
import type { UserLocation } from '../store/slices/types'

// Calculate optimal search radius based on user's geographic location
const calculateOptimalRadius = (location: UserLocation): number => {
  const { latitude, longitude } = location

  // Montenegro approximate bounds
  const montenegroBounds = {
    north: 43.57,
    south: 41.85,
    east: 20.35,
    west: 18.43
  }

  // Check if user is in Montenegro region
  const isInMontenegro =
    latitude >= montenegroBounds.south &&
    latitude <= montenegroBounds.north &&
    longitude >= montenegroBounds.west &&
    longitude <= montenegroBounds.east

  if (isInMontenegro) {
    console.log('📍 User appears to be in Montenegro - using local search radius')
    return 10 // Small radius for local users
  }

  // For international users, calculate distance to Montenegro and use adaptive radius
  const podgoricaLat = 42.4415
  const podgoricaLng = 19.2621

  const distanceToMontenegro = calculateDistance(
    latitude, longitude,
    podgoricaLat, podgoricaLng
  )

  console.log(`🌍 User is ~${Math.round(distanceToMontenegro)}km from Montenegro`)

  // Adaptive radius based on distance
  if (distanceToMontenegro < 100) return 50        // Regional users
  if (distanceToMontenegro < 500) return 100       // European users
  if (distanceToMontenegro < 2000) return 200      // Continental users
  return 500 // Global users - very wide search
}

// Haversine distance calculation
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export default function HomePage(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const [isPharmacyListOpen, setIsPharmacyListOpen] = useState(false)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const { userLocation } = useAppSelector(state => state.ui)
  const {
    selectedCity,
    filters,
    loading,
    error,
    pharmacies
  } = useAppSelector(state => state.pharmacy)

  // PRIORITY 1: Get REAL user GPS location first, fallback only if needed
  useEffect(() => {
    let isMounted = true

    const initializeUserPosition = async () => {
      if (userLocation || initialLoadComplete) return

      dispatch(setLoadingLocation(true))
      dispatch(setSelectedCity(null)) // Clear any selected city for location-based search

      // CONSOLE-ONLY LOCATION AND PHARMACY FINDER
      if (isMounted) {
        console.log('🔍 FINDING YOUR LOCATION AND PHARMACIES (CONSOLE ONLY)...')
        console.log('==========================================')

        // Step 1: Find your location
        const findMyLocation = async () => {
          console.log('📍 Step 1: Finding your location...')

          // Try IP location first (more reliable)
          try {
            const ipResponse = await fetch('https://ipapi.co/json/')
            const ipData = await ipResponse.json()

            console.log('✅ YOUR LOCATION FOUND VIA IP:')
            console.log('   📍 Latitude:', ipData.latitude)
            console.log('   📍 Longitude:', ipData.longitude)
            console.log('   🏙️ City:', ipData.city)
            console.log('   🌍 Country:', ipData.country_name)
            console.log('   📡 ISP:', ipData.org)

            return {
              latitude: ipData.latitude,
              longitude: ipData.longitude,
              city: ipData.city,
              country: ipData.country_name
            }
          } catch (error) {
            console.error('❌ IP location failed:', error)
            return null
          }
        }

        // Step 2: Find pharmacies
        const findNearbyPharmacies = async (location: any) => {
          console.log('\n🏥 Step 2: Finding nearest 20 pharmacies...')

          try {
            // Calculate distance to Montenegro
            const podgoricaLat = 42.4415
            const podgoricaLng = 19.2621
            const R = 6371
            const dLat = (podgoricaLat - location.latitude) * Math.PI / 180
            const dLng = (podgoricaLng - location.longitude) * Math.PI / 180
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                     Math.cos(location.latitude * Math.PI / 180) * Math.cos(podgoricaLat * Math.PI / 180) *
                     Math.sin(dLng/2) * Math.sin(dLng/2)
            const distanceToMontenegro = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

            console.log(`   🎯 Distance to Montenegro: ${Math.round(distanceToMontenegro)}km`)

            // Use search radius from environment variable
            const searchRadius = parseInt(import.meta.env.VITE_SEARCH_RADIUS) || 2000

            console.log(`   🔍 Using search radius: ${searchRadius}km`)

            // Make API call to backend
            const apiUrl = `http://localhost:5000/api/pharmacies/nearby/${location.latitude}/${location.longitude}?radius=${searchRadius}&limit=20`
            console.log(`   📞 API Call: ${apiUrl}`)

            const response = await fetch(apiUrl)
            const data = await response.json()

            console.log('\n✅ PHARMACY SEARCH RESULTS:')
            console.log('==========================================')

            if (data.success && data.data && data.data.length > 0) {
              console.log(`   📊 Found ${data.data.length} pharmacies`)

              data.data.forEach((pharmacy: any, index: number) => {
                // Calculate distance from your location to this pharmacy
                const dLat2 = (pharmacy.lat - location.latitude) * Math.PI / 180
                const dLng2 = (pharmacy.lng - location.longitude) * Math.PI / 180
                const a2 = Math.sin(dLat2/2) * Math.sin(dLat2/2) +
                          Math.cos(location.latitude * Math.PI / 180) * Math.cos(pharmacy.lat * Math.PI / 180) *
                          Math.sin(dLng2/2) * Math.sin(dLng2/2)
                const distance = R * 2 * Math.atan2(Math.sqrt(a2), Math.sqrt(1-a2))

                console.log(`\n   ${index + 1}. ${pharmacy.name_me || pharmacy.name}`)
                console.log(`      📍 Distance: ${distance.toFixed(1)}km from you`)
                console.log(`      📍 Location: ${pharmacy.lat}, ${pharmacy.lng}`)
                console.log(`      📍 Address: ${pharmacy.address}`)
                console.log(`      ⏰ Hours: ${pharmacy.hours_monfri || 'Not specified'}`)
                if (pharmacy.is_24h) console.log(`      🌙 24/7 Open`)
                if (pharmacy.open_sunday) console.log(`      📅 Open Sunday`)
                if (pharmacy.phone) console.log(`      📞 Phone: ${pharmacy.phone}`)
              })

              // Show summary
              console.log('\n📊 SUMMARY:')
              console.log(`   Total pharmacies found: ${data.data.length}`)
              const nearest = data.data[0]
              if (nearest) {
                const nearestDistance = Math.sqrt(
                  Math.pow(nearest.lat - location.latitude, 2) +
                  Math.pow(nearest.lng - location.longitude, 2)
                ) * 111 // Rough km conversion
                console.log(`   Nearest pharmacy: ${nearest.name_me} (~${nearestDistance.toFixed(1)}km)`)
              }

              // Set location for map display
              dispatch(setUserLocation({
                latitude: location.latitude,
                longitude: location.longitude
              }))

              // Also dispatch the pharmacies to Redux store so they appear on map/list
              console.log('\n🔄 Adding pharmacies to map and list...')
              console.log(`   🔄 Setting ${data.data.length} pharmacies in Redux store`)
              dispatch(setPharmacies(data.data))

              console.log('\n✅ SUCCESS: Check the Google Map to see your location and pharmacies!')

            } else {
              console.log('   ❌ No pharmacies found in this radius')
              console.log('   💡 This is normal if you are far from Montenegro')
            }

          } catch (error) {
            console.error('❌ Pharmacy search failed:', error)
          }
        }

        // Execute the search
        const location = await findMyLocation()
        if (location) {
          await findNearbyPharmacies(location)
        } else {
          console.log('❌ Could not determine your location')
        }

        console.log('\n==========================================')
        console.log('🎯 LOCATION AND PHARMACY SEARCH COMPLETE')
      }

      if (isMounted) {
        dispatch(setLoadingLocation(false))
        setInitialLoadComplete(true)
      }
    }

    initializeUserPosition()

    return () => {
      isMounted = false
    }
  }, [dispatch, userLocation, initialLoadComplete])

  // PRIORITY 2: Handle city-based searches (only after initial position is set)
  useEffect(() => {
    if (!initialLoadComplete) return

    if (selectedCity && !filters.nearby) {
      dispatch(fetchPharmacies({
        cityId: selectedCity.id,
        unlimited: true,
        ...filters
      }))
      // Close pharmacy list slider when city changes
      setIsPharmacyListOpen(false)
    }
  }, [dispatch, selectedCity, filters, initialLoadComplete])

  const handleRetryPharmacies = (): void => {
    if (selectedCity) {
      dispatch(fetchPharmacies({
        cityId: selectedCity.id,
        unlimited: true, // Fetch all pharmacies for map display
        ...filters
      }))
    }
  }

  // Show loader while cities are loading initially
  if (loading.cities && !selectedCity) {
    return <PageLoader />
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Error Message */}
      {error.pharmacies && (
        <ErrorMessage
          error={error.pharmacies}
          onRetry={handleRetryPharmacies}
          className="mb-4 mx-4 lg:mb-6 lg:mx-0"
        />
      )}

      {/* International User Guidance */}
      {initialLoadComplete && !userLocation && !selectedCity && (
        <div className="container mx-auto px-4 mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Welcome! 📍
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    This app shows pharmacies in Montenegro. You can:
                  </p>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>Click <strong>"📍 Nearby Pharmacies"</strong> to use your location and find nearby pharmacies (works anywhere in the world)</li>
                    <li>Select a city from the dropdown to see pharmacies in that Montenegro city</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="container mx-auto px-4">
        <SearchAndFilterSection />
      </div>

      {/* Mobile Pharmacy List Toggle Button */}
      <div className="lg:hidden fixed top-20 left-4 z-50">
        <button
          onClick={() => setIsPharmacyListOpen(true)}
          className="bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary-hover transition-colors"
          aria-label="Open pharmacy list"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Left Slide Menu Overlay */}
      {isPharmacyListOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-white bg-opacity-30 backdrop-blur-sm z-40"
          onClick={() => setIsPharmacyListOpen(false)}
        />
      )}

      {/* Mobile Left Slide Menu */}
      <div className={`lg:hidden fixed top-0 left-0 h-full w-80 bg-background shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isPharmacyListOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-text-primary">Pharmacies</h3>
            <button
              onClick={() => setIsPharmacyListOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
          <PharmacyList onPharmacySelect={() => setIsPharmacyListOpen(false)} />
      </div>

      {/* Main Layout */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Desktop Left Sidebar */}
          <div className="hidden lg:block w-[400px] flex-shrink-0">
            {/* Ad block at top */}
            <div className="mb-4">
              <AdvertisingBanner />
            </div>

            {/* Pharmacy list below ad */}
            <PharmacyList />
          </div>

          {/* Main Content Area */}
          <div className="w-full lg:flex-1">
            {/* Map Section */}
            <div className="mb-4">
              <MapSection />
            </div>

            {/* No Results Message */}
            {!loading.pharmacies && !error.pharmacies && selectedCity && pharmacies.length === 0 && (
              <div className="bg-card border border-primary-light rounded-lg p-4 lg:p-6 text-center mb-4">
                <div className="text-2xl lg:text-3xl mb-3">🔍</div>
                <h3 className="text-base lg:text-lg font-semibold text-text-primary mb-2">
                  No pharmacies found
                </h3>
                <p className="text-sm lg:text-base text-text-secondary mb-4">
                  Try adjusting your search or filters.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => dispatch(clearFilters())}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover active:bg-primary-active transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg text-sm lg:text-base"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={handleRetryPharmacies}
                    className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary-lighter active:bg-primary-light transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-md text-sm lg:text-base"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Promotion Sections - Desktop only, same width as map */}
            <div className="hidden lg:block">
              {/* Benefits Section */}
              <div className="mb-4">
                <BenefitsSection />
              </div>

              {/* Advertising Banner - Not shown here on desktop as it's in sidebar */}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-only Promotion Sections - Always at bottom */}
      <div className="lg:hidden container mx-auto px-4 mt-8">
        {/* Benefits Section */}
        <div className="mb-6">
          <BenefitsSection />
        </div>

        {/* Advertising Banner - Always last on mobile */}
        <div className="mb-6">
          <AdvertisingBanner />
        </div>
      </div>
    </div>
  )
}