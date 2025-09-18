import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { UserLocation, Pharmacy } from '@/types'

interface UiState {
  language: 'me' | 'en'
  mapExpanded: boolean
  selectedPharmacy: Pharmacy | null
  userLocation: UserLocation | null
  isLoadingLocation: boolean
}

const initialState: UiState = {
  language: 'me',
  mapExpanded: false,
  selectedPharmacy: null,
  userLocation: null,
  isLoadingLocation: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<'me' | 'en'>) => {
      state.language = action.payload
    },
    toggleMapExpanded: (state) => {
      state.mapExpanded = !state.mapExpanded
    },
    setSelectedPharmacy: (state, action: PayloadAction<Pharmacy | null>) => {
      state.selectedPharmacy = action.payload
    },
    setUserLocation: (state, action: PayloadAction<UserLocation | null>) => {
      state.userLocation = action.payload
    },
    setLoadingLocation: (state, action: PayloadAction<boolean>) => {
      state.isLoadingLocation = action.payload
    },
  },
})

export const {
  setLanguage,
  toggleMapExpanded,
  setSelectedPharmacy,
  setUserLocation,
  setLoadingLocation
} = uiSlice.actions

export default uiSlice.reducer