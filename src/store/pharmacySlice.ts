import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiService } from '../config/api'
import type {
  Pharmacy,
  City,
  Medicine
} from './slices/types'

type SearchType = 'pharmacy' | 'medicine'

interface PharmacySubmissionData {
  name_me: string
  name_en?: string
  address: string
  city_slug: string
  email: string
  phone?: string
  website?: string
  lat: number
  lng: number
  hours_monfri: string
  hours_sat: string
  hours_sun: string
  is_24h: boolean
  open_sunday: boolean
  notes?: string
}

interface PharmacyFilters {
  is24h: boolean
  openSunday: boolean
  search: string
  medicineSearch: string
  nearby: boolean
  sortBy?: string
}

interface PharmacyState {
  pharmacies: Pharmacy[]
  cities: City[]
  medicines: Medicine[]
  selectedPharmacy: Pharmacy | null
  selectedCity: City | null
  searchType: SearchType
  filters: PharmacyFilters
  loading: {
    pharmacies: boolean
    cities: boolean
    medicines: boolean
    submission: boolean
  }
  error: {
    pharmacies: string | null
    cities: string | null
    medicines: string | null
    submission: string | null
  }
  submissionSuccess: boolean
}

export const fetchPharmacies = createAsyncThunk<
  Pharmacy[],
  Record<string, any>,
  { rejectValue: string }
>(
  'pharmacy/fetchPharmacies',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await apiService.getPharmacies(params)
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchCities = createAsyncThunk<
  City[],
  void,
  { rejectValue: string }
>(
  'pharmacy/fetchCities',
  async (_, { rejectWithValue }) => {
    try {
      return await apiService.getCities()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchMedicines = createAsyncThunk<
  Medicine[],
  string,
  { rejectValue: string }
>(
  'pharmacy/fetchMedicines',
  async (searchTerm, { rejectWithValue }) => {
    try {
      return await apiService.getMedicines({ search: searchTerm })
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const searchMedicines = createAsyncThunk<
  Medicine[],
  string,
  { rejectValue: string }
>(
  'pharmacy/searchMedicines',
  async (searchTerm, { rejectWithValue }) => {
    try {
      return await apiService.searchMedicines(searchTerm)
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchNearbyPharmacies = createAsyncThunk<
  Pharmacy[],
  { lat: number; lng: number; radius?: number },
  { rejectValue: string }
>(
  'pharmacy/fetchNearbyPharmacies',
  async ({ lat, lng, radius = 10 }, { rejectWithValue }) => {
    try {
      return await apiService.getNearbyPharmacies(lat, lng, radius)
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchPharmacyById = createAsyncThunk<
  Pharmacy,
  number,
  { rejectValue: string }
>(
  'pharmacy/fetchPharmacyById',
  async (id, { rejectWithValue }) => {
    try {
      return await apiService.getPharmacyById(id)
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const submitPharmacy = createAsyncThunk<
  any,
  PharmacySubmissionData,
  { rejectValue: string }
>(
  'pharmacy/submitPharmacy',
  async (submissionData, { rejectWithValue }) => {
    try {
      return await apiService.createSubmission(submissionData)
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState: PharmacyState = {
  pharmacies: [],
  cities: [],
  medicines: [],
  selectedPharmacy: null,
  selectedCity: null,
  searchType: 'pharmacy',
  filters: {
    is24h: false,
    openSunday: false,
    search: '',
    medicineSearch: '',
    nearby: false
  },
  loading: {
    pharmacies: false,
    cities: false,
    medicines: false,
    submission: false,
  },
  error: {
    pharmacies: null,
    cities: null,
    medicines: null,
    submission: null,
  },
  submissionSuccess: false,
}

const pharmacySlice = createSlice({
  name: 'pharmacy',
  initialState,
  reducers: {
    setSelectedCity: (state, action: PayloadAction<City | null>) => {
      state.selectedCity = action.payload
      state.pharmacies = []
    },
    setSelectedPharmacy: (state, action: PayloadAction<Pharmacy | null>) => {
      state.selectedPharmacy = action.payload
    },
    setSearchType: (state, action: PayloadAction<SearchType>) => {
      state.searchType = action.payload
      if (action.payload === 'pharmacy') {
        state.medicines = []
        state.filters.medicineSearch = ''
      }
    },
    updateFilters: (state, action: PayloadAction<Partial<PharmacyFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setFilters: (state, action: PayloadAction<Partial<PharmacyFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload
    },
    clearFilters: (state) => {
      state.filters = {
        is24h: false,
        openSunday: false,
        search: '',
        medicineSearch: '',
        nearby: false
      }
    },
    clearMedicines: (state) => {
      state.medicines = []
    },
    clearError: (state, action: PayloadAction<keyof PharmacyState['error']>) => {
      const errorType = action.payload
      if (errorType && state.error[errorType] !== undefined) {
        state.error[errorType] = null
      }
    },
    clearSubmissionSuccess: (state) => {
      state.submissionSuccess = false
    },
  },
  extraReducers: (builder) => {
    builder
      // Pharmacies
      .addCase(fetchPharmacies.pending, (state) => {
        state.loading.pharmacies = true
        state.error.pharmacies = null
      })
      .addCase(fetchPharmacies.fulfilled, (state, action) => {
        state.loading.pharmacies = false
        state.pharmacies = action.payload
        state.error.pharmacies = null
      })
      .addCase(fetchPharmacies.rejected, (state, action) => {
        state.loading.pharmacies = false
        state.error.pharmacies = action.payload || 'Failed to fetch pharmacies'
      })

      // Cities
      .addCase(fetchCities.pending, (state) => {
        state.loading.cities = true
        state.error.cities = null
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.loading.cities = false
        state.cities = action.payload
        state.error.cities = null
        if (!state.selectedCity && action.payload.length > 0) {
          state.selectedCity = action.payload.find(city => city.slug === 'podgorica') || action.payload[0]
        }
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.loading.cities = false
        state.error.cities = action.payload || 'Failed to fetch cities'
      })

      // Medicines
      .addCase(fetchMedicines.pending, (state) => {
        state.loading.medicines = true
        state.error.medicines = null
      })
      .addCase(fetchMedicines.fulfilled, (state, action) => {
        state.loading.medicines = false
        state.medicines = action.payload
        state.error.medicines = null
      })
      .addCase(fetchMedicines.rejected, (state, action) => {
        state.loading.medicines = false
        state.error.medicines = action.payload || 'Failed to fetch medicines'
      })

      // Search Medicines
      .addCase(searchMedicines.pending, (state) => {
        state.loading.medicines = true
        state.error.medicines = null
      })
      .addCase(searchMedicines.fulfilled, (state, action) => {
        state.loading.medicines = false
        state.medicines = action.payload
        state.error.medicines = null
      })
      .addCase(searchMedicines.rejected, (state, action) => {
        state.loading.medicines = false
        state.error.medicines = action.payload || 'Failed to search medicines'
      })

      // Nearby Pharmacies
      .addCase(fetchNearbyPharmacies.pending, (state) => {
        state.loading.pharmacies = true
        state.error.pharmacies = null
      })
      .addCase(fetchNearbyPharmacies.fulfilled, (state, action) => {
        state.loading.pharmacies = false
        state.pharmacies = action.payload
        state.filters.nearby = true
        state.error.pharmacies = null
      })
      .addCase(fetchNearbyPharmacies.rejected, (state, action) => {
        state.loading.pharmacies = false
        state.error.pharmacies = action.payload || 'Failed to fetch nearby pharmacies'
      })

      // Pharmacy Submission
      .addCase(submitPharmacy.pending, (state) => {
        state.loading.submission = true
        state.error.submission = null
        state.submissionSuccess = false
      })
      .addCase(submitPharmacy.fulfilled, (state) => {
        state.loading.submission = false
        state.error.submission = null
        state.submissionSuccess = true
      })
      .addCase(submitPharmacy.rejected, (state, action) => {
        state.loading.submission = false
        state.error.submission = action.payload || 'Failed to submit pharmacy'
        state.submissionSuccess = false
      })
  },
})

export const {
  setSelectedCity,
  setSelectedPharmacy,
  setSearchType,
  updateFilters,
  setFilters,
  setSearchTerm,
  clearFilters,
  clearMedicines,
  clearError,
  clearSubmissionSuccess
} = pharmacySlice.actions

export default pharmacySlice.reducer