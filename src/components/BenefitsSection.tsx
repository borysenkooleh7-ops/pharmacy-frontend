import { useAppSelector } from '../hooks/redux'
import { useTranslation } from '../translations'
import { AllPharmaciesIcon, AccurateIcon, FiltersIcon } from './ui/Icons'

export default function BenefitsSection(): React.JSX.Element {
  const { language } = useAppSelector(state => state.ui)
  const t = useTranslation(language)

  const benefits = [
    {
      icon: <AllPharmaciesIcon className="w-8 h-8" />,
      titleKey: 'benefit1Title',
      textKey: 'benefit1Text'
    },
    {
      icon: <AccurateIcon className="w-8 h-8" />,
      titleKey: 'benefit2Title',
      textKey: 'benefit2Text'
    },
    {
      icon: <FiltersIcon className="w-8 h-8" />,
      titleKey: 'benefit3Title',
      textKey: 'benefit3Text'
    }
  ]

  return (
    <div className="bg-gradient-to-br from-primary/5 via-white to-primary/5 rounded-xl border border-gray-200 p-8 lg:p-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {t('benefitsTitle') || 'Why Choose Apoteka24.me?'}
        </h2>
        <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
          {t('benefitsSubtitle') || 'Your most trusted and comprehensive pharmacy finder in Montenegro'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
        {benefits.map((benefit, index) => (
          <div key={index} className="relative group">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 h-full transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1">
              <div className="flex flex-col items-center text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-xl mb-6 group-hover:bg-primary/20 transition-colors">
                  <div className="text-primary group-hover:scale-110 transition-transform">
                    {benefit.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-primary transition-colors">
                  {t(benefit.titleKey) || `Benefit ${index + 1}`}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t(benefit.textKey) || 'Experience the best pharmacy discovery service with comprehensive information and real-time updates.'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <div className="bg-white rounded-full shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-emerald-700">
                Live Updates
              </span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <span className="text-sm text-gray-600 font-medium">
              {t('liveDataUpdate') || 'Pharmacy data updated daily'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}