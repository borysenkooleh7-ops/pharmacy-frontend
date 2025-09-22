import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../../hooks/redux'
import { createPharmacy, updatePharmacy, deletePharmacy, fetchPharmacies } from '../../store/slices/pharmaciesSlice'
import { Pharmacy } from '../../store/slices/types'
import { MONTENEGRO_CITIES } from '../../data/cities'
import { useTranslation } from '../../translations'
import Pagination from '../common/Pagination'
import Modal from '../common/Modal'
import FormField from '../common/FormField'

interface PharmaciesAdminProps {
  onMessage: (message: string) => void
}

export default function PharmaciesAdmin({ onMessage }: PharmaciesAdminProps): React.JSX.Element {
  const dispatch = useAppDispatch()
  const { pharmacies, loading, pagination } = useAppSelector(state => state.adminPharmacies)
  const { language } = useAppSelector(state => state.ui)
  const t = useTranslation(language)

  const [editingItem, setEditingItem] = useState<Pharmacy | null>(null)
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [fetching, setFetching] = useState<boolean>(false)
  const [selectedCity, setSelectedCity] = useState<string>('podgorica')
  const [lastFetchResult, setLastFetchResult] = useState<any>(null)
  const [pageSize, setPageSize] = useState<number>(20)

  useEffect(() => {
    dispatch(fetchPharmacies({ page: currentPage, limit: pageSize }))
  }, [dispatch, currentPage, pageSize])

  const handleCreateItem = async (data: any) => {
    try {
      await dispatch(createPharmacy(data)).unwrap()
      setShowCreateForm(false)
      // Redux slice automatically adds the new pharmacy to state, no need to refetch
      onMessage(t('pharmacyCreated'))
    } catch (error: any) {
      onMessage(`${t('createFailed')}: ${error.message || t('unknownError')}`)
    }
  }

  const handleUpdateItem = async (data: any) => {
    try {
      await dispatch(updatePharmacy(data)).unwrap()
      setEditingItem(null)
      onMessage(t('pharmacyUpdated'))
    } catch (error: any) {
      onMessage(`${t('updateFailed')}: ${error.message || t('unknownError')}`)
    }
  }

  const handleDeleteItem = async (id: number) => {
    if (window.confirm(t('confirmDelete'))) {
      try {
        await dispatch(deletePharmacy(id)).unwrap()
        // Redux slice automatically removes the pharmacy from state and updates pagination
        // If current page becomes empty, go to previous page
        if (pharmacies.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1)
        }
        onMessage(t('pharmacyDeleted'))
      } catch (error: any) {
        onMessage(`${t('deleteFailed')}: ${error.message || t('unknownError')}`)
      }
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  const closeModal = () => {
    setShowCreateForm(false)
    setEditingItem(null)
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const isEditing = !!editingItem

    // Validate coordinates
    const latStr = formData.get('lat') as string
    const lngStr = formData.get('lng') as string
    const lat = parseFloat(latStr)
    const lng = parseFloat(lngStr)

    if (isNaN(lat) || isNaN(lng)) {
      onMessage(t('validCoordinates'))
      return
    }

    const data = {
      ...(isEditing && { id: editingItem.id }),
      city_id: parseInt(formData.get('city_id') as string),
      name_me: formData.get('name_me') as string,
      name_en: formData.get('name_en') as string,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      website: formData.get('website') as string,
      lat,
      lng,
      is_24h: formData.get('is_24h') === 'on',
      open_sunday: formData.get('open_sunday') === 'on',
      hours_monfri: formData.get('hours_monfri') as string,
      hours_sat: formData.get('hours_sat') as string,
      hours_sun: formData.get('hours_sun') as string,
      active: formData.get('active') === 'on'
    }

    if (isEditing) {
      handleUpdateItem(data)
    } else {
      handleCreateItem(data)
    }
  }

  const fetchOnlineData = async () => {
    setFetching(true)
    try {
      const response = await fetch('http://localhost:5000/api/online-data/sync-city', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'admin123'
        },
        body: JSON.stringify({ citySlug: selectedCity })
      })
      const data = await response.json()
      if (data.success) {
        setLastFetchResult(data.data)
        onMessage(`Success! ${data.data.created} pharmacies created, ${data.data.updated} updated for ${data.data.cityName}`)
        dispatch(fetchPharmacies({ page: currentPage, limit: pageSize }))
      } else {
        onMessage(`Error: ${data.message}`)
      }
    } catch (error) {
      onMessage('Error fetching online data') // Keep English for now as this is admin function
    }
    setFetching(false)
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">Pharmacies ({pharmacies.length})</h3>
          <p className="text-xs text-gray-500">Fetch prevents duplicates by Google Place ID and name matching</p>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {MONTENEGRO_CITIES.map(city => (
              <option key={city.slug} value={city.slug}>
                {city.name_en}
              </option>
            ))}
          </select>
          <button
            onClick={fetchOnlineData}
            disabled={fetching}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {fetching ? t('fetchingData') : t('fetchOnlineData')}
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Add New Pharmacy
          </button>
        </div>
      </div>

      {lastFetchResult && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">
            Last Fetch Result - {lastFetchResult.cityName}
          </h4>
          <div className="grid grid-cols-3 gap-4 mb-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{lastFetchResult.created}</div>
              <div className="text-sm text-gray-600">Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{lastFetchResult.updated}</div>
              <div className="text-sm text-gray-600">Updated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{lastFetchResult.processed}</div>
              <div className="text-sm text-gray-600">Total Processed</div>
            </div>
          </div>
          {lastFetchResult.pharmacies && lastFetchResult.pharmacies.length > 0 && (
            <div className="max-h-40 overflow-y-auto">
              <div className="text-sm font-medium text-gray-700 mb-2">Processed Pharmacies:</div>
              <div className="space-y-1">
                {lastFetchResult.pharmacies.map((pharmacy: any, index: number) => (
                  <div key={index} className="flex justify-between items-center text-sm bg-white p-2 rounded">
                    <span className="font-medium">{pharmacy.name}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      pharmacy.action === 'created'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {pharmacy.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <button
            onClick={() => setLastFetchResult(null)}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800"
          >
            Clear Results
          </button>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      ) : pharmacies.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No pharmacies found
        </div>
      ) : (
        <>
          {/* Top Pagination */}
          {pharmacies.length > 0 && (
            <div className="mb-4">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                hasNextPage={pagination.hasNextPage}
                hasPrevPage={pagination.hasPrevPage}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSize={pageSize}
              />
            </div>
          )}

          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pharmacies.map((pharmacy: Pharmacy) => (
                <tr key={pharmacy.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">{pharmacy.name_me}</div>
                    {pharmacy.name_en && <div className="text-sm text-gray-600">{pharmacy.name_en}</div>}
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">{pharmacy.address}</div>
                    <div className="text-sm text-gray-500">Lat: {pharmacy.lat}, Lng: {pharmacy.lng}</div>
                  </td>
                  <td className="px-4 py-4">
                    {pharmacy.phone && <div className="text-sm text-gray-900">{pharmacy.phone}</div>}
                    {pharmacy.website && (
                      <div className="text-sm">
                        <a href={pharmacy.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Website
                        </a>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      pharmacy.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {pharmacy.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingItem(pharmacy)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(pharmacy.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {/* Bottom Pagination */}
          {pharmacies.length > 0 && (
            <div className="mt-4">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                hasNextPage={pagination.hasNextPage}
                hasPrevPage={pagination.hasPrevPage}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSize={pageSize}
              />
            </div>
          )}
        </>
      )}


      {/* Modal for Create/Edit */}
      <Modal
        isOpen={showCreateForm || !!editingItem}
        onClose={closeModal}
        title={editingItem ? 'Edit Pharmacy' : 'Create Pharmacy'}
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="city_id" className="block text-sm font-medium text-gray-700">
                City *
              </label>
              <select
                name="city_id"
                id="city_id"
                defaultValue={editingItem?.city_id || ''}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="">Select a city</option>
                {MONTENEGRO_CITIES.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name_en} ({city.name_me})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">Select the city where this pharmacy is located</p>
            </div>

            <FormField
              label="Name (Montenegrin)"
              name="name_me"
              type="text"
              defaultValue={editingItem?.name_me || ''}
              required
              placeholder="Apoteka..."
            />

            <FormField
              label="Name (English)"
              name="name_en"
              type="text"
              defaultValue={editingItem?.name_en || ''}
              placeholder="Pharmacy..."
            />

            <FormField
              label="Address"
              name="address"
              type="text"
              defaultValue={editingItem?.address || ''}
              required
              placeholder="Street address"
            />

            <FormField
              label="Phone"
              name="phone"
              type="tel"
              defaultValue={editingItem?.phone || ''}
              placeholder="+382 20 123 456"
            />

            <FormField
              label="Website"
              name="website"
              type="url"
              defaultValue={editingItem?.website || ''}
              placeholder="https://example.com"
            />

            <FormField
              label="Latitude"
              name="lat"
              type="number"
              step="any"
              defaultValue={editingItem?.lat?.toString() || ''}
              required
              placeholder="42.4304"
            />

            <FormField
              label="Longitude"
              name="lng"
              type="number"
              step="any"
              defaultValue={editingItem?.lng?.toString() || ''}
              required
              placeholder="19.2594"
            />

            <FormField
              label="Monday-Friday Hours"
              name="hours_monfri"
              type="text"
              defaultValue={editingItem?.hours_monfri || ''}
              required
              placeholder="08:00 - 20:00"
            />

            <FormField
              label="Saturday Hours"
              name="hours_sat"
              type="text"
              defaultValue={editingItem?.hours_sat || ''}
              required
              placeholder="09:00 - 18:00"
            />

            <FormField
              label="Sunday Hours"
              name="hours_sun"
              type="text"
              defaultValue={editingItem?.hours_sun || ''}
              required
              placeholder="Closed or 10:00 - 16:00"
            />
          </div>

          <div className="mt-6 space-y-3">
            <FormField
              label="24/7 Operation"
              name="is_24h"
              type="checkbox"
              defaultValue={editingItem?.is_24h || false}
            />

            <FormField
              label="Open on Sunday"
              name="open_sunday"
              type="checkbox"
              defaultValue={editingItem?.open_sunday || false}
            />

            <FormField
              label="Active"
              name="active"
              type="checkbox"
              defaultValue={editingItem?.active ?? true}
            />
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {editingItem ? 'Update Pharmacy' : 'Create Pharmacy'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}