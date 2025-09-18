import { updateFilters, clearFilters, fetchNearbyPharmacies } from '../store/pharmacySlice'
import { setUserLocation, setLoadingLocation } from '../store/uiSlice'
import { useTranslation } from '../translations'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import type { UserLocation } from '@/types'

export default function FilterSection(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const { language, userLocation, isLoadingLocation } = useAppSelector(state => state.ui)
  const { filters } = useAppSelector(state => state.pharmacy)
  const t = useTranslation(language)

  const handleFilterToggle = (filterKey: string): void => {
    if (filterKey === 'nearby') {
      handleNearbyFilter()
    } else {
      dispatch(updateFilters({ [filterKey]: !filters[filterKey] }))
    }
  }

  const handleNearbyFilter = () => {
    if (filters.nearby) {
      // Turn off nearby filter
      dispatch(updateFilters({ nearby: false }))
      return
    }

    if (userLocation) {
      // Use existing location
      dispatch(fetchNearbyPharmacies({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
        radius: 10
      }))
    } else {
      // Request geolocation
      dispatch(setLoadingLocation(true))

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location: UserLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
            dispatch(setUserLocation(location))
            dispatch(setLoadingLocation(false))
            dispatch(fetchNearbyPharmacies({
              lat: location.latitude,
              lng: location.longitude,
              radius: 10
            }))
          },
          (error) => {
            console.error('Geolocation error:', error)
            dispatch(setLoadingLocation(false))
            // Fallback to Podgorica center
            const defaultLocation = { latitude: 42.4415, longitude: 19.2621 }
            dispatch(setUserLocation(defaultLocation))
            dispatch(fetchNearbyPharmacies({
              lat: defaultLocation.latitude,
              lng: defaultLocation.longitude,
              radius: 10
            }))
          }
        )
      } else {
        dispatch(setLoadingLocation(false))
        alert('Geolocation is not supported by this browser.')
      }
    }
  }

  const handleClearFilters = () => {
    dispatch(clearFilters())
  }

  const activeFiltersCount = Object.values(filters).filter(value => value === true || (typeof value === 'string' && value.length > 0)).length

  return (
    <div className="bg-card shadow-lg border border-primary-light rounded-xl p-6 mb-6">
      <div className="flex flex-wrap gap-3 items-center">
        <button
          onClick={() => handleFilterToggle('is24h')}
          className={`px-5 py-3 rounded-lg border-2 font-medium transition-all duration-200 transform ${
            filters.is24h
              ? 'bg-success text-white border-success hover:bg-success-hover active:bg-success-dark shadow-md hover:scale-105 active:scale-95 ring-2 ring-success ring-opacity-30'
              : 'bg-white text-text-primary border-border-light hover:bg-success hover:text-white hover:border-success hover:shadow-lg shadow-sm hover:scale-105 active:scale-95'
          }`}
        >
          {t('filter24h')}
        </button>

        <button
          onClick={() => handleFilterToggle('openSunday')}
          className={`px-5 py-3 rounded-lg border-2 font-medium transition-all duration-200 transform ${
            filters.openSunday
              ? 'bg-warning text-white border-warning hover:bg-warning-hover active:bg-warning-dark shadow-md hover:scale-105 active:scale-95 ring-2 ring-warning ring-opacity-30'
              : 'bg-white text-text-primary border-border-light hover:bg-warning hover:text-white hover:border-warning hover:shadow-lg shadow-sm hover:scale-105 active:scale-95'
          }`}
        >
          {t('filterSunday')}
        </button>

        <button
          onClick={() => handleFilterToggle('nearby')}
          disabled={isLoadingLocation}
          className={`px-5 py-3 rounded-lg border-2 font-medium transition-all duration-200 transform flex items-center gap-2 ${
            filters.nearby
              ? 'bg-primary text-white border-primary hover:bg-primary-hover active:bg-primary-active shadow-md hover:scale-105 active:scale-95 ring-2 ring-primary ring-opacity-30'
              : 'bg-white text-text-primary border-border-light hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg shadow-sm hover:scale-105 active:scale-95'
          } ${isLoadingLocation ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoadingLocation && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          )}
          {t('filterNearby')}
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={handleClearFilters}
            className="px-5 py-3 rounded-lg border-2 border-danger text-danger hover:bg-danger hover:text-white active:bg-danger-dark transition-all duration-200 transform ml-2 font-medium shadow-sm hover:shadow-lg hover:scale-105 active:scale-95"
          >
            {t('clearFilters')} ({activeFiltersCount})
          </button>
        )}
      </div>
    </div>
  )
}