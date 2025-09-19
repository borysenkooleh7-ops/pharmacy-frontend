import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Pharmacy, ApiResponse, PaginatedResponse, PaginationParams, PaginationState } from './types'

interface PharmaciesState {
  pharmacies: Pharmacy[]
  loading: boolean
  error: string | null
  selectedPharmacy: Pharmacy | null
  pagination: PaginationState
}

const initialState: PharmaciesState = {
  pharmacies: [],
  loading: false,
  error: null,
  selectedPharmacy: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
    hasNextPage: false,
    hasPrevPage: false,
  },
}

const API_BASE = 'http://localhost:5000/api'
const ADMIN_KEY = 'admin123'

// Async thunks
export const fetchPharmacies = createAsyncThunk(
  'pharmacies/fetchPharmacies',
  async (params: PaginationParams = { page: 1, limit: 20 }) => {
    const searchParams = new URLSearchParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
    })
    const response = await fetch(`${API_BASE}/pharmacies?${searchParams}`, {
      headers: {
        'x-admin-key': ADMIN_KEY,
      },
    })
    const data: PaginatedResponse<Pharmacy> = await response.json()
    if (!data.success) throw new Error(data.message)
    return data
  }
)

export const createPharmacy = createAsyncThunk(
  'pharmacies/createPharmacy',
  async (pharmacyData: Omit<Pharmacy, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await fetch(`${API_BASE}/pharmacies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_KEY,
      },
      body: JSON.stringify(pharmacyData),
    })
    const data: ApiResponse<Pharmacy> = await response.json()
    if (!data.success) throw new Error(data.message)
    return data.data
  }
)

export const updatePharmacy = createAsyncThunk(
  'pharmacies/updatePharmacy',
  async ({ id, ...pharmacyData }: Partial<Pharmacy> & { id: number }) => {
    const response = await fetch(`${API_BASE}/pharmacies/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_KEY,
      },
      body: JSON.stringify(pharmacyData),
    })
    const data: ApiResponse<Pharmacy> = await response.json()
    if (!data.success) throw new Error(data.message)
    return data.data
  }
)

export const deletePharmacy = createAsyncThunk(
  'pharmacies/deletePharmacy',
  async (id: number) => {
    const response = await fetch(`${API_BASE}/pharmacies/${id}`, {
      method: 'DELETE',
      headers: {
        'x-admin-key': ADMIN_KEY,
      },
    })
    const data: ApiResponse<null> = await response.json()
    if (!data.success) throw new Error(data.message)
    return id
  }
)

const pharmaciesSlice = createSlice({
  name: 'pharmacies',
  initialState,
  reducers: {
    setSelectedPharmacy: (state, action: PayloadAction<Pharmacy | null>) => {
      state.selectedPharmacy = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch pharmacies
      .addCase(fetchPharmacies.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPharmacies.fulfilled, (state, action) => {
        state.loading = false
        state.pharmacies = action.payload.data
        state.pagination = {
          currentPage: action.payload.meta.pagination.currentPage,
          totalPages: action.payload.meta.pagination.totalPages,
          totalItems: action.payload.meta.pagination.total,
          itemsPerPage: action.payload.meta.pagination.limit,
          hasNextPage: action.payload.meta.pagination.hasNextPage,
          hasPrevPage: action.payload.meta.pagination.hasPrevPage,
        }
      })
      .addCase(fetchPharmacies.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch pharmacies'
      })
      // Create pharmacy
      .addCase(createPharmacy.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createPharmacy.fulfilled, (state, action) => {
        state.loading = false
        state.pharmacies.push(action.payload)
      })
      .addCase(createPharmacy.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create pharmacy'
      })
      // Update pharmacy
      .addCase(updatePharmacy.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updatePharmacy.fulfilled, (state, action) => {
        state.loading = false
        const index = state.pharmacies.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.pharmacies[index] = action.payload
        }
        if (state.selectedPharmacy?.id === action.payload.id) {
          state.selectedPharmacy = action.payload
        }
      })
      .addCase(updatePharmacy.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update pharmacy'
      })
      // Delete pharmacy
      .addCase(deletePharmacy.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deletePharmacy.fulfilled, (state, action) => {
        state.loading = false
        state.pharmacies = state.pharmacies.filter(p => p.id !== action.payload)
        if (state.selectedPharmacy?.id === action.payload) {
          state.selectedPharmacy = null
        }
        // Update pagination total
        state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1)
      })
      .addCase(deletePharmacy.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete pharmacy'
      })
  },
})

export const { setSelectedPharmacy, clearError } = pharmaciesSlice.actions
export default pharmaciesSlice.reducer