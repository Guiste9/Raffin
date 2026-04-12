import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './lib/wagmi'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import ConnectPage from './pages/ConnectPage'
import PropertyPage from './pages/PropertyPage'
import CreatePropertyPage from './pages/CreatePropertyPage'
import ProfilePage from './pages/ProfilePage'
import BookingPage from './pages/BookingPage'
import MyPropertiesPage from './pages/MyPropertiesPage'

const queryClient = new QueryClient()

function AppRoutes() {
  const { isConnected } = useAccount()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/property/:id/book" element={isConnected ? <BookingPage /> : <Navigate to="/connect" />} />
        <Route path="/profile" element={isConnected ? <ProfilePage /> : <Navigate to="/connect" />} />
        <Route path="/property/create" element={isConnected ? <CreatePropertyPage /> : <Navigate to="/connect" />} />
        <Route path="/property/:id" element={isConnected ? <PropertyPage /> : <Navigate to="/connect" />} />
        <Route path="/my-properties" element={isConnected ? <MyPropertiesPage /> : <Navigate to="/connect" />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/connect" element={
          isConnected ? <Navigate to="/dashboard" /> : <ConnectPage />
        } />
        <Route path="/dashboard" element={
          isConnected ? <DashboardPage /> : <Navigate to="/connect" />
        } />
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppRoutes />
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App