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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-primary-hover text-white p-6">
        <h2 className="text-2xl font-bold mb-2">
          {t('submitPharmacy') || 'Add New Pharmacy'}
        </h2>
        <p className="text-white text-opacity-90">
          {t('submitPharmacySubtitle') || 'Help us expand our pharmacy network in Montenegro'}
        </p>
      </div>

      <div className="p-6">

        {/* Success Message */}
        {submissionSuccess && (
          <div className="p-4 rounded-xl mb-6 bg-success bg-opacity-10 text-success border border-success border-opacity-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-success text-white rounded-full flex items-center justify-center">
                ✓
              </div>
              <div>
                <h3 className="font-semibold">{t('success') || 'Success!'}</h3>
                <p className="text-sm opacity-90">
                  {language === 'me' ? 'Hvala! Vaš zahtjev je uspješno poslat.' : 'Thank you! Your request has been submitted successfully.'}
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

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1">
            {t('pharmacyName')} *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50 focus:bg-white"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
            {t('pharmacyEmail')} *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50 focus:bg-white"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-text-primary mb-1">
            {t('pharmacyAddress')} *
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50 focus:bg-white"
          />
        </div>

        <div>
          <label htmlFor="city_slug" className="block text-sm font-medium text-text-primary mb-1">
            Grad *
          </label>
          <select
            id="city_slug"
            name="city_slug"
            value={formData.city_slug}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50 focus:bg-white"
          >
            <option value="">Izaberite grad</option>
            {cities.map(city => (
              <option key={city.slug} value={city.slug}>
                {language === 'me' ? city.name_me : city.name_en}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-1">
            {t('pharmacyPhone')}
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50 focus:bg-white"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="website" className="block text-sm font-medium text-text-primary mb-1">
            {t('pharmacyWebsite')}
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://"
            className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50 focus:bg-white"
          />
        </div>

        <div className="md:col-span-2">
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_24h"
                checked={formData.is_24h}
                onChange={handleChange}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
              />
              <span className="ml-2 text-sm text-text-primary">{t('is24hours')}</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="open_sunday"
                checked={formData.open_sunday}
                onChange={handleChange}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
              />
              <span className="ml-2 text-sm text-text-primary">{t('openOnSunday')}</span>
            </label>
          </div>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-text-primary mb-1">
            {t('additionalNotes')}
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50 focus:bg-white"
          />
        </div>

        <div className="md:col-span-2 pt-4">
          <button
            type="submit"
            disabled={loading.submission}
            className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-primary to-primary-hover text-white font-semibold rounded-xl hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            {loading.submission ? (
              <span className="flex items-center justify-center">
                <LoadingSpinner size="sm" className="mr-2" />
                {language === 'me' ? 'Шаље се...' : 'Submitting...'}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {t('submit') || 'Submit Pharmacy'}
                <span className="text-lg">→</span>
              </span>
            )}
          </button>
        </div>

        </form>
      </div>
    </div>
  )
}