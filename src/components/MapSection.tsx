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
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-primary-hover text-white p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <MapIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {selectedCity ? (language === 'me' ? selectedCity.name_me : selectedCity.name_en) : 'Mapa'}
              </h2>
              <div className="flex items-center gap-1 text-sm opacity-90">
                <PharmacyIcon className="w-4 h-4" />
                <span>{pharmacies.length} {pharmacies.length === 1 ? 'apoteka' : 'apoteka'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleToggleMap}
            className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-colors text-sm font-medium"
          >
            {mapExpanded ? t('collapseMap') || 'Collapse' : t('expandMap') || 'Expand'}
          </button>
        </div>
      </div>

      <div className={`transition-all duration-300 ${mapExpanded ? 'h-96' : 'h-64'}`}>
        <GoogleMap />
      </div>
    </div>
  )
}