import type {
  Pharmacy,
  City,
  Medicine,
  Ad,
  PharmacySubmissionData,
  ApiResponse
} from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>
}

class ApiService {
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  // Cities
  async getCities(): Promise<City[]> {
    const response = await this.request<City[]>('/cities')
    return response.data || []
  }

  async getCityById(id: number): Promise<City> {
    const response = await this.request<City>(`/cities/${id}`)
    return response.data
  }

  async getCityBySlug(slug: string): Promise<City> {
    const response = await this.request<City>(`/cities/slug/${slug}`)
    return response.data
  }

  // Pharmacies
  async getPharmacies(params: Record<string, any> = {}): Promise<Pharmacy[]> {
    const queryParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value.toString())
      }
    })

    const response = await this.request<Pharmacy[]>(`/pharmacies?${queryParams}`)
    return response.data || []
  }

  async getPharmacyById(id: number): Promise<Pharmacy> {
    const response = await this.request<Pharmacy>(`/pharmacies/${id}`)
    return response.data
  }

  async getNearbyPharmacies(lat: number, lng: number, radius: number = 10): Promise<Pharmacy[]> {
    const response = await this.request<Pharmacy[]>(`/pharmacies/nearby/${lat}/${lng}?radius=${radius}`)
    return response.data || []
  }

  // Medicines
  async getMedicines(params: Record<string, any> = {}): Promise<Medicine[]> {
    const queryParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value.toString())
      }
    })

    const response = await this.request<Medicine[]>(`/medicines?${queryParams}`)
    return response.data || []
  }

  async getMedicineById(id: number): Promise<Medicine> {
    const response = await this.request<Medicine>(`/medicines/${id}`)
    return response.data
  }

  async searchMedicines(searchTerm: string): Promise<Medicine[]> {
    const response = await this.request<Medicine[]>(`/medicines/search?q=${encodeURIComponent(searchTerm)}`)
    return response.data || []
  }

  // Submissions
  async createSubmission(submissionData: PharmacySubmissionData): Promise<any> {
    const response = await this.request<any>('/pharmacy-submissions', {
      method: 'POST',
      body: JSON.stringify(submissionData),
    })
    return response.data
  }

  // Admin submissions
  async getSubmissions(adminKey: string): Promise<any[]> {
    const response = await this.request<any[]>('/pharmacy-submissions', {
      headers: {
        'x-admin-key': adminKey
      }
    })
    return response.data || []
  }

  async updateSubmissionStatus(id: string, status: string, adminKey: string): Promise<any> {
    const response = await this.request<any>(`/pharmacy-submissions/${id}`, {
      method: 'PUT',
      headers: {
        'x-admin-key': adminKey
      },
      body: JSON.stringify({ status })
    })
    return response.data
  }

  // Ads
  async getActiveAds(): Promise<Ad[]> {
    const response = await this.request<Ad[]>('/ads')
    return response.data || []
  }
}

export const apiService = new ApiService()
export default apiService