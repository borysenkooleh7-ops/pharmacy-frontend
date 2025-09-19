import { useState, useEffect } from 'react'
import { useAppSelector } from '../hooks/redux'
import { apiService } from '../services/api'
import { useNavigate } from 'react-router-dom'

interface Submission {
  id: string
  name_me: string
  name_en?: string
  address: string
  city_slug: string
  city_id?: number
  email: string
  phone?: string
  website?: string
  lat: number
  lng: number
  is_24h: boolean
  open_sunday: boolean
  hours_monfri: string
  hours_sat: string
  hours_sun: string
  notes?: string
  status: 'received' | 'approved' | 'rejected' | 'reviewed'
  review_notes?: string
  active: boolean
  created_at: string
  updated_at: string
}

export default function AdminPanel(): React.JSX.Element {
  const { language } = useAppSelector(state => state.ui)
  const [adminKey, setAdminKey] = useState<string>('')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  const navigate = useNavigate()

  const authenticate = (): void => {
    if (adminKey === 'admin123') {
      setIsAuthenticated(true)
      fetchSubmissions()
    } else {
      setMessage('Invalid admin key')
    }
  }

  const fetchSubmissions = async (): Promise<void> => {
    setLoading(true)
    try {
      const data = await apiService.getSubmissions(adminKey)
      setSubmissions(data)
      setMessage('')
    } catch (error) {
      setMessage('Failed to fetch submissions')
    } finally {
      setLoading(false)
    }
  }

  const updateSubmissionStatus = async (id: string, status: string): Promise<void> => {
    try {
      await apiService.updateSubmissionStatus(id, status, adminKey)
      setMessage(`Submission ${status} successfully`)
      fetchSubmissions()
    } catch (error) {
      setMessage('Failed to update submission')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Panel</h1>

          {message && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {message}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="adminKey" className="block text-sm font-medium text-gray-700 mb-2">
              Admin Key
            </label>
            <input
              type="password"
              id="adminKey"
              value={adminKey}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdminKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && authenticate()}
            />
          </div>

          <div className='w-full text-white py-2 px-4 rounded-md hover:bg-primary-hover active:bg-primary-active transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-md flex gap-4'>
            <button
              onClick={() => navigate('/')}
              className=" bg-primary"
            >
              Go back
            </button>
            <button
              onClick={authenticate}
              className=" bg-primary"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Admin Panel - Pharmacy Submissions</h1>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="bg-danger text-white px-4 py-2 rounded-md hover:bg-danger-hover active:bg-danger-dark transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-md"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {message && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Pharmacy Submissions ({submissions.length})</h2>
              <button
                onClick={fetchSubmissions}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover active:bg-primary-active transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-md"
              >
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading submissions...</p>
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
                      Names & Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address & Coordinates
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Operating Hours
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact & Website
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status & Notes
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission: Submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      {/* Names & Location */}
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            🇲🇪 {submission.name_me}
                          </div>
                          {submission.name_en && (
                            <div className="text-sm text-gray-600">
                              🇬🇧 {submission.name_en}
                            </div>
                          )}
                          <div className="text-sm text-gray-500 mt-1">
                            📍 {submission.city_slug}
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
                        </div>
                      </td>

                      {/* Address & Coordinates */}
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm text-gray-900 mb-2">
                            {submission.address}
                          </div>
                          <div className="text-xs text-gray-500">
                            <div>📌 Lat: {submission.lat}</div>
                            <div>📌 Lng: {submission.lng}</div>
                          </div>
                        </div>
                      </td>

                      {/* Operating Hours */}
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="text-xs">
                            <span className="font-medium">Mon-Fri:</span>
                            <br />
                            <span className="text-gray-600">{submission.hours_monfri}</span>
                          </div>
                          <div className="text-xs">
                            <span className="font-medium">Sat:</span>
                            <br />
                            <span className="text-gray-600">{submission.hours_sat}</span>
                          </div>
                          <div className="text-xs">
                            <span className="font-medium">Sun:</span>
                            <br />
                            <span className="text-gray-600">{submission.hours_sun}</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact & Website */}
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm text-gray-900 mb-1">
                            📧 {submission.email}
                          </div>
                          {submission.phone && (
                            <div className="text-sm text-gray-600 mb-1">
                              📞 {submission.phone}
                            </div>
                          )}
                          {submission.website && (
                            <div className="text-sm">
                              <a href={submission.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                🌐 Website
                              </a>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status & Notes */}
                      <td className="px-4 py-4">
                        <div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mb-2 ${
                            submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                            submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            submission.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {submission.status}
                          </span>
                          <div className="text-xs text-gray-500">
                            {new Date(submission.created_at).toLocaleDateString()}
                          </div>
                          {submission.notes && (
                            <div className="text-xs text-gray-600 mt-1 max-w-xs">
                              <strong>Notes:</strong> {submission.notes}
                            </div>
                          )}
                          {submission.review_notes && (
                            <div className="text-xs text-blue-600 mt-1 max-w-xs">
                              <strong>Review:</strong> {submission.review_notes}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-sm font-medium">
                        {submission.status === 'received' && (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => updateSubmissionStatus(submission.id, 'approved')}
                              className="text-success hover:text-success-dark active:text-success-dark transition-all duration-200 transform hover:scale-105 active:scale-95 px-3 py-1 rounded hover:bg-success-light text-xs"
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => updateSubmissionStatus(submission.id, 'rejected')}
                              className="text-danger hover:text-danger-dark active:text-danger-dark transition-all duration-200 transform hover:scale-105 active:scale-95 px-3 py-1 rounded hover:bg-danger-light text-xs"
                            >
                              ❌ Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}