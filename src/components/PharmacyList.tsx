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
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-text-primary">
            Pharmacies
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
          <span className="ml-3 text-text-secondary">{t('loading')}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-5 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <SearchIcon className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Found Pharmacies
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Total:</span>
            <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
              {pharmacies.length}
            </span>
          </div>
        </div>
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        {pharmacies.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <SearchIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No pharmacies found</h4>
            <p className="text-gray-600">{t('noPharmaciesFound')}</p>
          </div>
        ) : (
          pharmacies.map((pharmacy: Pharmacy) => (
            <div
              key={pharmacy.id}
              onClick={() => handlePharmacyClick(pharmacy)}
              className={`p-5 border-b border-gray-100 last:border-b-0 cursor-pointer transition-all duration-200 hover:bg-gray-50 group ${
                selectedPharmacy?.id === pharmacy.id
                  ? 'bg-primary/5 border-l-4 border-l-primary shadow-sm'
                  : 'hover:shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                  {language === 'me' ? pharmacy.name_me : (pharmacy.name_en || pharmacy.name_me)}
                </h4>
                <div className="flex flex-wrap gap-1 ml-3">
                  {pharmacy.is_24h && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
                      24/7
                    </span>
                  )}
                  {pharmacy.open_sunday && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                      Sunday
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-1">{pharmacy.address}</p>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <ClockIcon className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{pharmacy.hours_monfri || 'Hours not available'}</span>
                </div>
                {pharmacy.phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <PhoneIcon className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{pharmacy.phone}</span>
                  </div>
                )}
              </div>

              {selectedPharmacy?.id === pharmacy.id && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-primary font-medium">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span>Currently selected</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}