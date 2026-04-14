import { useNavigate, useParams } from 'react-router-dom'
import { usePropertyDetails } from '../hooks/useMyProperties'
import { formatEther } from 'viem'
import { ipfsToHttp } from '../lib/pinata'

export default function ManagePropertyPage() {
  const { address } = useParams()
  const navigate = useNavigate()
  const contractAddress = address as `0x${string}`

  const {
    name,
    totalShares,
    availableShares,
    pricePerShare,
    propertyDescription,
    propertyAddress: location,
    propertyImageIPFS,
    saleActive,
  } = usePropertyDetails(contractAddress)

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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Carregando dados da blockchain...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/my-properties')}
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          ← Voltar
        </button>
        <h1
          className="text-xl font-bold text-indigo-400 cursor-pointer"
          onClick={() => navigate('/')}
        >
          RaffChain
        </h1>
        <span className="ml-auto text-xs px-2 py-1 bg-indigo-900 text-indigo-300 rounded-lg">
          Gerenciamento
        </span>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="rounded-2xl overflow-hidden h-64 mb-4">
              <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Endereço do contrato</h3>
              <p className="font-mono text-xs text-gray-300 break-all">{contractAddress}</p>
  <a href={`https://sepolia.etherscan.io/address/${contractAddress}`} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 mt-2 block">Ver no Etherscan</a>
</div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">📍 {location}</p>
              <h2 className="text-2xl font-bold text-white mb-2">{name}</h2>
              <p className="text-gray-400 text-sm leading-relaxed">{propertyDescription}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-gray-400 text-xs mb-1">Total de cotas</p>
                <p className="text-2xl font-bold text-white">{totalShares ?? '—'}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-gray-400 text-xs mb-1">Disponíveis</p>
                <p className="text-2xl font-bold text-indigo-400">{availableShares ?? '—'}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-gray-400 text-xs mb-1">Vendidas</p>
                <p className="text-2xl font-bold text-emerald-400">{soldShares}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-gray-400 text-xs mb-1">Preço por cota</p>
                <p className="text-2xl font-bold text-white">
                  {pricePerShare ? formatEther(pricePerShare) : '—'} ETH
                </p>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Progresso de vendas</span>
                <span>{occupancyPercent}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all"
                  style={{ width: `${occupancyPercent}%` }}
                />
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">Status da venda</h3>
                <span className={`text-xs px-2 py-1 rounded-lg ${saleActive ? 'bg-emerald-900 text-emerald-400' : 'bg-red-900 text-red-400'}`}>
                  {saleActive ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              <p className="text-gray-500 text-xs">
                Para alterar o status da venda, use o Remix com o endereço do contrato acima e chame a função setSaleActive.
              </p>
            </div>

            <button
              onClick={() => navigate(`/property/${contractAddress}`)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors"
            >
              Ver página pública do imóvel
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}