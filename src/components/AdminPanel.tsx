import { useState, useEffect } from 'react'
import { useAppSelector } from '../hooks/redux'

interface Submission {
  id: string
  name: string
  address: string
  city_slug: string
  email: string
  phone?: string
  website?: string
  is_24h: boolean
  open_sunday: boolean
  status: 'received' | 'approved' | 'rejected' | 'reviewed'
  created_at: string
}

export default function AdminPanel(): React.JSX.Element {
  const { language } = useAppSelector(state => state.ui)
  const [adminKey, setAdminKey] = useState<string>('')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')

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
      const response = await fetch('/api/admin/submissions', {
        headers: {
          'x-admin-key': adminKey
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSubmissions(data)
      } else {
        setMessage('Failed to fetch submissions')
      }
    } catch (error) {
      setMessage('Error fetching submissions')
    } finally {
      setLoading(false)
    }
  }

  const updateSubmissionStatus = async (id: string, status: string): Promise<void> => {
    try {
      const response = await fetch(`/api/admin/submissions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        setMessage(`Submission ${status} successfully`)
        fetchSubmissions()
      } else {
        setMessage(`Failed to update submission`)
      }
    } catch (error) {
      setMessage('Error updating submission')
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
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && authenticate()}
            />
          </div>

          <button
            onClick={authenticate}
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-hover transition-colors"
          >
            Login
          </button>
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
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
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
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors"
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
                      Pharmacy Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission: Submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {submission.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {submission.address}
                          </div>
                          <div className="text-sm text-gray-500">
                            {submission.city_slug}
                          </div>
                          <div className="flex gap-2 mt-1">
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
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {submission.email}
                        </div>
                        {submission.phone && (
                          <div className="text-sm text-gray-500">
                            {submission.phone}
                          </div>
                        )}
                        {submission.website && (
                          <div className="text-sm text-gray-500">
                            <a href={submission.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Website
                            </a>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                          submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          submission.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(submission.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        {submission.status === 'received' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateSubmissionStatus(submission.id, 'approved')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateSubmissionStatus(submission.id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
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