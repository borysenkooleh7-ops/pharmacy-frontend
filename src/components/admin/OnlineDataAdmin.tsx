import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../../hooks/redux'
import {
  fetchSyncableCities,
  syncCityData,
  startBulkSync,
  stopBulkSync,
  moveToNextCity,
  clearSyncResults,
  clearError
} from '../../store/slices/onlineDataSlice'

interface OnlineDataAdminProps {
  onMessage: (message: string) => void
}

export default function OnlineDataAdmin({ onMessage }: OnlineDataAdminProps) {
  const dispatch = useAppDispatch()
  const {
    cities,
    citiesLoading,
    syncInProgress,
    currentSync,
    syncQueue,
    completedSyncs,
    failedSyncs,
    totalCities,
    processedCities,
    overallProgress,
    error
  } = useAppSelector(state => state.onlineData)

  useEffect(() => {
    dispatch(fetchSyncableCities())
  }, [dispatch])

  useEffect(() => {
    if (error) {
      onMessage(`Error: ${error}`)
    }
  }, [error, onMessage])

  useEffect(() => {
    if (syncInProgress && currentSync && currentSync.status === 'pending') {
      // Auto-start sync for the current city
      const timer = setTimeout(() => {
        if (currentSync) {
          dispatch(syncCityData(currentSync.citySlug))
            .unwrap()
            .then(() => {
              // Sync completed successfully, move to next city
              setTimeout(() => {
                dispatch(moveToNextCity())
              }, 1000)
            })
            .catch(() => {
              // Sync failed, move to next city (retry logic is handled in moveToNextCity)
              setTimeout(() => {
                dispatch(moveToNextCity())
              }, 1000)
            })
        }
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [dispatch, syncInProgress, currentSync])

  useEffect(() => {
    // Show completion message when sync is done
    if (!syncInProgress && totalCities > 0 && processedCities === totalCities) {
      const message = `Sync completed! ${completedSyncs.length} cities synced successfully, ${failedSyncs.length} failed.`
      onMessage(message)
    }
  }, [syncInProgress, totalCities, processedCities, completedSyncs.length, failedSyncs.length, onMessage])

  const handleStartBulkSync = () => {
    if (cities.length === 0) {
      onMessage('No cities available for sync')
      return
    }

    const citySlugs = cities.map(city => city.slug)
    dispatch(startBulkSync(citySlugs))
    onMessage('Starting bulk sync for all cities...')
  }

  const handleStopSync = () => {
    dispatch(stopBulkSync())
    onMessage('Sync stopped by user')
  }

  const handleClearResults = () => {
    dispatch(clearSyncResults())
    onMessage('Sync results cleared')
  }

  const handleClearError = () => {
    dispatch(clearError())
  }

  const renderSyncStatus = () => {
    if (!syncInProgress && totalCities === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            No sync in progress
          </div>
          <p className="text-sm text-gray-600">
            Click "Receive Online Pharmacies Data" to start syncing pharmacy data from Google Places API
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {/* Overall Progress */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-700">Overall Progress</span>
            <span className="text-sm text-blue-600">{overallProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
          <div className="mt-2 text-xs text-blue-600">
            {processedCities} of {totalCities} cities processed
          </div>
        </div>

        {/* Current Sync */}
        {currentSync && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">
                  {currentSync.cityName}
                </h4>
                <p className="text-sm text-gray-500 capitalize">
                  Status: {currentSync.status}
                  {currentSync.retryCount > 0 && ` (Retry ${currentSync.retryCount}/${currentSync.maxRetries})`}
                </p>
              </div>
              <div className="flex items-center">
                {currentSync.status === 'syncing' && (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                )}
                {currentSync.status === 'success' && (
                  <div className="text-green-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {currentSync.status === 'error' && (
                  <div className="text-red-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            {currentSync.error && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                {currentSync.error}
              </div>
            )}
            {currentSync.result && (
              <div className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                Processed {currentSync.result.processed} pharmacies: {currentSync.result.created} created, {currentSync.result.updated} updated
              </div>
            )}
          </div>
        )}

        {/* Queue */}
        {syncQueue.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Remaining Cities ({syncQueue.length})</h4>
            <div className="flex flex-wrap gap-2">
              {syncQueue.slice(0, 10).map(citySlug => {
                const city = cities.find(c => c.slug === citySlug)
                return (
                  <span key={citySlug} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                    {city?.name_en || citySlug}
                  </span>
                )
              })}
              {syncQueue.length > 10 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-300 text-gray-600">
                  +{syncQueue.length - 10} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderResults = () => {
    if (completedSyncs.length === 0 && failedSyncs.length === 0) {
      return null
    }

    return (
      <div className="mt-6 space-y-4">
        {/* Completed Syncs */}
        {completedSyncs.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-3">
              Successful Syncs ({completedSyncs.length})
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {completedSyncs.map((sync, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-green-700">{sync.cityName}</span>
                  {sync.result && (
                    <span className="text-green-600">
                      {sync.result.created}C / {sync.result.updated}U
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Failed Syncs */}
        {failedSyncs.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-3">
              Failed Syncs ({failedSyncs.length})
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {failedSyncs.map((sync, index) => (
                <div key={index} className="text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-red-700">{sync.cityName}</span>
                    <span className="text-red-600 text-xs">
                      {sync.retryCount}/{sync.maxRetries} attempts
                    </span>
                  </div>
                  {sync.error && (
                    <div className="text-xs text-red-600 mt-1 truncate">
                      {sync.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Online Pharmacy Data</h3>
          <p className="text-sm text-gray-600">
            Sync pharmacy data from Google Places API for all cities in Montenegro
          </p>
        </div>
        <div className="flex gap-2">
          {!syncInProgress ? (
            <>
              <button
                onClick={handleStartBulkSync}
                disabled={citiesLoading || cities.length === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors font-medium"
              >
                {citiesLoading ? 'Loading...' : 'Receive Online Pharmacies Data'}
              </button>
              {(completedSyncs.length > 0 || failedSyncs.length > 0) && (
                <button
                  onClick={handleClearResults}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Clear Results
                </button>
              )}
            </>
          ) : (
            <button
              onClick={handleStopSync}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors font-medium"
            >
              Stop Sync
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={handleClearError}
            className="text-red-500 hover:text-red-700 ml-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Cities Info */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Available Cities</span>
          <span className="text-sm text-gray-600">{cities.length} cities</span>
        </div>
        {cities.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {cities.slice(0, 8).map(city => (
              <span key={city.id} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {city.name_en}
              </span>
            ))}
            {cities.length > 8 && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-600">
                +{cities.length - 8} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Sync Status */}
      {renderSyncStatus()}

      {/* Results */}
      {renderResults()}
    </div>
  )
}