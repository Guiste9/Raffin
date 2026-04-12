import { useWallet } from '../hooks/useWallet'
import { useNavigate } from 'react-router-dom'
import PropertyCard from '../Components/PropertyCard'

const MOCK_PROPERTIES = [
  {
    id: '1',
    name: 'Apartamento Meireles',
    description: 'Apartamento de luxo com vista para o mar, 3 quartos, varanda gourmet e lazer completo.',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    pricePerShare: '0.05',
    availableShares: 12,
    totalShares: 20,
    location: 'Fortaleza, CE',
  },
  {
    id: '2',
    name: 'Casa Guarajuba',
    description: 'Casa de praia espaçosa com piscina privativa, 4 quartos e acesso direto à praia.',
    imageUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800',
    pricePerShare: '0.08',
    availableShares: 5,
    totalShares: 20,
    location: 'Guarajuba, BA',
  },
  {
    id: '3',
    name: 'Cobertura Ponta Verde',
    description: 'Cobertura duplex com terraço, churrasqueira e vista panorâmica da cidade.',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    pricePerShare: '0.12',
    availableShares: 18,
    totalShares: 20,
    location: 'Maceió, AL',
  },
]

export default function DashboardPage() {
  const { address, balance, disconnect } = useWallet()
  const navigate = useNavigate()

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : ''

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1
          className="text-xl font-bold text-indigo-400 cursor-pointer"
          onClick={() => navigate('/')}
        >
          RaffChain
        </h1>
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/my-properties')} className="text-sm text-gray-400 hover:text-white transition-colors">
            Meus imóveis
          </button>
          <button className="text-sm text-gray-400 hover:text-white transition-colors">
            Minhas cotas
          </button>
          <button onClick={() => navigate('/profile')} className="text-sm text-gray-400hover:text-white transition-colors">
            Meu perfil
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-gray-800">
            <div className="text-right">
              <p className="text-xs text-gray-400">{shortAddress}</p>
              <p className="text-xs text-emerald-400">{balance}</p>
            </div>
            <button
              onClick={() => disconnect()}
              className="py-2 px-4 bg-gray-800 hover:bg-gray-700 text-sm text-white rounded-lg transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">Saldo</p>
            <p className="text-2xl font-bold text-white">{balance}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">Minhas cotas</p>
            <p className="text-2xl font-bold text-white">—</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">Renda pendente</p>
            <p className="text-2xl font-bold text-emerald-400">—</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Imóveis disponíveis</h2>
          <button
            onClick={() => navigate('/property/create')}
            className="py-2 px-5 bg-indigo-600 hover:bg-indigo-500 text-sm font-medium rounded-xl transition-colors"
          >
            + Tokenizar imóvel
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_PROPERTIES.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      </main>
    </div>
  )
}