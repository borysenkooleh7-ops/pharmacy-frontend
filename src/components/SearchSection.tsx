import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { updateFilters, searchMedicines, clearMedicines, setSearchType } from '../store/pharmacySlice'
import { useTranslation } from '../translations'
import LoadingSpinner from './ui/LoadingSpinner'
import { PharmacyIcon, MedicineIcon } from './ui/Icons'
import type { Medicine } from '@/types'

export default function SearchSection(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const { language } = useAppSelector(state => state.ui)
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

  return (
    <div className="bg-card shadow-lg border border-primary-light rounded-xl p-8 mb-8">
      <div className="max-w-2xl mx-auto">
        {/* Search Type Tabs */}
        <div className="flex mb-6 bg-background-secondary rounded-lg p-1 border border-border-light">
          <button
            onClick={() => handleSearchTypeChange('pharmacy')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 transform ${
              searchType === 'pharmacy'
                ? 'bg-primary text-white shadow-lg scale-105 ring-2 ring-primary ring-opacity-30'
                : 'text-text-secondary hover:text-white hover:bg-primary hover:shadow-lg hover:scale-105 active:scale-95 active:bg-primary-active'
            }`}
          >
            {t('searchPlaceholder').split(' ')[0]}
          </button>
          <button
            onClick={() => handleSearchTypeChange('medicine')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 transform ${
              searchType === 'medicine'
                ? 'bg-success text-white shadow-lg scale-105 ring-2 ring-success ring-opacity-30'
                : 'text-text-secondary hover:text-white hover:bg-success hover:shadow-lg hover:scale-105 active:scale-95 active:bg-success-hover'
            }`}
          >
            {t('medicineSearch')}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchType === 'pharmacy' ? filters.search : medicineSearchTerm}
            onChange={searchType === 'pharmacy' ? handleSearchChange : handleMedicineSearchChange}
            placeholder={searchType === 'pharmacy' ? t('searchPlaceholder') : t('medicineSearch')}
            className="w-full px-4 py-4 pl-12 text-lg bg-white border-2 border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-text-primary placeholder:text-text-tertiary shadow-sm focus:shadow-lg hover:border-primary"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            {searchType === 'pharmacy' ? (
              <PharmacyIcon className="w-5 h-5 text-primary" />
            ) : (
              <MedicineIcon className="w-5 h-5 text-success" />
            )}
          </div>
          {loading.medicines && searchType === 'medicine' && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>

        {/* Error Display */}
        {error.medicines && searchType === 'medicine' && (
          <div className="mt-4 p-4 bg-danger-light border border-danger rounded-lg">
            <p className="text-danger text-sm font-medium">
              Failed to search medicines. Please try again.
            </p>
          </div>
        )}

        {/* Medicine Search Results */}
        {searchType === 'medicine' && medicines.length > 0 && (
          <div className="mt-6 max-h-60 overflow-y-auto bg-background-secondary rounded-lg border border-primary-light shadow-md">
            {medicines.map((medicine: Medicine) => (
              <div
                key={medicine.id}
                className="p-4 hover:bg-card cursor-pointer border-b border-border-light last:border-b-0 transition-all duration-300 hover:shadow-md hover:bg-primary-lighter hover:border-l-4 hover:border-l-primary transform hover:scale-[1.01]"
              >
                <h4 className="font-medium text-text-primary">
                  {language === 'me' ? medicine.name_me : (medicine.name_en || medicine.name_me)}
                </h4>
                {medicine.description && (
                  <p className="text-sm text-text-secondary mt-1">{medicine.description}</p>
                )}
                {medicine.pharmacyMedicines && medicine.pharmacyMedicines.length > 0 && (
                  <p className="text-xs text-success mt-2 font-medium bg-success-light px-2 py-1 rounded-full inline-block">
                    Available at {medicine.pharmacyMedicines.length} pharmacies
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* No Results Message */}
        {searchType === 'medicine' && medicineSearchTerm.length > 2 && medicines.length === 0 && !loading.medicines && !error.medicines && (
          <div className="mt-4 p-4 bg-background-secondary border border-border-light rounded-lg text-center">
            <p className="text-text-secondary">No medicines found for "{medicineSearchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  )
}