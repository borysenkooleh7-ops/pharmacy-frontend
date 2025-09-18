import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { setLanguage } from '@/store/uiSlice'
import { setSelectedCity, setFilters, setSearchTerm } from '@/store/pharmacySlice'
import { useTranslation } from '@/translations'
import { SearchIcon, FiltersIcon, MenuIcon, ClockIcon, CheckIcon, LocationIcon } from '@/components/ui/Icons'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import type { City, UserLocation } from '@/types'

export default function Header(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [geoLocation, setGeoLocation] = useState<UserLocation | null>(null)
  const [loadingLocation, setLoadingLocation] = useState<boolean>(false)
  const { language } = useAppSelector(state => state.ui)
  const { cities, selectedCity, loading, filters } = useAppSelector(state => state.pharmacy)
  const t = useTranslation(language)

  const handleLanguageChange = (newLang: 'me' | 'en'): void => {
    dispatch(setLanguage(newLang))
  }

  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const cityId = parseInt(event.target.value)
    const city = cities.find((c: City) => c.id === cityId)
    if (city) {
      dispatch(setSelectedCity(city))
    }
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setSearchTerm(event.target.value))
  }

  const handleFilterChange = (filterKey: string, value: boolean | string): void => {
    dispatch(setFilters({
      [filterKey]: value
    }))
  }

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      alert(t('geolocationNotSupported') || 'Geolocation is not supported by this browser.')
      return
    }

    setLoadingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setGeoLocation({ latitude, longitude })

        // Find nearest city based on coordinates
        const nearestCity = findNearestCity(latitude, longitude, cities)
        if (nearestCity && nearestCity.id !== selectedCity?.id) {
          dispatch(setSelectedCity(nearestCity))
        }

        setLoadingLocation(false)
      },
      (error) => {
        console.error('Geolocation error:', error)
        setLoadingLocation(false)
        let message = t('geolocationError') || 'Unable to detect your location.'
        if (error.code === error.PERMISSION_DENIED) {
          message = t('geolocationDenied') || 'Location access was denied. Please enable location services.'
        }
        alert(message)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  // Simple distance calculation to find nearest city
  const findNearestCity = (lat: number, lng: number, cityList: City[]): City | null => {
    if (!cityList || cityList.length === 0) return null

    let nearestCity: City | null = null
    let minDistance = Infinity

    cityList.forEach(city => {
      if (city.latitude && city.longitude) {
        const distance = getDistance(lat, lng, city.latitude, city.longitude)
        if (distance < minDistance) {
          minDistance = distance
          nearestCity = city
        }
      }
    })

    return nearestCity
  }

  // Haversine formula for distance calculation
  const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  return (
    <header className="bg-white shadow-lg border-b border-gray-100">
      <div className="container mx-auto px-4 py-4">
        {/* Top Row - Logo and Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <Link to="/" className="text-center lg:text-left group">
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                Apoteka24.me
              </h1>
              <p className="text-sm lg:text-base text-text-secondary mt-1">{t('slogan')}</p>
            </Link>

            <nav className="hidden lg:flex items-center gap-6">
              <Link to="/" className="text-text-primary hover:text-primary transition-colors font-medium px-3 py-2 rounded-lg hover:bg-primary-light hover:bg-opacity-10">
                {t('home')}
              </Link>
              <Link to="/submit" className="text-text-primary hover:text-primary transition-colors font-medium px-3 py-2 rounded-lg hover:bg-primary-light hover:bg-opacity-10">
                {t('addPharmacy')}
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* City Selector with Location Detection */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
              <select
                value={selectedCity?.id || ''}
                onChange={handleCityChange}
                disabled={loading.cities}
                className="px-3 py-2 rounded-lg bg-transparent text-text-primary border-none focus:outline-none disabled:opacity-50 min-w-[140px] font-medium cursor-pointer"
              >
                <option value="">{loading.cities ? 'Loading...' : t('selectCity')}</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>
                    {language === 'me' ? city.name_me : (city.name_en || city.name_me)}
                  </option>
                ))}
              </select>

              <button
                onClick={detectLocation}
                disabled={loadingLocation || loading.cities}
                className="p-2 bg-primary hover:bg-primary-hover rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                title={t('detectLocation') || 'Detect my location'}
              >
                <LocationIcon className={`w-4 h-4 text-white ${loadingLocation ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-gray-50 rounded-lg p-1">
              <button
                onClick={() => handleLanguageChange('me')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  language === 'me' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-white'
                }`}
              >
                ME
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  language === 'en' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-white'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters Row */}
        <div className="bg-gradient-to-r from-primary to-primary-hover rounded-xl p-6 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="relative group">
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder') || 'Find pharmacies or medicines...'}
                  value={filters.search || ''}
                  onChange={handleSearchChange}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-text-primary border-2 border-transparent focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary focus:ring-opacity-20 placeholder-gray-400 shadow-sm transition-all duration-200 text-lg"
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-5 py-4 bg-white bg-opacity-20 hover:bg-white hover:text-primary rounded-xl transition-all duration-200 text-white font-medium shadow-sm hover:shadow-md transform hover:scale-105"
              >
                <FiltersIcon className="w-5 h-5" />
                {t('filters') || 'Filters'}
              </button>

              <button
                onClick={() => handleFilterChange('is24h', !filters?.is24h)}
                className={`flex items-center gap-2 px-5 py-4 rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:scale-105 ${
                  filters?.is24h
                    ? 'bg-white text-primary shadow-lg scale-105'
                    : 'bg-white bg-opacity-20 hover:bg-white hover:text-primary text-white'
                }`}
              >
                <ClockIcon className="w-5 h-5" />
                <span className="hidden sm:inline">{t('24hours') || '24h'}</span>
                <span className="sm:hidden">24h</span>
              </button>

              <button
                onClick={() => handleFilterChange('openSunday', !filters?.openSunday)}
                className={`flex items-center gap-2 px-5 py-4 rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:scale-105 ${
                  filters?.openSunday
                    ? 'bg-white text-primary shadow-lg scale-105'
                    : 'bg-white bg-opacity-20 hover:bg-white hover:text-primary text-white'
                }`}
              >
                <CheckIcon className="w-5 h-5" />
                <span className="hidden sm:inline">{t('sunday') || 'Sunday'}</span>
                <span className="sm:hidden">Sun</span>
              </button>
            </div>
          </div>

          {/* Extended Filters (Hidden by default) */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-white border-opacity-20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    {t('sortBy') || 'Sort by'}
                  </label>
                  <select
                    value={filters?.sortBy || 'name'}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white text-text-primary border border-transparent focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  >
                    <option value="name">{t('name') || 'Name'}</option>
                    <option value="distance">{t('distance') || 'Distance'}</option>
                    <option value="rating">{t('rating') || 'Rating'}</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}