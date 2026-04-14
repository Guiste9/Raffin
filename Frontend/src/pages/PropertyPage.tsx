import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet'
import { usePropertyToken } from '../hooks/usePropertyToken'
import { ipfsToHttp } from '../lib/pinata'

export default function PropertyPage() {
  const { id } = useParams()
const navigate = useNavigate()
const { address, balance } = useWallet()
const [shareAmount, setShareAmount] = useState(1)

const isRealProperty = id?.startsWith('0x') ?? false
const contractAddress = isRealProperty ? id as `0x${string}` : undefined

  const {
    name,
    totalShares,
    pricePerShare,
    availableShares,
    propertyDescription,
    propertyAddress: location,
    saleActive,
    purchaseShares,
    isPending,
    isConfirming,
    isSuccess,
    txHash,
    propertyImageIPFS,
  } = usePropertyToken(contractAddress)

  const MOCK_PROPERTIES: Record<string, any> = {
    '2': {
      name: 'Casa Guarajuba',
      description: 'Casa de praia espaçosa com piscina privativa, 4 quartos e acesso direto à praia.',
      imageUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800',
      pricePerShare: '0.08',
      availableShares: 5,
      totalShares: 20,
      location: 'Guarajuba, BA',
      amenities: ['Piscina privativa', 'Acesso à praia', '4 quartos', 'Churrasqueira'],
    },
    '3': {
      name: 'Cobertura Ponta Verde',
      description: 'Cobertura duplex com terraço, churrasqueira e vista panorâmica.',
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      pricePerShare: '0.12',
      availableShares: 18,
      totalShares: 20,
      location: 'Maceió, AL',
      amenities: ['Terraço', 'Churrasqueira', 'Vista panorâmica', 'Duplex'],
    },
  }

  const mock = id ? MOCK_PROPERTIES[id] : null

  const displayName = isRealProperty ? name : mock?.name
  const displayDescription = isRealProperty ? propertyDescription : mock?.description
  const displayLocation = isRealProperty ? location : mock?.location
  const displayTotalShares = isRealProperty ? totalShares : mock?.totalShares
  const displayAvailableShares = isRealProperty ? availableShares : mock?.availableShares
  const displayPrice = isRealProperty ? pricePerShare : mock?.pricePerShare
  const displaySaleActive = isRealProperty ? saleActive : true

  useEffect(() => {
    if (isSuccess) {
      alert('Cotas compradas com sucesso!')
    }
  }, [isSuccess])

  if (!displayName && !mock) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">Imóvel não encontrado.</p>
          <button onClick={() => navigate('/dashboard')} className="py-2 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors">
            Voltar
          </button>
        </div>
      </div>
    )
  }

  const totalCost = displayPrice
    ? (parseFloat(displayPrice) * shareAmount).toFixed(4)
    : '0'

  const occupancyPercent = displayTotalShares && displayAvailableShares !== undefined
    ? Math.round(((displayTotalShares - displayAvailableShares) / displayTotalShares) * 100)
    : 0

  const imageUrl = isRealProperty && propertyImageIPFS
    ? ipfsToHttp(propertyImageIPFS)
    : isRealProperty
    ? 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'
    : mock?.imageUrl

  const amenities = isRealProperty ? [] : mock?.amenities

  function handleBuy() {
    if (isRealProperty) {
      purchaseShares(shareAmount)
    } else {
      alert(`Compra de ${shareAmount} cota(s) simulada!`)
    }
  }

  const isLoading = isRealProperty && !displayName

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition-colors text-sm">
          ← Voltar
        </button>
        <h1 className="text-xl font-bold text-indigo-400 cursor-pointer" onClick={() => navigate('/')}>
          RaffChain
        </h1>
        {isRealProperty && (
          <span className="ml-auto text-xs px-2 py-1 bg-emerald-900 text-emerald-400 rounded-lg">
            ✓ Dados reais da blockchain
          </span>
        )}
      </nav>

      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-400">Carregando dados da blockchain...</p>
        </div>
      ) : (
        <main className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <div className="rounded-2xl overflow-hidden mb-6 h-80">
                <img src={imageUrl} alt={displayName} className="w-full h-full object-cover" />
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Comodidades</h3>
                <div className="flex flex-wrap gap-2">
                  {amenities?.map((a: string) => (
                    <span key={a} className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-lg">{a}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">📍 {displayLocation}</p>
                <h2 className="text-3xl font-bold text-white mb-3">{displayName}</h2>
                <p className="text-gray-400 leading-relaxed">{displayDescription}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-indigo-400">{displayAvailableShares ?? '—'}</p>
                  <p className="text-xs text-gray-400 mt-1">Disponíveis</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-white">{displayTotalShares ?? '—'}</p>
                  <p className="text-xs text-gray-400 mt-1">Total</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-400">{occupancyPercent}%</p>
                  <p className="text-xs text-gray-400 mt-1">Vendido</p>
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Comprar cotas</h3>
                  {isRealProperty && (
                    <span className={`text-xs px-2 py-1 rounded-lg ${displaySaleActive ? 'bg-emerald-900 text-emerald-400' : 'bg-red-900 text-red-400'}`}>
                      {displaySaleActive ? 'Venda ativa' : 'Venda inativa'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <p className="text-gray-400 text-sm">Quantidade</p>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShareAmount(Math.max(1, shareAmount - 1))} className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-bold transition-colors">−</button>
                    <span className="text-white font-bold text-lg w-6 text-center">{shareAmount}</span>
                    <button onClick={() => setShareAmount(Math.min(displayAvailableShares ?? 1, shareAmount + 1))} className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-bold transition-colors">+</button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-gray-800 mb-4">
                  <span className="text-gray-400 text-sm">Total</span>
                  <span className="text-white font-bold text-xl">{totalCost} ETH</span>
                </div>

                <button
                  onClick={handleBuy}
                  disabled={isPending || isConfirming || !displaySaleActive}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                >
                  {isPending ? 'Aguardando carteira...' : isConfirming ? 'Confirmando na blockchain...' : 'Comprar cotas'}
                </button>
                <button onClick={() => navigate(`/property/${id}/book`)}className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors mt-2"> 
                   Reservar estadia
                </button>

                {txHash && (
                  <a
                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-xs text-indigo-400 hover:text-indigo-300 mt-3"
                  >
                    Ver transação no Etherscan ↗
                  </a>
                )}

                <p className="text-xs text-gray-500 text-center mt-2">
                  {address?.slice(0, 6)}...{address?.slice(-4)} · {balance}
                </p>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  )
}