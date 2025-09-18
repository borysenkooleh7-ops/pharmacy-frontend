import { useEffect } from 'react'
import { fetchPharmacies, clearFilters } from '../store/pharmacySlice'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Error Message */}
        {error.pharmacies && (
          <ErrorMessage
            error={error.pharmacies}
            onRetry={handleRetryPharmacies}
            className="mb-8"
          />
        )}

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Advertisement Banner */}
            <div className="sticky top-4">
              <AdvertisingBanner />
            </div>

            {/* Pharmacy List */}
            <div className="hidden lg:block">
              <PharmacyList />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* Map Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <MapSection />
            </div>

            {/* Mobile Pharmacy List */}
            <div className="lg:hidden">
              <PharmacyList />
            </div>

            {/* No Results Message */}
            {!loading.pharmacies && !error.pharmacies && selectedCity && pharmacies.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl text-gray-400">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  No pharmacies found
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  We couldn't find any pharmacies matching your criteria. Try adjusting your search or filters.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => dispatch(clearFilters())}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={handleRetryPharmacies}
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                  >
                    Retry Search
                  </button>
                </div>
              </div>
            )}

            {/* Benefits Section */}
            <BenefitsSection />

            {/* Pharmacy Submission Form */}
            <PharmacySubmissionForm />
          </div>
        </div>
      </div>
    </div>
  )
}