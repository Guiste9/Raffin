import { useWallet } from '../hooks/useWallet'
import { useNavigate } from 'react-router-dom'
import { useAllProperties } from '../hooks/useGraph'
import { formatEther } from 'viem'
import { ipfsToHttp } from '../lib/pinata'

export default function DashboardPage() {
  const { address, balance, disconnect } = useWallet()
  const navigate = useNavigate()
  const { properties, isLoading: propertiesLoading } = useAllProperties()

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

        {propertiesLoading ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1,2,3].map(i => (
      <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 animate-pulse">
        <div className="h-48 bg-gray-800 rounded-xl mb-4" />
        <div className="h-4 bg-gray-800 rounded w-2/3 mb-2" />
        <div className="h-3 bg-gray-800 rounded w-1/2" />
      </div>
    ))}
  </div>
) : properties.length === 0 ? (
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
    <p className="text-gray-500">Nenhum imóvel disponível ainda.</p>
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {properties.map((property) => (
      <div
        key={property.id}
        className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-indigo-500 transition-colors cursor-pointer group"
        onClick={() => navigate(`/property/${property.address}`)}
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={ipfsToHttp(property.propertyImageIPFS)}
            alt={property.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg">
            {property.symbol}
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-semibold text-white text-lg mb-1">{property.name}</h3>
          <p className="text-gray-400 text-sm mb-3">📍 {property.propertyAddress}</p>
          <p className="text-gray-500 text-sm mb-4 line-clamp-2">{property.propertyDescription}</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Preço por cota</p>
              <p className="text-indigo-400 font-bold">
                {formatEther(BigInt(property.pricePerShare))} ETH
              </p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-lg ${
              property.saleActive
                ? 'bg-emerald-900 text-emerald-400'
                : 'bg-gray-800 text-gray-400'
            }`}>
              {property.saleActive ? 'Venda ativa' : 'Inativa'}
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
)}
      </main>
    </div>
  )
}