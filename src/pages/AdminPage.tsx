import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../hooks/redux'
import { fetchPharmacies } from '../store/slices/pharmaciesSlice'
import { fetchMedicines } from '../store/slices/medicinesSlice'
import { fetchAds } from '../store/slices/adsSlice'
import { fetchSubmissions } from '../store/slices/submissionsSlice'
import PharmaciesAdmin from '../components/admin/PharmaciesAdmin'
import MedicinesAdmin from '../components/admin/MedicinesAdmin'
import AdsAdmin from '../components/admin/AdsAdmin'
import SubmissionsAdmin from '../components/admin/SubmissionsAdmin'

type ActiveTab = 'pharmacies' | 'medicines' | 'ads' | 'submissions'

export default function AdminPage(): React.JSX.Element {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const pharmacies = useAppSelector(state => state.adminPharmacies.pharmacies)
  const medicines = useAppSelector(state => state.adminMedicines.medicines)
  const ads = useAppSelector(state => state.adminAds.ads)
  const submissions = useAppSelector(state => state.adminSubmissions.submissions)

  const [adminKey, setAdminKey] = useState<string>('')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>('pharmacies')
  const [message, setMessage] = useState<string>('')

  const authenticate = (): void => {
    if (adminKey === 'admin123') {
      setIsAuthenticated(true)
      loadAllData()
      setMessage('')
    } else {
      setMessage('Invalid admin key')
    }
  }

  const loadAllData = () => {
    dispatch(fetchPharmacies({ page: 1, limit: 20 }))
    dispatch(fetchMedicines({ page: 1, limit: 20 }))
    dispatch(fetchAds({ page: 1, limit: 20 }))
    dispatch(fetchSubmissions({ page: 1, limit: 20 }))
  }

  const handleMessage = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 5000)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-gray-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Panel</h1>
            <p className="text-gray-600">Enter your admin key to continue</p>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {message}
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="adminKey" className="block text-sm font-semibold text-gray-700 mb-3">
              Admin Key
            </label>
            <input
              type="password"
              id="adminKey"
              value={adminKey}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdminKey(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-lg"
              placeholder="Enter admin key"
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && authenticate()}
            />
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-md font-medium"
            >
              Go Back
            </button>
            <button
              onClick={authenticate}
              className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-2 px-4 rounded-md transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-md font-medium"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'pharmacies':
        return <PharmaciesAdmin onMessage={handleMessage} />
      case 'medicines':
        return <MedicinesAdmin onMessage={handleMessage} />
      case 'ads':
        return <AdsAdmin onMessage={handleMessage} />
      case 'submissions':
        return <SubmissionsAdmin onMessage={handleMessage} />
      default:
        return <PharmaciesAdmin onMessage={handleMessage} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
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
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {([
                { key: 'pharmacies', label: 'Pharmacies', count: pharmacies.length },
                { key: 'medicines', label: 'Medicines', count: medicines.length },
                { key: 'ads', label: 'Advertisements', count: ads.length },
                { key: 'submissions', label: 'Submissions', count: submissions.length }
              ] as const).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
              </h2>
              <button
                onClick={loadAllData}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Refresh All
              </button>
            </div>
          </div>

          {renderActiveTab()}
        </div>
      </div>
    </div>
  )
}