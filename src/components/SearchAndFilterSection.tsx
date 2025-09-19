import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { updateFilters, clearFilters, fetchNearbyPharmacies, searchMedicines, clearMedicines, setSearchType } from '../store/pharmacySlice'
import { setUserLocation, setLoadingLocation } from '../store/uiSlice'
import { useTranslation } from '../translations'
import LoadingSpinner from './ui/LoadingSpinner'
import { PharmacyIcon, MedicineIcon } from './ui/Icons'
import type { Medicine, UserLocation } from '@/types'

export default function SearchAndFilterSection(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const { language, userLocation, isLoadingLocation } = useAppSelector(state => state.ui)
  const {
    searchType,
    filters,
    medicines,
    loading,
    error
  } = useAppSelector(state => state.pharmacy)
  const [medicineSearchTerm, setMedicineSearchTerm] = useState('')
  const t = useTranslation(language)

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(updateFilters({ search: event.target.value }))
  }

  const handleMedicineSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value
    setMedicineSearchTerm(value)

    if (value.length > 2) {
      dispatch(searchMedicines(value))
    } else {
      dispatch(clearMedicines())
    }
  }

  const handleSearchTypeChange = (type: 'pharmacy' | 'medicine'): void => {
    dispatch(setSearchType(type))
    if (type === 'pharmacy') {
      setMedicineSearchTerm('')
    }
  }

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

  return (
    <div className="bg-card shadow-md border border-primary-light rounded-lg p-2 mb-2">
      <div className="max-w-full mx-auto">
        {/* Single Line Layout */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Type Tabs - Compact */}
          <div className="flex bg-background-secondary rounded-md p-0.5 border border-border-light">
            <button
              onClick={() => handleSearchTypeChange('pharmacy')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 ${
                searchType === 'pharmacy'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-white hover:bg-primary'
              }`}
            >
              {t('searchPlaceholder').split(' ')[0]}
            </button>
            <button
              onClick={() => handleSearchTypeChange('medicine')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 ${
                searchType === 'medicine'
                  ? 'bg-success text-white shadow-sm'
                  : 'text-text-secondary hover:text-white hover:bg-success'
              }`}
            >
              {t('medicineSearch')}
            </button>
          </div>

          {/* Search Input - Compact */}
          <div className="relative flex-1 min-w-64">
            <input
              type="text"
              value={searchType === 'pharmacy' ? filters.search : medicineSearchTerm}
              onChange={searchType === 'pharmacy' ? handleSearchChange : handleMedicineSearchChange}
              placeholder={searchType === 'pharmacy' ? t('searchPlaceholder') : t('medicineSearch')}
              className="w-full px-3 py-2 pl-8 text-sm bg-white border border-border-light rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200 text-text-primary placeholder:text-text-tertiary shadow-sm hover:border-primary"
            />
            <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2">
              {searchType === 'pharmacy' ? (
                <PharmacyIcon className="w-3.5 h-3.5 text-primary" />
              ) : (
                <MedicineIcon className="w-3.5 h-3.5 text-success" />
              )}
            </div>
            {loading.medicines && searchType === 'medicine' && (
              <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2">
                <LoadingSpinner size="sm" />
              </div>
            )}
          </div>

          {/* Filters - Compact */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleFilterToggle('is24h')}
              className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all duration-200 ${
                filters.is24h
                  ? 'bg-success text-white border-success hover:bg-success-hover shadow-sm'
                  : 'bg-white text-text-primary border-border-light hover:bg-success hover:text-white hover:border-success'
              }`}
            >
              {t('filter24h')}
            </button>

            <button
              onClick={() => handleFilterToggle('openSunday')}
              className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all duration-200 ${
                filters.openSunday
                  ? 'bg-warning text-white border-warning hover:bg-warning-hover shadow-sm'
                  : 'bg-white text-text-primary border-border-light hover:bg-warning hover:text-white hover:border-warning'
              }`}
            >
              {t('filterSunday')}
            </button>

            <button
              onClick={() => handleFilterToggle('nearby')}
              disabled={isLoadingLocation}
              className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                filters.nearby
                  ? 'bg-primary text-white border-primary hover:bg-primary-hover shadow-sm'
                  : 'bg-white text-text-primary border-border-light hover:bg-primary hover:text-white hover:border-primary'
              } ${isLoadingLocation ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoadingLocation && (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
              )}
              {t('filterNearby')}
            </button>

              <button
                onClick={handleClearFilters}
                className="px-3 py-1.5 rounded-md border border-danger text-danger hover:bg-danger hover:text-white transition-all duration-200 text-xs font-medium shadow-sm"
              >
                {t('clearFilters')}
              </button>
          </div>
        </div>

        {/* Error Display - Compact */}
        {error.medicines && searchType === 'medicine' && (
          <div className="mt-3 p-2 bg-danger-light border border-danger rounded-md">
            <p className="text-danger text-xs font-medium">
              Failed to search medicines. Please try again.
            </p>
          </div>
        )}

        {/* Medicine Search Results - Compact */}
        {searchType === 'medicine' && medicines.length > 0 && (
          <div className="mt-3 max-h-32 overflow-y-auto bg-background-secondary rounded-md border border-primary-light shadow-sm">
            {medicines.map((medicine: Medicine) => (
              <div
                key={medicine.id}
                className="p-2 hover:bg-card cursor-pointer border-b border-border-light last:border-b-0 transition-all duration-200 hover:bg-primary-lighter"
              >
                <h4 className="text-sm font-medium text-text-primary">
                  {language === 'me' ? medicine.name_me : (medicine.name_en || medicine.name_me)}
                </h4>
                {medicine.pharmacyMedicines && medicine.pharmacyMedicines.length > 0 && (
                  <p className="text-xs text-success mt-1 font-medium">
                    Available at {medicine.pharmacyMedicines.length} pharmacies
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* No Results Message - Compact */}
        {searchType === 'medicine' && medicineSearchTerm.length > 2 && medicines.length === 0 && !loading.medicines && !error.medicines && (
          <div className="mt-3 p-2 bg-background-secondary border border-border-light rounded-md text-center">
            <p className="text-text-secondary text-xs">No medicines found for "{medicineSearchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  )
}