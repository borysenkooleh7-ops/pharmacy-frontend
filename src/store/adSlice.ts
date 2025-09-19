import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiService } from '../config/api'
import type { Ad } from './slices/types'

interface AdState {
  ads: Ad[]
  loading: boolean
  error: string | null
}

export const fetchActiveAds = createAsyncThunk<
  Ad[],
  void,
  { rejectValue: string }
>(
  'ads/fetchActiveAds',
  async (_, { rejectWithValue }) => {
    try {
      return await apiService.getActiveAds()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState: AdState = {
  ads: [],
  loading: false,
  error: null,
}

const adSlice = createSlice({
  name: 'ads',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveAds.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchActiveAds.fulfilled, (state, action) => {
        state.loading = false
        state.ads = action.payload
        state.error = null
      })
      .addCase(fetchActiveAds.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch ads'
      })
  },
})

export const { clearError } = adSlice.actions
export default adSlice.reducer