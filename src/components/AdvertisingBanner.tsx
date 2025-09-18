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
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
          <span className="ml-3 text-text-secondary">Loading ads...</span>
        </div>
      </div>
    )
  }

  if (ads.length === 0) {
    return null
  }

  const currentAd = ads[currentAdIndex]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
      <div className="relative group">
        <div
          onClick={() => handleAdClick(currentAd)}
          className="cursor-pointer block relative overflow-hidden"
        >
          <img
            src={currentAd.image_url}
            alt={currentAd.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x192/8168f0/ffffff?text=Advertisement'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Ad indicator badge */}
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
          Ad
        </div>

        {ads.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-2">
            {ads.map((_: Ad, index: number) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentAdIndex
                    ? 'bg-white scale-125'
                    : 'bg-white/60 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-4">
        <h4 className="font-semibold text-gray-900 line-clamp-2 mb-1">
          {currentAd.name}
        </h4>
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
          Sponsored Content
        </p>
      </div>
    </div>
  )
}