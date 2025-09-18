import { useEffect } from 'react'
import { useAppDispatch } from '../../hooks/redux'
import { fetchCities } from '../../store/pharmacySlice'
import { fetchActiveAds } from '../../store/adSlice'
import Header from './Header'
import ErrorBoundary from '../ui/ErrorBoundary'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Load initial data
    dispatch(fetchCities())
    dispatch(fetchActiveAds())
  }, [dispatch])

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
      </div>
    </ErrorBoundary>
  )
}