import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Ad, ApiResponse, PaginatedResponse, PaginationParams, PaginationState } from './types'

interface AdsState {
  ads: Ad[]
  loading: boolean
  error: string | null
  selectedAd: Ad | null
  pagination: PaginationState
}

const initialState: AdsState = {
  ads: [],
  loading: false,
  error: null,
  selectedAd: null,
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
export const fetchAds = createAsyncThunk(
  'ads/fetchAds',
  async (params: PaginationParams = { page: 1, limit: 20 }) => {
    const searchParams = new URLSearchParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
    })
    const response = await fetch(`${API_BASE}/ads/all?${searchParams}`, {
      headers: {
        'x-admin-key': ADMIN_KEY,
      },
    })
    const data: PaginatedResponse<Ad> = await response.json()
    if (!data.success) throw new Error(data.message)
    return data
  }
)

export const createAd = createAsyncThunk(
  'ads/createAd',
  async (adData: Omit<Ad, 'id' | 'createdAt' | 'updatedAt' | 'click_count' | 'impression_count'>) => {
    const response = await fetch(`${API_BASE}/ads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_KEY,
      },
      body: JSON.stringify(adData),
    })
    const data: ApiResponse<Ad> = await response.json()
    if (!data.success) throw new Error(data.message)
    return data.data
  }
)

export const updateAd = createAsyncThunk(
  'ads/updateAd',
  async ({ id, ...adData }: Partial<Ad> & { id: number }) => {
    const response = await fetch(`${API_BASE}/ads/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_KEY,
      },
      body: JSON.stringify(adData),
    })
    const data: ApiResponse<Ad> = await response.json()
    if (!data.success) throw new Error(data.message)
    return data.data
  }
)

export const deleteAd = createAsyncThunk(
  'ads/deleteAd',
  async (id: number) => {
    const response = await fetch(`${API_BASE}/ads/${id}`, {
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

const adsSlice = createSlice({
  name: 'ads',
  initialState,
  reducers: {
    setSelectedAd: (state, action: PayloadAction<Ad | null>) => {
      state.selectedAd = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch ads
      .addCase(fetchAds.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAds.fulfilled, (state, action) => {
        state.loading = false
        state.ads = action.payload.data
        state.pagination = {
          currentPage: action.payload.meta.pagination.currentPage,
          totalPages: action.payload.meta.pagination.totalPages,
          totalItems: action.payload.meta.pagination.total,
          itemsPerPage: action.payload.meta.pagination.limit,
          hasNextPage: action.payload.meta.pagination.hasNextPage,
          hasPrevPage: action.payload.meta.pagination.hasPrevPage,
        }
      })
      .addCase(fetchAds.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch ads'
      })
      // Create ad
      .addCase(createAd.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createAd.fulfilled, (state, action) => {
        state.loading = false
        state.ads.push(action.payload)
      })
      .addCase(createAd.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create ad'
      })
      // Update ad
      .addCase(updateAd.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateAd.fulfilled, (state, action) => {
        state.loading = false
        const index = state.ads.findIndex(a => a.id === action.payload.id)
        if (index !== -1) {
          state.ads[index] = action.payload
        }
        if (state.selectedAd?.id === action.payload.id) {
          state.selectedAd = action.payload
        }
      })
      .addCase(updateAd.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update ad'
      })
      // Delete ad
      .addCase(deleteAd.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteAd.fulfilled, (state, action) => {
        state.loading = false
        state.ads = state.ads.filter(a => a.id !== action.payload)
        if (state.selectedAd?.id === action.payload) {
          state.selectedAd = null
        }
        // Update pagination total
        state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1)
      })
      .addCase(deleteAd.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete ad'
      })
  },
})

export const { setSelectedAd, clearError } = adsSlice.actions
export default adsSlice.reducer