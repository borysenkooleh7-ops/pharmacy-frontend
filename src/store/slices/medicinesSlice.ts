import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Medicine, ApiResponse, PaginatedResponse, PaginationParams, PaginationState } from './types'

interface MedicinesState {
  medicines: Medicine[]
  loading: boolean
  error: string | null
  selectedMedicine: Medicine | null
  pagination: PaginationState
}

const initialState: MedicinesState = {
  medicines: [],
  loading: false,
  error: null,
  selectedMedicine: null,
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
export const fetchMedicines = createAsyncThunk(
  'medicines/fetchMedicines',
  async (params: PaginationParams = { page: 1, limit: 20 }) => {
    const searchParams = new URLSearchParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
    })
    const response = await fetch(`${API_BASE}/medicines?${searchParams}`, {
      headers: {
        'x-admin-key': ADMIN_KEY,
      },
    })
    const data: PaginatedResponse<Medicine> = await response.json()
    if (!data.success) throw new Error(data.message)
    return data
  }
)

export const createMedicine = createAsyncThunk(
  'medicines/createMedicine',
  async (medicineData: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await fetch(`${API_BASE}/medicines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_KEY,
      },
      body: JSON.stringify(medicineData),
    })
    const data: ApiResponse<Medicine> = await response.json()
    if (!data.success) throw new Error(data.message)
    return data.data
  }
)

export const updateMedicine = createAsyncThunk(
  'medicines/updateMedicine',
  async ({ id, ...medicineData }: Partial<Medicine> & { id: number }) => {
    const response = await fetch(`${API_BASE}/medicines/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_KEY,
      },
      body: JSON.stringify(medicineData),
    })
    const data: ApiResponse<Medicine> = await response.json()
    if (!data.success) throw new Error(data.message)
    return data.data
  }
)

export const deleteMedicine = createAsyncThunk(
  'medicines/deleteMedicine',
  async (id: number) => {
    const response = await fetch(`${API_BASE}/medicines/${id}`, {
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

const medicinesSlice = createSlice({
  name: 'medicines',
  initialState,
  reducers: {
    setSelectedMedicine: (state, action: PayloadAction<Medicine | null>) => {
      state.selectedMedicine = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch medicines
      .addCase(fetchMedicines.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMedicines.fulfilled, (state, action) => {
        state.loading = false
        state.medicines = action.payload.data
        state.pagination = {
          currentPage: action.payload.meta.pagination.currentPage,
          totalPages: action.payload.meta.pagination.totalPages,
          totalItems: action.payload.meta.pagination.total,
          itemsPerPage: action.payload.meta.pagination.limit,
          hasNextPage: action.payload.meta.pagination.hasNextPage,
          hasPrevPage: action.payload.meta.pagination.hasPrevPage,
        }
      })
      .addCase(fetchMedicines.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch medicines'
      })
      // Create medicine
      .addCase(createMedicine.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createMedicine.fulfilled, (state, action) => {
        state.loading = false
        state.medicines.push(action.payload)
      })
      .addCase(createMedicine.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create medicine'
      })
      // Update medicine
      .addCase(updateMedicine.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateMedicine.fulfilled, (state, action) => {
        state.loading = false
        const index = state.medicines.findIndex(m => m.id === action.payload.id)
        if (index !== -1) {
          state.medicines[index] = action.payload
        }
        if (state.selectedMedicine?.id === action.payload.id) {
          state.selectedMedicine = action.payload
        }
      })
      .addCase(updateMedicine.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update medicine'
      })
      // Delete medicine
      .addCase(deleteMedicine.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteMedicine.fulfilled, (state, action) => {
        state.loading = false
        state.medicines = state.medicines.filter(m => m.id !== action.payload)
        if (state.selectedMedicine?.id === action.payload) {
          state.selectedMedicine = null
        }
        // Update pagination total
        state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1)
      })
      .addCase(deleteMedicine.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete medicine'
      })
  },
})

export const { setSelectedMedicine, clearError } = medicinesSlice.actions
export default medicinesSlice.reducer