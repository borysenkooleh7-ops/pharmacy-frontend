import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { setSelectedPharmacy } from '../store/pharmacySlice'
import { useTranslation } from '../translations'
import LoadingSpinner from './ui/LoadingSpinner'
import { SearchIcon, PhoneIcon, ClockIcon } from './ui/Icons'
import type { Pharmacy } from '@/types'

export default function PharmacyList(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const { language } = useAppSelector(state => state.ui)
  const { pharmacies, selectedPharmacy, loading } = useAppSelector(state => state.pharmacy)
  const t = useTranslation(language)

  const handlePharmacyClick = (pharmacy: Pharmacy): void => {
    dispatch(setSelectedPharmacy(pharmacy))
  }

  if (loading.pharmacies) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-primary to-primary-hover">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <SearchIcon className="w-5 h-5" />
            {t('pharmacies') || 'Pharmacies'}
          </h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
          <span className="ml-3 text-text-secondary font-medium">{t('loading')}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-primary to-primary-hover">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <SearchIcon className="w-5 h-5" />
            {t('pharmacies') || 'Pharmacies'}
          </h3>
          <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm font-medium">
            {pharmacies.length}
          </span>
        </div>
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        {pharmacies.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <SearchIcon className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-text-secondary font-medium">{t('noPharmaciesFound')}</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          pharmacies.map((pharmacy: Pharmacy, index: number) => (
            <div
              key={pharmacy.id}
              onClick={() => handlePharmacyClick(pharmacy)}
              className={`group relative p-5 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-primary hover:from-opacity-5 hover:to-primary-light hover:to-opacity-5 hover:shadow-sm ${
                selectedPharmacy?.id === pharmacy.id ? 'bg-gradient-to-r from-primary to-primary-light bg-opacity-10 border-primary shadow-md' : ''
              } ${index === pharmacies.length - 1 ? 'border-b-0' : ''}`}
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-text-primary line-clamp-2 group-hover:text-primary transition-colors">
                  {language === 'me' ? pharmacy.name_me : (pharmacy.name_en || pharmacy.name_me)}
                </h4>
                <div className="flex gap-2 ml-3 flex-shrink-0">
                  {pharmacy.is_24h && (
                    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-gradient-to-r from-success to-green-500 text-white rounded-full shadow-sm">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      24/7
                    </span>
                  )}
                  {pharmacy.open_sunday && (
                    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-gradient-to-r from-warning to-orange-500 text-white rounded-full shadow-sm">
                      Sun
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-text-secondary mb-3 line-clamp-2">{pharmacy.address}</p>

              <div className="flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-2 text-text-secondary">
                  <ClockIcon className="w-4 h-4 text-primary" />
                  <span className="font-medium">{pharmacy.hours_monfri || 'Hours not available'}</span>
                </div>
                {pharmacy.phone && (
                  <div className="flex items-center gap-2 text-text-secondary">
                    <PhoneIcon className="w-4 h-4 text-primary" />
                    <span className="font-medium">{pharmacy.phone}</span>
                  </div>
                )}
              </div>

              {/* Hover indicator */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}