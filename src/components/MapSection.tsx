import { useAppSelector } from '../hooks/redux'
import GoogleMap from './GoogleMap'
import { MapIcon, PharmacyIcon } from './ui/Icons'

export default function MapSection(): React.JSX.Element {
  const { language } = useAppSelector(state => state.ui)
  const { pharmacies, selectedCity } = useAppSelector(state => state.pharmacy)

  return (
    <div className="bg-card border border-primary-light rounded-xl shadow-lg">
      <div className="p-6 border-b border-primary-light bg-gradient-to-r from-primary-lighter to-background-secondary">
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
        </div>
      </div>

      <div className="transition-all duration-300 h-[720px] bg-background-secondary flex items-center justify-center rounded-b-xl overflow-hidden">
        <GoogleMap />
      </div>
    </div>
  )
}