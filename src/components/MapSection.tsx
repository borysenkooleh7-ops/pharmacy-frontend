import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { toggleMapExpanded } from '../store/uiSlice'
import { useTranslation } from '../translations'
import GoogleMap from './GoogleMap'
import { MapIcon, PharmacyIcon } from './ui/Icons'

export default function MapSection(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const { language, mapExpanded } = useAppSelector(state => state.ui)
  const { pharmacies, selectedCity } = useAppSelector(state => state.pharmacy)
  const t = useTranslation(language)

  const handleToggleMap = (): void => {
    dispatch(toggleMapExpanded())
  }

  return (
    <div className="bg-bg-base border border-border-default rounded-xl shadow-card">
      <div className="p-6 border-b border-border-light bg-bg-light">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary bg-opacity-10 rounded-xl">
              <MapIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">
                {selectedCity ? (language === 'me' ? selectedCity.name_me : selectedCity.name_en) : 'Interactive Map'}
              </h2>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <PharmacyIcon className="w-4 h-4" />
                <span>{pharmacies.length} pharmacies found</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleToggleMap}
            className="px-5 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.02]"
          >
            {mapExpanded ? t('collapseMap') || 'Minimize' : t('expandMap') || 'Expand'}
          </button>
        </div>
      </div>

      <div className={`transition-all duration-300 ${mapExpanded ? 'h-96' : 'h-64'} bg-bg-light flex items-center justify-center rounded-b-xl overflow-hidden`}>
        <GoogleMap />
      </div>
    </div>
  )
}