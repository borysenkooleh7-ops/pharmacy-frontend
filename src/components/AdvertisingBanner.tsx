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
      <div className="bg-bg-base border border-border-default rounded-xl shadow-card p-6">
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
    <div className="bg-bg-base border border-border-default rounded-xl shadow-card overflow-hidden">
      <div className="relative">
        <div
          onClick={() => handleAdClick(currentAd)}
          className="cursor-pointer block transition-transform duration-200 hover:scale-[1.02]"
        >
          <img
            src={currentAd.image_url}
            alt={currentAd.name}
            className="w-full h-40 object-cover"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x160/8168f0/ffffff?text=Advertisement'
            }}
          />
        </div>

        {ads.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {ads.map((_: Ad, index: number) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentAdIndex
                    ? 'bg-white shadow-md scale-110'
                    : 'bg-white opacity-60 hover:opacity-80'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-5">
        <h4 className="text-sm font-semibold text-text-primary">
          {currentAd.name}
        </h4>
        <p className="text-xs text-text-secondary mt-1 opacity-80">
          Sponsored
        </p>
      </div>
    </div>
  )
}