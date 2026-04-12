import { useNavigate } from 'react-router-dom'
import { formatEther } from 'viem'
import { useWallet } from '../hooks/useWallet'
import { getStoredProperties, usePropertyDetails } from '../hooks/useMyProperties'
import { ipfsToHttp } from '../lib/pinata'

function PropertyCard({ address }: { address: `0x${string}` }) {
  const navigate = useNavigate()
  const {
    name,
    totalShares,
    availableShares,
    pricePerShare,
    propertyDescription,
    propertyAddress: location,
    propertyImageIPFS,
    saleActive,
  } = usePropertyDetails(address)

  const soldShares = totalShares && availableShares !== undefined
    ? totalShares - availableShares
    : 0

  const occupancyPercent = totalShares
    ? Math.round((soldShares / totalShares) * 100)
    : 0

  const imageUrl = propertyImageIPFS
    ? ipfsToHttp(propertyImageIPFS)
    : 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'

  if (!name) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 animate-pulse">
        <div className="h-48 bg-gray-800 rounded-xl mb-4" />
        <div className="h-4 bg-gray-800 rounded w-2/3 mb-2" />
        <div className="h-3 bg-gray-800 rounded w-1/2" />
      </div>
    )
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-indigo-500 transition-colors">
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <span className={`text-xs px-2 py-1 rounded-lg ${saleActive ? 'bg-emerald-900 text-emerald-400' : 'bg-gray-800 text-gray-400'}`}>
            {saleActive ? 'Venda ativa' : 'Venda inativa'}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-white text-lg mb-1">{name}</h3>
        <p className="text-gray-400 text-sm mb-1">📍 {location}</p>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{propertyDescription}</p>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gray-800 rounded-lg p-2 text-center">
            <p className="text-indigo-400 font-bold">{availableShares ?? '—'}</p>
            <p className="text-xs text-gray-500">Disponíveis</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-2 text-center">
            <p className="text-white font-bold">{totalShares ?? '—'}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-2 text-center">
            <p className="text-emerald-400 font-bold">{occupancyPercent}%</p>
            <p className="text-xs text-gray-500">Vendido</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progresso de vendas</span>
            <span>{occupancyPercent}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1.5">
            <div
              className="bg-indigo-500 h-1.5 rounded-full transition-all"
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Preço por cota</p>
            <p className="text-indigo-400 font-bold">
              {pricePerShare ? formatEther(pricePerShare) : '—'} ETH
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/my-properties/${address}`)}
              className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Gerenciar
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-600 mt-3 font-mono truncate">
          {address}
        </p>
      </div>
    </div>
  )
}

export default function MyPropertiesPage() {
  const navigate = useNavigate()
  const { address, balance, disconnect } = useWallet()
  const myProperties = getStoredProperties()

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
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Imóveis
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Meu perfil
          </button>
          <button className="text-sm text-white font-medium border-b border-indigo-400 pb-0.5">
            Meus imóveis
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">Meus imóveis</h2>
            <p className="text-gray-400">Imóveis que você tokenizou na blockchain</p>
          </div>
          <button
            onClick={() => navigate('/property/create')}
            className="py-2 px-5 bg-indigo-600 hover:bg-indigo-500 text-sm font-medium rounded-xl transition-colors"
          >
            + Tokenizar imóvel
          </button>
        </div>

        {myProperties.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center">
            <p className="text-gray-500 text-lg mb-2">Você ainda não tokenizou nenhum imóvel.</p>
            <p className="text-gray-600 text-sm mb-6">Crie cotas do seu imóvel e venda para investidores.</p>
            <button
              onClick={() => navigate('/property/create')}
              className="py-3 px-8 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors"
            >
              Tokenizar primeiro imóvel
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProperties.map((property) => (
              <PropertyCard key={property.address} address={property.address} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}