import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../../hooks/redux'
import { updateSubmissionStatus, deleteSubmission, fetchSubmissions } from '../../store/slices/submissionsSlice'
import { PharmacySubmission } from '../../store/slices/types'
import Pagination from '../common/Pagination'
import Modal from '../common/Modal'

interface SubmissionsAdminProps {
  onMessage: (message: string) => void
}

export default function SubmissionsAdmin({ onMessage }: SubmissionsAdminProps): React.JSX.Element {
  const dispatch = useAppDispatch()
  const { submissions, loading, pagination } = useAppSelector(state => state.adminSubmissions)

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(20)
  const [viewingSubmission, setViewingSubmission] = useState<PharmacySubmission | null>(null)

  useEffect(() => {
    dispatch(fetchSubmissions({ page: currentPage, limit: pageSize }))
  }, [dispatch, currentPage, pageSize])

  const handleUpdateStatus = async (id: number, status: 'approved' | 'rejected' | 'reviewed') => {
    await dispatch(updateSubmissionStatus({ id, status }))
    onMessage(`Submission ${status} successfully`)
  }

  const handleDeleteItem = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      await dispatch(deleteSubmission(id))
      // If current page becomes empty, go to previous page
      if (submissions.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      } else {
        dispatch(fetchSubmissions({ page: currentPage, limit: pageSize }))
      }
      onMessage('Submission deleted successfully')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Pharmacy Submissions ({submissions.length})</h3>
        <div className="text-sm text-gray-600">
          Pending approvals and reviews
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No submissions found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pharmacy Info
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact & Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours & Features
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
              {submissions.map((submission: PharmacySubmission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">{submission.name_me}</div>
                    {submission.name_en && <div className="text-sm text-gray-600">{submission.name_en}</div>}
                    <div className="text-sm text-gray-500 mt-1">{submission.address}</div>
                    <div className="text-sm text-gray-500">📍 {submission.city_slug}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">{submission.email}</div>
                    {submission.phone && <div className="text-sm text-gray-600">{submission.phone}</div>}
                    {submission.website && (
                      <div className="text-sm">
                        <a href={submission.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          🌐 Website
                        </a>
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      Lat: {submission.lat}, Lng: {submission.lng}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-xs space-y-1">
                      <div><span className="font-medium">Mon-Fri:</span> {submission.hours_monfri}</div>
                      <div><span className="font-medium">Sat:</span> {submission.hours_sat}</div>
                      <div><span className="font-medium">Sun:</span> {submission.hours_sun}</div>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {submission.is_24h && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          24/7
                        </span>
                      )}
                      {submission.open_sunday && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                          Sunday
                        </span>
                      )}
                    </div>
                    {submission.notes && (
                      <div className="text-xs text-gray-600 mt-1 max-w-xs">
                        <strong>Notes:</strong> {submission.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                      submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      submission.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {submission.status}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </div>
                    {submission.review_notes && (
                      <div className="text-xs text-blue-600 mt-1 max-w-xs">
                        <strong>Review:</strong> {submission.review_notes}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setViewingSubmission(submission)}
                        className="text-blue-600 hover:text-blue-900 text-xs px-2 py-1 rounded hover:bg-blue-50"
                      >
                        👁️ View Details
                      </button>
                      {submission.status === 'received' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(submission.id, 'approved')}
                            className="text-green-600 hover:text-green-900 text-xs px-2 py-1 rounded hover:bg-green-50"
                          >
                            ✅ Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(submission.id, 'rejected')}
                            className="text-red-600 hover:text-red-900 text-xs px-2 py-1 rounded hover:bg-red-50"
                          >
                            ❌ Reject
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(submission.id, 'reviewed')}
                            className="text-yellow-600 hover:text-yellow-900 text-xs px-2 py-1 rounded hover:bg-yellow-50"
                          >
                            👁️ Review
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteItem(submission.id)}
                        className="text-red-600 hover:text-red-900 text-xs px-2 py-1 rounded hover:bg-red-50"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && submissions.length > 0 && (
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
      )}

      {/* View Submission Modal */}
      <Modal
        isOpen={!!viewingSubmission}
        onClose={() => setViewingSubmission(null)}
        title="Pharmacy Submission Details"
        maxWidth="lg"
      >
        {viewingSubmission && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name (Montenegrin)</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingSubmission.name_me}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name (English)</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingSubmission.name_en || 'Not provided'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingSubmission.address}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingSubmission.city_slug}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingSubmission.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingSubmission.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Website</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingSubmission.website || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Location</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Latitude</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingSubmission.lat}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Longitude</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingSubmission.lng}</p>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Operating Hours</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Monday - Friday</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingSubmission.hours_monfri}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Saturday</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingSubmission.hours_sat}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sunday</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingSubmission.hours_sun}</p>
                </div>
              </div>
            </div>

            {/* Flags */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Special Features</h4>
              <div className="flex gap-4">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${viewingSubmission.is_24h ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm">24/7 Operation</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${viewingSubmission.open_sunday ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm">Open Sunday</span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Submission Status</h4>
              <div className="space-y-2">
                <div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    viewingSubmission.status === 'approved' ? 'bg-green-100 text-green-800' :
                    viewingSubmission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    viewingSubmission.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {viewingSubmission.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Submitted</label>
                  <p className="mt-1 text-sm text-gray-900">{new Date(viewingSubmission.createdAt).toLocaleString()}</p>
                </div>
                {viewingSubmission.review_notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Review Notes</label>
                    <p className="mt-1 text-sm text-gray-900">{viewingSubmission.review_notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {viewingSubmission.status === 'received' && (
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleUpdateStatus(viewingSubmission.id, 'approved')
                    setViewingSubmission(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => {
                    handleUpdateStatus(viewingSubmission.id, 'rejected')
                    setViewingSubmission(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  ❌ Reject
                </button>
                <button
                  onClick={() => {
                    handleUpdateStatus(viewingSubmission.id, 'reviewed')
                    setViewingSubmission(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  👁️ Mark as Reviewed
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}