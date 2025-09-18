export const translations = {
  me: {
    // Header
    slogan: 'Све апотеке Црне Горе. На једном мјесту',
    selectCity: 'Изабери град',

    // Search
    searchPlaceholder: 'Пронађи апотеку или лијек',
    medicineSearch: 'Претраживање лијекова',

    // Filters
    filter24h: '24-часовне апотеке',
    filterSunday: 'Отворено недјељом',
    filterNearby: 'Апотеке у близини',
    clearFilters: 'Очисти филтере',

    // Map
    expandMap: 'Прошири мапу',
    collapseMap: 'Скупи мапу',

    // Pharmacy details
    workingHours: 'Радно време',
    phone: 'Телефон',
    website: 'Веб сајт',
    address: 'Адреса',
    open24h: '24/7',
    openSunday: 'Недјеља',

    // Days
    monday: 'Понедељак',
    tuesday: 'Уторак',
    wednesday: 'Среда',
    thursday: 'Четвртак',
    friday: 'Петак',
    saturday: 'Субота',
    sunday: 'Недеља',

    // Form
    submitPharmacy: 'Пошаљите нам детаље апотеке ако није на мапи',
    pharmacyName: 'Назив апотеке',
    pharmacyAddress: 'Адреса',
    pharmacyPhone: 'Телефон',
    pharmacyWebsite: 'Веб сајт',
    pharmacyEmail: 'Ваш е-маил',
    is24hours: '24-часовна',
    openOnSunday: 'Отворена недјељом',
    additionalNotes: 'Додатне напомене',
    submit: 'Пошаљи',

    // Messages
    noPharmaciesFound: 'Нису пронађене апотеке',
    loading: 'Учитавање...',
    error: 'Дошло је до грешке',

    // Benefits
    benefitsTitle: 'Зашто користити Apoteka24.me?',
    benefit1Title: 'Све апотеке на једном мјесту',
    benefit1Text: 'Пронађите све апотеке у Црној Гори брзо и лако',
    benefit2Title: 'Тачне информације',
    benefit2Text: 'Радно време, контакт и локација - све тачно и ажурно',
    benefit3Title: 'Филтери за брзу претрагу',
    benefit3Text: '24/7 апотеке, отворене недјељом, у близини',

    // Navigation
    home: 'Почетна',
    addPharmacy: 'Додај апотеку',

    // Pages
    addPharmacyDescription: 'Помозите нам да направимо комплетну базу апотека у Црној Гори. Пошаљите нам информације о апотеци која није на нашој мапи.',
    submissionInfo: 'Информације о слању',
    submissionReview: 'Сви послати подаци биће прегледани пре додавања на мапу',
    submissionAccuracy: 'Молимо да унесете тачне и ажурне информације',
    submissionContact: 'Контактираћемо вас преко е-маила ако буду потребне додатне информације',
  },
  en: {
    // Header
    slogan: 'All pharmacies of Montenegro. In one place',
    selectCity: 'Select city',

    // Search
    searchPlaceholder: 'Find a pharmacy or medicine',
    medicineSearch: 'Medicine search',

    // Filters
    filter24h: '24-hour pharmacies',
    filterSunday: 'Open on Sundays',
    filterNearby: 'Nearby pharmacies',
    clearFilters: 'Clear filters',

    // Map
    expandMap: 'Expand map',
    collapseMap: 'Collapse map',

    // Pharmacy details
    workingHours: 'Working hours',
    phone: 'Phone',
    website: 'Website',
    address: 'Address',
    open24h: '24/7',
    openSunday: 'Sunday',

    // Days
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',

    // Form
    submitPharmacy: 'Send us your pharmacy details if it\'s not on the map',
    pharmacyName: 'Pharmacy name',
    pharmacyAddress: 'Address',
    pharmacyPhone: 'Phone',
    pharmacyWebsite: 'Website',
    pharmacyEmail: 'Your email',
    is24hours: '24-hour',
    openOnSunday: 'Open on Sunday',
    additionalNotes: 'Additional notes',
    submit: 'Submit',

    // Messages
    noPharmaciesFound: 'No pharmacies found',
    loading: 'Loading...',
    error: 'An error occurred',

    // Benefits
    benefitsTitle: 'Why use Apoteka24.me?',
    benefit1Title: 'All pharmacies in one place',
    benefit1Text: 'Find all pharmacies in Montenegro quickly and easily',
    benefit2Title: 'Accurate information',
    benefit2Text: 'Working hours, contact and location - all accurate and up-to-date',
    benefit3Title: 'Filters for quick search',
    benefit3Text: '24/7 pharmacies, open on Sundays, nearby',

    // Navigation
    home: 'Home',
    addPharmacy: 'Add Pharmacy',

    // Pages
    addPharmacyDescription: 'Help us create a complete database of pharmacies in Montenegro. Send us information about a pharmacy that is not on our map.',
    submissionInfo: 'Submission Information',
    submissionReview: 'All submitted data will be reviewed before being added to the map',
    submissionAccuracy: 'Please enter accurate and up-to-date information',
    submissionContact: 'We will contact you via email if additional information is needed',
  }
}

export const useTranslation = (language: 'me' | 'en') => {
  return (key: string) => {
    const translation = translations[language] as Record<string, string>
    return translation?.[key] || key
  }
}