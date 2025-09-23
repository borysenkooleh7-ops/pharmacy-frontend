import { useEffect, useState } from 'react'
import { fetchPharmacies, initializeUserLocationAndPharmacies, clearFilters } from '../store/pharmacySlice'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import SearchAndFilterSection from '../components/SearchAndFilterSection'
import MapSection from '../components/MapSection'
import PharmacyList from '../components/PharmacyList'
import AdvertisingBanner from '../components/AdvertisingBanner'
import BenefitsSection from '../components/BenefitsSection'
import ErrorMessage from '../components/ui/ErrorMessage'
import { PageLoader } from '../components/ui/LoadingSpinner'


export default function HomePage(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const [isPharmacyListOpen, setIsPharmacyListOpen] = useState(false)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const { userLocation, isLoadingLocation } = useAppSelector(state => state.ui)
  const {
    selectedCity,
    filters,
    loading,
    error,
    pharmacies
  } = useAppSelector(state => state.pharmacy)

  // Initial rendering: Get user location and find N nearest pharmacies
  useEffect(() => {
    if (!userLocation && !initialLoadComplete && !isLoadingLocation) {
      dispatch(initializeUserLocationAndPharmacies())
      setInitialLoadComplete(true)
    }
  }, [dispatch, userLocation, initialLoadComplete, isLoadingLocation])

  // Handle city-based searches (fetch all pharmacies in selected city without limit)
  useEffect(() => {
    if (!initialLoadComplete) return

    if (selectedCity && !filters.nearby) {
      dispatch(fetchPharmacies({
        cityId: selectedCity.id,
        unlimited: true,
        ...filters
      }))
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