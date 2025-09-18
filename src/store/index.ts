import { configureStore } from '@reduxjs/toolkit'
import pharmacySlice from './pharmacySlice'
import uiSlice from './uiSlice'
import adSlice from './adSlice'

export const store = configureStore({
  reducer: {
    pharmacy: pharmacySlice,
    ui: uiSlice,
    ads: adSlice,
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