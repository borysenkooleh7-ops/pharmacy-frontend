import { useState, useEffect } from 'react'
import { useAppSelector } from '../hooks/redux'
import LoadingSpinner from './ui/LoadingSpinner'
import type { Ad } from '@/types'

export default function AdvertisingBanner(): React.JSX.Element {
  const { ads, loading } = useAppSelector(state => state.ads)
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

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
      <div className="bg-card border border-primary-light rounded-xl shadow-lg p-6">
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

  // Fallback SVG for failed images
  const fallbackImageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjODE2OGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFkdmVydGlzZW1lbnQ8L3RleHQ+PC9zdmc+'

  // Check if image URL is problematic (via.placeholder.com or known to fail)
  const isProblematicUrl = (url: string): boolean => {
    return url.includes('via.placeholder.com') || imageErrors.has(url)
  }

  const handleImageError = (imageUrl: string) => {
    setImageErrors(prev => new Set(prev).add(imageUrl))
  }

  return (
    <div className="bg-card border border-primary-light rounded-xl shadow-lg overflow-hidden hover:border-primary hover:shadow-xl transition-all duration-300">
      <div className="relative">
        <div
          onClick={() => handleAdClick(currentAd)}
          className="cursor-pointer block transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
        >
          <img
            src={isProblematicUrl(currentAd.image_url) ? fallbackImageSrc : currentAd.image_url}
            alt={currentAd.name}
            className="w-full h-40 object-cover"
            onError={() => handleImageError(currentAd.image_url)}
          />
        </div>

        {ads.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {ads.map((_: Ad, index: number) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 transform ${
                  index === currentAdIndex
                    ? 'bg-white shadow-md scale-110 ring-2 ring-white ring-opacity-50'
                    : 'bg-white opacity-60 hover:opacity-80 hover:scale-105 active:scale-95'
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