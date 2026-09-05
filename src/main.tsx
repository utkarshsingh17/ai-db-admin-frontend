import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import './styles/global.css'
import { AuthProvider } from './auth/AuthContext'
import { BackendReadinessGate } from './components/BackendReadinessGate'
import App from './App'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <BackendReadinessGate>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BackendReadinessGate>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
