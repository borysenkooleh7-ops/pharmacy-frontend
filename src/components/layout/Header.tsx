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
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-6">
        {/* Top Row - Logo and Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <Link to="/" className="text-center lg:text-left">
              <h1 className="text-2xl lg:text-3xl font-bold text-primary">
                Apoteka24.me
              </h1>
              <p className="text-sm lg:text-base text-text-secondary">{t('slogan')}</p>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* City Selector with Location Detection */}
            <div className="flex items-center gap-2">
              <select
                value={selectedCity?.id || ''}
                onChange={handleCityChange}
                disabled={loading.cities}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
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
                className="p-2 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('detectLocation') || 'Detect my location'}
              >
                <LocationIcon className={`w-4 h-4 ${loadingLocation ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Language Switcher */}
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => handleLanguageChange('me')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  language === 'me' ? 'bg-primary text-white' : 'bg-white text-text-primary hover:bg-gray-50'
                }`}
              >
                ME
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  language === 'en' ? 'bg-primary text-white' : 'bg-white text-text-primary hover:bg-gray-50'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-4">
          <div className="relative max-w-2xl">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('searchPlaceholder') || 'Find a pharmacy'}
              value={filters.search || ''}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-gray-500"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleFilterChange('is24h', !filters?.is24h)}
            className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
              filters?.is24h
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-text-primary border-gray-300 hover:bg-gray-50'
            }`}
          >
            24-hour pharmacies
          </button>

          <button
            onClick={() => handleFilterChange('openSunday', !filters?.openSunday)}
            className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
              filters?.openSunday
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-text-primary border-gray-300 hover:bg-gray-50'
            }`}
          >
            Open on Sundays
          </button>

          <button
            onClick={() => handleFilterChange('nearby', !filters?.nearby)}
            className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
              filters?.nearby
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-text-primary border-gray-300 hover:bg-gray-50'
            }`}
          >
            Nearby pharmacies
          </button>
        </div>
      </div>
    </header>
  )
}