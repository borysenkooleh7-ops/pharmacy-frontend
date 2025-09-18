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
    <div className="bg-card shadow-xl border border-primary rounded-xl p-8 mb-8 pulse-neon rainbow-border">
      <div className="max-w-2xl mx-auto">
        {/* Search Type Tabs */}
        <div className="flex mb-6 bg-background-secondary rounded-lg p-1 border border-primary rainbow-border">
          <button
            onClick={() => handleSearchTypeChange('pharmacy')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 neon-text ${
              searchType === 'pharmacy'
                ? 'bg-primary text-white shadow-button pulse-neon'
                : 'text-text-secondary hover:text-text-primary hover:bg-card-hover hover:neon-text'
            }`}
          >
            {t('searchPlaceholder').split(' ')[0]}
          </button>
          <button
            onClick={() => handleSearchTypeChange('medicine')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 neon-text ${
              searchType === 'medicine'
                ? 'bg-success text-white shadow-button pulse-neon'
                : 'text-text-secondary hover:text-text-primary hover:bg-card-hover hover:neon-text'
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
            className="w-full px-4 py-4 pl-12 text-lg bg-background border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-text-primary placeholder:text-text-tertiary shadow-lg hover:shadow-xl rainbow-border neon-text"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pulse-neon">
            {searchType === 'pharmacy' ? (
              <PharmacyIcon className="w-5 h-5 text-primary neon-text" />
            ) : (
              <MedicineIcon className="w-5 h-5 text-success neon-text" />
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
          <div className="mt-6 max-h-60 overflow-y-auto bg-background-secondary rounded-lg border border-border-light shadow-md">
            {medicines.map((medicine: Medicine) => (
              <div
                key={medicine.id}
                className="p-4 hover:bg-card cursor-pointer border-b border-border-light last:border-b-0 transition-all duration-200 hover:shadow-sm"
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
      </div>
    </div>
  )
}