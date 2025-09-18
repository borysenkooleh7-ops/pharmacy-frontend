import { useEffect } from 'react'
import { fetchPharmacies } from '../store/pharmacySlice'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import MapSection from '../components/MapSection'
import PharmacyList from '../components/PharmacyList'
import AdvertisingBanner from '../components/AdvertisingBanner'
import BenefitsSection from '../components/BenefitsSection'
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
      <div className="container mx-auto px-4 py-6">
        {/* Error Message */}
        {error.pharmacies && (
          <ErrorMessage
            error={error.pharmacies}
            onRetry={handleRetryPharmacies}
            className="mb-6"
          />
        )}

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Ads and Pharmacy List */}
          <div className="lg:col-span-1 space-y-6">
            <AdvertisingBanner />
            <PharmacyList />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Map Section */}
            <MapSection />

            {/* Benefits/Promo Section */}
            <BenefitsSection />

            {/* No Results Message */}
            {!loading.pharmacies && !error.pharmacies && selectedCity && pharmacies.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  No pharmacies found
                </h3>
                <p className="text-text-secondary">
                  Try adjusting your search criteria or filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}