import { useState, useEffect } from 'react'
import { useAppSelector } from '../hooks/redux'
import LoadingSpinner from './ui/LoadingSpinner'
import type { Ad } from '@/types'

export default function AdvertisingBanner(): React.JSX.Element {
  const { ads, loading } = useAppSelector(state => state.ads)
  const [currentAdIndex, setCurrentAdIndex] = useState(0)

  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length)
      }, 4000)

      return () => clearInterval(interval)
    }
  }, [ads.length])

  const handleAdClick = (ad: Ad): void => {
    if (ad.target_url) {
      window.open(ad.target_url, '_blank')
    }
  }

  const handleDotClick = (index: number): void => {
    setCurrentAdIndex(index)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
          <span className="ml-3 text-text-secondary font-medium">Loading ads...</span>
        </div>
      </div>
    )
  }

  if (ads.length === 0) {
    return null
  }

  const currentAd = ads[currentAdIndex]

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300">
      <div className="relative overflow-hidden">
        <div
          onClick={() => handleAdClick(currentAd)}
          className="cursor-pointer block relative"
        >
          <img
            src={currentAd.image_url}
            alt={currentAd.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x192/8168f0/ffffff?text=Advertisement'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black from-opacity-20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {ads.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {ads.map((_: Ad, index: number) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                  index === currentAdIndex
                    ? 'bg-white shadow-lg'
                    : 'bg-white bg-opacity-60 hover:bg-opacity-80'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-4">
        <h4 className="text-base font-semibold text-text-primary line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {currentAd.name}
        </h4>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-text-secondary font-medium bg-gray-50 px-2 py-1 rounded-full">
            Sponsored
          </span>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-xs text-primary font-medium">Click to learn more →</span>
          </div>
        </div>
      </div>
    </div>
  )
}