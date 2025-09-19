import { useState, useEffect } from 'react'
import { apiService } from '../config/api'
import { useTranslation } from '../translations'
import { useAppSelector } from '../hooks/redux'
import LoadingSpinner from './ui/LoadingSpinner'
import ErrorMessage from './ui/ErrorMessage'

export default function PharmacySubmissionForm(): React.JSX.Element {
  const { language } = useAppSelector(state => state.ui)
  const { cities, selectedCity } = useAppSelector(state => state.pharmacy)
  const t = useTranslation(language)

  // Local state for submission
  const [submissionLoading, setSubmissionLoading] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [submissionSuccess, setSubmissionSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name_me: '',
    name_en: '',
    address: '',
    city_slug: selectedCity?.slug || '',
    phone: '',
    website: '',
    email: '',
    lat: '',
    lng: '',
    is_24h: false,
    open_sunday: false,
    hours_monfri: '',
    hours_sat: '',
    hours_sun: '',
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
        name_me: '',
        name_en: '',
        address: '',
        city_slug: selectedCity?.slug || '',
        phone: '',
        website: '',
        email: '',
        lat: '',
        lng: '',
        is_24h: false,
        open_sunday: false,
        hours_monfri: '',
        hours_sat: '',
        hours_sun: '',
        notes: ''
      })
      // Clear success message after 5 seconds
      const timeout = setTimeout(() => {
        setSubmissionSuccess(false)
      }, 5000)
      return () => clearTimeout(timeout)
    }
  }, [submissionSuccess, selectedCity])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear any previous errors
    setSubmissionError(null)
    setSubmissionLoading(true)

    try {
      // Convert lat/lng to numbers
      const submissionData = {
        ...formData,
        lat: parseFloat(formData.lat) || 0,
        lng: parseFloat(formData.lng) || 0
      }

      await apiService.createSubmission(submissionData)
      setSubmissionSuccess(true)
    } catch (error: any) {
      setSubmissionError(error.message || 'Failed to submit pharmacy')
    } finally {
      setSubmissionLoading(false)
    }
  }

  return (
    <div className="bg-background border border-gray-200 rounded-xl shadow-lg">
      <div className="p-8 border-b border-gray-200 bg-background-secondary">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary bg-opacity-10 rounded-lg">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-3">
              {t('submitPharmacy') || 'Add New Pharmacy'}
            </h2>
            <p className="text-text-secondary leading-relaxed">
              {t('submitPharmacySubtitle') || 'Help us expand our pharmacy network in Montenegro. Your contribution makes a difference!'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">

        {/* Success Message */}
        {submissionSuccess && (
          <div className="p-6 mb-8 bg-success bg-opacity-10 border border-success border-opacity-20 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-success text-white rounded-full flex items-center justify-center text-lg">
                ✓
              </div>
              <div>
                <h3 className="font-semibold text-success text-lg">{t('success') || 'Success!'}</h3>
                <p className="text-sm text-success opacity-90">
                  {language === 'me' ? 'Hvala! Vaš zahtjev je uspješno poslat.' : 'Thank you! Your request has been submitted successfully.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {submissionError && (
          <ErrorMessage
            error={submissionError}
            onRetry={() => setSubmissionError(null)}
            className="mb-6"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name_me" className="block text-sm font-semibold text-text-primary mb-3">
                {t('pharmacyName')} (Montenegrin) <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="name_me"
                name="name_me"
                value={formData.name_me}
                onChange={handleChange}
                required
                placeholder="Naziv apoteke na crnogorskom"
                className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background text-text-primary placeholder:text-text-tertiary"
              />
            </div>

            <div>
              <label htmlFor="name_en" className="block text-sm font-semibold text-text-primary mb-3">
                {t('pharmacyName')} (English)
              </label>
              <input
                type="text"
                id="name_en"
                name="name_en"
                value={formData.name_en}
                onChange={handleChange}
                placeholder="Pharmacy name in English"
                className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background text-text-primary placeholder:text-text-tertiary"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-3">
              {t('pharmacyEmail')} <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="contact@pharmacy.com"
              className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background text-text-primary placeholder:text-text-tertiary"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-semibold text-text-primary mb-3">
              {t('pharmacyAddress')} <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Enter complete address"
              className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background text-text-primary placeholder:text-text-tertiary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="lat" className="block text-sm font-semibold text-text-primary mb-3">
                Latitude
              </label>
              <input
                type="number"
                step="0.000001"
                id="lat"
                name="lat"
                value={formData.lat}
                onChange={handleChange}
                placeholder="42.441180"
                className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background text-text-primary placeholder:text-text-tertiary"
              />
              <p className="text-xs text-text-secondary mt-2">GPS coordinate (e.g., 42.441180)</p>
            </div>

            <div>
              <label htmlFor="lng" className="block text-sm font-semibold text-text-primary mb-3">
                Longitude
              </label>
              <input
                type="number"
                step="0.000001"
                id="lng"
                name="lng"
                value={formData.lng}
                onChange={handleChange}
                placeholder="19.262112"
                className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background text-text-primary placeholder:text-text-tertiary"
              />
              <p className="text-xs text-text-secondary mt-2">GPS coordinate (e.g., 19.262112)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="city_slug" className="block text-sm font-semibold text-text-primary mb-3">
                City <span className="text-danger">*</span>
              </label>
              <select
                id="city_slug"
                name="city_slug"
                value={formData.city_slug}
                onChange={handleChange}
                required
                className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background text-text-primary"
              >
                <option value="">Select city</option>
                {cities.map(city => (
                  <option key={city.slug} value={city.slug}>
                    {language === 'me' ? city.name_me : city.name_en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-text-primary mb-3">
                {t('pharmacyPhone')}
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+382 XX XXX XXX"
                className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background text-text-primary placeholder:text-text-tertiary"
              />
            </div>
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-semibold text-text-primary mb-3">
              {t('pharmacyWebsite')}
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example-pharmacy.com"
              className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background text-text-primary placeholder:text-text-tertiary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-primary mb-4">Operating Hours</label>

            {/* Quick Options */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-card-hover transition-all duration-200">
                <input
                  type="checkbox"
                  name="is_24h"
                  checked={formData.is_24h}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary bg-background border-gray-200 rounded focus:ring-primary"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-text-primary">{t('is24hours') || '24/7 Operation'}</span>
                  <p className="text-xs text-text-secondary mt-1">Open 24 hours, 7 days a week</p>
                </div>
              </label>

              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-card-hover transition-all duration-200">
                <input
                  type="checkbox"
                  name="open_sunday"
                  checked={formData.open_sunday}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary bg-background border-gray-200 rounded focus:ring-primary"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-text-primary">{t('openOnSunday') || 'Open on Sundays'}</span>
                  <p className="text-xs text-text-secondary mt-1">Available on Sunday</p>
                </div>
              </label>
            </div>

            {/* Detailed Hours */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="hours_monfri" className="block text-sm font-semibold text-text-primary mb-3">
                  Monday - Friday <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="hours_monfri"
                  name="hours_monfri"
                  value={formData.hours_monfri}
                  onChange={handleChange}
                  required
                  placeholder="08:00 - 20:00"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background text-text-primary placeholder:text-text-tertiary"
                />
              </div>

              <div>
                <label htmlFor="hours_sat" className="block text-sm font-semibold text-text-primary mb-3">
                  Saturday <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="hours_sat"
                  name="hours_sat"
                  value={formData.hours_sat}
                  onChange={handleChange}
                  required
                  placeholder="08:00 - 16:00"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background text-text-primary placeholder:text-text-tertiary"
                />
              </div>

              <div>
                <label htmlFor="hours_sun" className="block text-sm font-semibold text-text-primary mb-3">
                  Sunday <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="hours_sun"
                  name="hours_sun"
                  value={formData.hours_sun}
                  onChange={handleChange}
                  required
                  placeholder="Closed or 10:00 - 14:00"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background text-text-primary placeholder:text-text-tertiary"
                />
              </div>
            </div>
            <p className="text-xs text-text-secondary mt-2">
              Enter hours in format "08:00 - 20:00" or "Closed" if not open
            </p>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-semibold text-text-primary mb-3">
              {t('additionalNotes') || 'Additional Information'}
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Any additional information about the pharmacy..."
              className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background text-text-primary placeholder:text-text-tertiary resize-none"
            />
          </div>

          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={submissionLoading}
              className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-hover active:bg-primary-active text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
            >
              {submissionLoading ? (
                <span className="flex items-center justify-center">
                  <LoadingSpinner size="sm" className="mr-3" />
                  {language === 'me' ? 'Submitting...' : 'Submitting...'}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
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