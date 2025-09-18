import { useState, useEffect } from 'react'
import { submitPharmacy, clearSubmissionSuccess, clearError } from '../store/pharmacySlice'
import { useTranslation } from '../translations'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import LoadingSpinner from './ui/LoadingSpinner'
import ErrorMessage from './ui/ErrorMessage'
import type { City, PharmacySubmissionData } from '@/types'

export default function PharmacySubmissionForm(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const { language } = useAppSelector(state => state.ui)
  const {
    cities,
    selectedCity,
    loading,
    error,
    submissionSuccess
  } = useAppSelector(state => state.pharmacy)
  const t = useTranslation(language)

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city_slug: selectedCity?.slug || '',
    phone: '',
    website: '',
    email: '',
    is_24h: false,
    open_sunday: false,
    notes: ''
  })

  // Update city_slug when selectedCity changes
  useEffect(() => {
    if (selectedCity && !formData.city_slug) {
      setFormData(prev => ({
        ...prev,
        city_slug: selectedCity.slug
      }))
    }
  }, [selectedCity, formData.city_slug])

  // Reset form on successful submission
  useEffect(() => {
    if (submissionSuccess) {
      setFormData({
        name: '',
        address: '',
        city_slug: selectedCity?.slug || '',
        phone: '',
        website: '',
        email: '',
        is_24h: false,
        open_sunday: false,
        notes: ''
      })
      // Clear success message after 5 seconds
      const timeout = setTimeout(() => {
        dispatch(clearSubmissionSuccess())
      }, 5000)
      return () => clearTimeout(timeout)
    }
  }, [submissionSuccess, selectedCity, dispatch])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Clear any previous errors
    if (error.submission) {
      dispatch(clearError('submission'))
    }

    // Dispatch the submission
    dispatch(submitPharmacy(formData))
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b border-gray-100 p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {t('submitPharmacy') || 'Add New Pharmacy'}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              {t('submitPharmacySubtitle') || 'Help us expand our pharmacy network in Montenegro. Your contribution makes a difference!'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">

        {/* Success Message */}
        {submissionSuccess && (
          <div className="p-6 rounded-xl mb-8 bg-emerald-50 border border-emerald-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-emerald-900 text-lg mb-1">{t('success') || 'Successfully Submitted!'}</h3>
                <p className="text-emerald-800">
                  {language === 'me' ? 'Hvala! Vaš zahtjev je uspješno poslat i bit će razmojen u najkraćem mogućem roku.' : 'Thank you! Your pharmacy submission has been received and will be reviewed shortly.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error.submission && (
          <ErrorMessage
            error={error.submission}
            onRetry={() => dispatch(clearError('submission'))}
            className="mb-6"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-900">
                {t('pharmacyName')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter pharmacy name..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white hover:border-gray-400"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900">
                {t('pharmacyEmail')} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="contact@pharmacy.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white hover:border-gray-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="address" className="block text-sm font-semibold text-gray-900">
              {t('pharmacyAddress')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Enter full pharmacy address..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white hover:border-gray-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="city_slug" className="block text-sm font-semibold text-gray-900">
                City <span className="text-red-500">*</span>
              </label>
              <select
                id="city_slug"
                name="city_slug"
                value={formData.city_slug}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white hover:border-gray-400"
              >
                <option value="">Select city...</option>
                {cities.map(city => (
                  <option key={city.slug} value={city.slug}>
                    {language === 'me' ? city.name_me : city.name_en}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-900">
                {t('pharmacyPhone')}
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+382 XX XXX XXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white hover:border-gray-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="website" className="block text-sm font-semibold text-gray-900">
              {t('pharmacyWebsite')}
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example-pharmacy.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white hover:border-gray-400"
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Operating Hours</h4>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  name="is_24h"
                  checked={formData.is_24h}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-900">{t('is24hours') || '24/7 Operation'}</span>
                  <p className="text-xs text-gray-500">Open 24 hours, 7 days a week</p>
                </div>
              </label>

              <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  name="open_sunday"
                  checked={formData.open_sunday}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-900">{t('openOnSunday') || 'Open on Sundays'}</span>
                  <p className="text-xs text-gray-500">Available on Sunday</p>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="block text-sm font-semibold text-gray-900">
              {t('additionalNotes') || 'Additional Information'}
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Any additional information about the pharmacy, special services, or operating hours..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white hover:border-gray-400 resize-none"
            />
          </div>

          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading.submission}
              className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {loading.submission ? (
                <span className="flex items-center justify-center">
                  <LoadingSpinner size="sm" className="mr-3" />
                  {language === 'me' ? 'Submitting...' : 'Submitting...'}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t('submit') || 'Submit New Pharmacy'}
                </span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}