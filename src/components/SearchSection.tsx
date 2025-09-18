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
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="max-w-2xl mx-auto">
        {/* Search Type Tabs */}
        <div className="flex mb-4 bg-background-secondary rounded-lg p-1">
          <button
            onClick={() => handleSearchTypeChange('pharmacy')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              searchType === 'pharmacy'
                ? 'bg-white text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t('searchPlaceholder').split(' ')[0]} {/* "Find" or "Пронађи" */}
          </button>
          <button
            onClick={() => handleSearchTypeChange('medicine')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              searchType === 'medicine'
                ? 'bg-white text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
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
            className="w-full px-4 py-3 pl-12 text-lg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            {searchType === 'pharmacy' ? (
              <PharmacyIcon className="w-5 h-5 text-text-secondary" />
            ) : (
              <MedicineIcon className="w-5 h-5 text-text-secondary" />
            )}
          </div>
          {loading.medicines && searchType === 'medicine' && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>

        {/* Medicine Search Results */}
        {searchType === 'medicine' && medicines.length > 0 && (
          <div className="mt-4 max-h-60 overflow-y-auto bg-background-secondary rounded-lg">
            {medicines.map((medicine: Medicine) => (
              <div
                key={medicine.id}
                className="p-3 hover:bg-white cursor-pointer border-b border-border last:border-b-0"
              >
                <h4 className="font-medium text-text-primary">
                  {language === 'me' ? medicine.name_me : (medicine.name_en || medicine.name_me)}
                </h4>
                {medicine.description && (
                  <p className="text-sm text-text-secondary mt-1">{medicine.description}</p>
                )}
                {medicine.pharmacyMedicines && medicine.pharmacyMedicines.length > 0 && (
                  <p className="text-xs text-primary mt-2">
                    Available at {medicine.pharmacyMedicines.length} pharmacies
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}