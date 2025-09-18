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
    <div className="bg-card border border-border-light rounded-xl shadow-lg p-10">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-text-primary mb-4">
          {t('benefitsTitle') || 'Why Choose Apoteka24.me?'}
        </h2>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
          {t('benefitsSubtitle') || 'Your trusted and comprehensive pharmacy finder in Montenegro'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {benefits.map((benefit, index) => (
          <div key={index} className="text-center group">
            <div className={`inline-flex items-center justify-center w-20 h-20 ${
              index === 0 ? 'bg-primary' :
              index === 1 ? 'bg-success' : 'bg-warning'
            } rounded-2xl mb-6 group-hover:scale-110 transition-all duration-300 shadow-md group-hover:shadow-lg`}>
              <div className="text-white group-hover:scale-110 transition-transform duration-300">
                {benefit.icon}
              </div>
            </div>
            <h3 className="text-xl font-bold mb-4 text-text-primary">
              {t(benefit.titleKey) || `Benefit ${index + 1}`}
            </h3>
            <p className="text-text-secondary leading-relaxed">
              {t(benefit.textKey) || 'Experience the best pharmacy discovery service with comprehensive information and real-time updates.'}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-14 flex justify-center">
        <div className="inline-flex items-center gap-3 px-6 py-4 bg-success text-white border-2 border-success rounded-lg hover:bg-success-hover transition-all duration-200 shadow-colored-success hover:shadow-hover">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold">
            {t('liveDataUpdate') || 'Live pharmacy data - Updated daily'}
          </span>
        </div>
      </div>
    </div>
  )
}