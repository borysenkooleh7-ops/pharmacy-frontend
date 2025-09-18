import { useEffect } from 'react'
import { fetchPharmacies, clearFilters } from '../store/pharmacySlice'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import SearchSection from '../components/SearchSection'
import FilterSection from '../components/FilterSection'
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
        ...filters
      }))
    }
  }, [dispatch, selectedCity, filters])

  const handleRetryPharmacies = (): void => {
    if (selectedCity) {
      dispatch(fetchPharmacies({
        cityId: selectedCity.id,
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

      {/* Search Section */}
      <SearchSection />

      {/* Filter Section */}
      <FilterSection />

      {/* Main Layout: Left sidebar + Main content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Fixed width */}
          <div className="w-80 flex-shrink-0">
            {/* Ad block at top */}
            <div className="mb-6">
              <AdvertisingBanner />
            </div>

            {/* Pharmacy list below ad */}
            <PharmacyList />
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Map Section */}
            <div className="mb-6">
              <MapSection />
            </div>

            {/* Benefits Section */}
            <div className="mb-6">
              <BenefitsSection />
            </div>

            {/* No Results Message */}
            {!loading.pharmacies && !error.pharmacies && selectedCity && pharmacies.length === 0 && (
              <div className="bg-card border border-gray-200 rounded-lg p-8 text-center mb-6">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  No pharmacies found
                </h3>
                <p className="text-text-secondary mb-6">
                  Try adjusting your search or filters.
                </p>
                <div className="flex gap-4 justify-center">
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

            {/* Pharmacy Submission Form */}
            <PharmacySubmissionForm />
          </div>
        </div>
      </div>
    </div>
  )
}