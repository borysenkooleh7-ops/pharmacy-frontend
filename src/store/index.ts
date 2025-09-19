import { configureStore } from '@reduxjs/toolkit'
import pharmacySlice from './pharmacySlice'
import uiSlice from './uiSlice'
import adSlice from './adSlice'
import pharmaciesSlice from './slices/pharmaciesSlice'
import medicinesSlice from './slices/medicinesSlice'
import adsSlice from './slices/adsSlice'
import submissionsSlice from './slices/submissionsSlice'

export const store = configureStore({
  reducer: {
    pharmacy: pharmacySlice,
    ui: uiSlice,
    ads: adSlice,
    adminPharmacies: pharmaciesSlice,
    adminMedicines: medicinesSlice,
    adminAds: adsSlice,
    adminSubmissions: submissionsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

// TypeScript types
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch