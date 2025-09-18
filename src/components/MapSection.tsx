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
    <div className="overflow-hidden">
      <div className="bg-white p-5 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <MapIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {selectedCity ? (language === 'me' ? selectedCity.name_me : selectedCity.name_en) : 'Interactive Map'}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <PharmacyIcon className="w-4 h-4" />
                <span>{pharmacies.length} pharmacies found</span>
                {selectedCity && (
                  <>
                    <span className="w-1 h-1 bg-gray-400 rounded-full mx-1"></span>
                    <span className="text-primary font-medium">
                      {language === 'me' ? selectedCity.name_me : selectedCity.name_en}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleToggleMap}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              mapExpanded
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-primary text-white hover:bg-primary-hover shadow-sm hover:shadow-md'
            }`}
          >
            {mapExpanded ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                {t('collapseMap') || 'Minimize'}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                {t('expandMap') || 'Expand Map'}
              </span>
            )}
          </button>
        </div>

        {/* Map Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-gray-600">Regular Hours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span className="text-gray-600">24/7 Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-gray-600">Open Sundays</span>
          </div>
        </div>
      </div>

      <div className={`transition-all duration-300 ${mapExpanded ? 'h-[500px]' : 'h-80'} relative`}>
        <GoogleMap />

        {/* Map overlay for loading or no data */}
        {pharmacies.length === 0 && (
          <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <MapIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pharmacies to display</h3>
              <p className="text-gray-600">Select a city to view pharmacies on the map</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}