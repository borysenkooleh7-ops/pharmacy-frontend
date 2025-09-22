import { useEffect } from 'react'
import { fetchPharmacies, clearFilters } from '../store/pharmacySlice'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import SearchAndFilterSection from '../components/SearchAndFilterSection'
import MapSection from '../components/MapSection'
import PharmacyList from '../components/PharmacyList'
import AdvertisingBanner from '../components/AdvertisingBanner'
import BenefitsSection from '../components/BenefitsSection'
import PharmacySubmissionForm from '../components/PharmacySubmissionForm'
import ErrorMessage from '../components/ui/ErrorMessage'
import { PageLoader } from '../components/ui/LoadingSpinner'

export default function HomePage(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const {
    selectedCity,
    filters,
    loading,
    error,
    pharmacies
  } = useAppSelector(state => state.pharmacy)

  // Fetch pharmacies when city or filters change
  useEffect(() => {
    if (selectedCity) {
      dispatch(fetchPharmacies({
        cityId: selectedCity.id,
        unlimited: true, // Fetch all pharmacies for map display
        ...filters
      }))
    }
  }, [dispatch, selectedCity, filters])

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
    <div className="min-h-screen bg-background">
      {/* Error Message */}
      {error.pharmacies && (
        <ErrorMessage
          error={error.pharmacies}
          onRetry={handleRetryPharmacies}
          className="mb-6"
        />
      )}

      {/* Search and Filter Section */}
      <div className="container mx-auto">
        <SearchAndFilterSection />
      </div>

      {/* Main Layout: Left sidebar + Main content */}
      <div className="container mx-auto">
        <div className="flex gap-2">
          {/* Left Sidebar - Fixed width */}
          <div className="w-[400px] flex-shrink-0">
            {/* Ad block at top - No bottom margin */}
            <div className="mb-2">
              <AdvertisingBanner />
            </div>

            {/* Pharmacy list below ad */}
            <PharmacyList />
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Map Section - No bottom margin */}
              <MapSection />

            {/* Benefits Section - No bottom margin */}
            <div className="mb-2">
              <BenefitsSection />
            </div>

            {/* No Results Message */}
            {!loading.pharmacies && !error.pharmacies && selectedCity && pharmacies.length === 0 && (
              <div className="bg-card border border-primary-light rounded-lg p-6 text-center mb-2">
                <div className="text-3xl mb-3">🔍</div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  No pharmacies found
                </h3>
                <p className="text-text-secondary mb-4">
                  Try adjusting your search or filters.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => dispatch(clearFilters())}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover active:bg-primary-active transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={handleRetryPharmacies}
                    className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary-lighter active:bg-primary-light transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-md"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}