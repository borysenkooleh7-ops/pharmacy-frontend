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
    <div className="relative bg-gradient-to-br from-primary via-primary-hover to-purple-600 text-white rounded-2xl p-8 md:p-12 shadow-2xl overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full translate-y-12 -translate-x-12"></div>

      <div className="relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-primary-light bg-clip-text text-transparent">
            {t('benefitsTitle') || 'Why Choose Apoteka24.me?'}
          </h2>
          <p className="text-white text-opacity-90 text-lg md:text-xl max-w-2xl mx-auto">
            {t('benefitsSubtitle') || 'Your trusted pharmacy finder in Montenegro'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center group relative">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white bg-opacity-20 backdrop-blur-sm rounded-3xl mb-6 group-hover:bg-opacity-30 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg">
                <div className="text-white group-hover:scale-110 transition-transform duration-300">
                  {benefit.icon}
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-4 group-hover:text-primary-light transition-colors duration-300">
                {t(benefit.titleKey) || `Benefit ${index + 1}`}
              </h3>
              <p className="text-white text-opacity-90 leading-relaxed text-base md:text-lg">
                {t(benefit.textKey) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
              </p>

              {/* Decorative element */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-light opacity-20 rounded-full group-hover:opacity-40 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-white bg-opacity-20 backdrop-blur-md rounded-full border border-white border-opacity-20 shadow-xl hover:bg-opacity-30 transition-all duration-300">
            <div className="relative">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-success rounded-full animate-ping opacity-75"></div>
            </div>
            <span className="text-sm md:text-base font-semibold">
              {t('liveDataUpdate') || 'Live pharmacy data - Updated daily'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}