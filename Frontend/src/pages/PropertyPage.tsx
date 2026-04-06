import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet'

const MOCK_PROPERTIES: Record<string, {
  id: string
  name: string
  description: string
  imageUrl: string
  pricePerShare: string
  availableShares: number
  totalShares: number
  location: string
  amenities: string[]
  owner: string
}> = {
  '1': {
    id: '1',
    name: 'Apartamento Meireles',
    description: 'Apartamento de luxo com vista para o mar, 3 quartos, varanda gourmet e lazer completo. Localizado no coração do Meireles, a 100 metros da praia, com fácil acesso a restaurantes e comércio.',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    pricePerShare: '0.05',
    availableShares: 12,
    totalShares: 20,
    location: 'Fortaleza, CE',
    amenities: ['Piscina', 'Academia', 'Varanda', 'Vista mar', 'Segurança 24h'],
    owner: '0x1234...5678',
  },
  '2': {
    id: '2',
    name: 'Casa Guarajuba',
    description: 'Casa de praia espaçosa com piscina privativa, 4 quartos e acesso direto à praia. Ambiente tranquilo e exclusivo, ideal para descanso e lazer em família.',
    imageUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800',
    pricePerShare: '0.08',
    availableShares: 5,
    totalShares: 20,
    location: 'Guarajuba, BA',
    amenities: ['Piscina privativa', 'Acesso à praia', '4 quartos', 'Churrasqueira', 'Jardim'],
    owner: '0x8765...4321',
  },
  '3': {
    id: '3',
    name: 'Cobertura Ponta Verde',
    description: 'Cobertura duplex com terraço, churrasqueira e vista panorâmica da cidade. Acabamento de alto padrão com materiais importados e design moderno.',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    pricePerShare: '0.12',
    availableShares: 18,
    totalShares: 20,
    location: 'Maceió, AL',
    amenities: ['Terraço', 'Churrasqueira', 'Vista panorâmica', 'Duplex', 'Vaga dupla'],
    owner: '0xabcd...ef01',
  },
}

export default function PropertyPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { address, balance } = useWallet()
  const [shareAmount, setShareAmount] = useState(1)
  const [isbuying, setIsBuying] = useState(false)

  const property = id ? MOCK_PROPERTIES[id] : null

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">Imóvel não encontrado.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="py-2 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  const totalCost = (parseFloat(property.pricePerShare) * shareAmount).toFixed(4)
  const occupancyPercent = Math.round(
    ((property.totalShares - property.availableShares) / property.totalShares) * 100
  )

  async function handleBuy() {
    setIsBuying(true)
    await new Promise((r) => setTimeout(r, 2000))
    setIsBuying(false)
    alert(`Compra de ${shareAmount} cota(s) simulada com sucesso!`)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2"
        >
          ← Voltar
        </button>
        <h1
          className="text-xl font-bold text-indigo-400 cursor-pointer"
          onClick={() => navigate('/')}
        >
          RaffChain
        </h1>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          <div>
            <div className="rounded-2xl overflow-hidden mb-6 h-80">
              <img
                src={property.imageUrl}
                alt={property.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Comodidades</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-lg"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <p className="text-gray-400 text-sm mb-1">📍 {property.location}</p>
              <h2 className="text-3xl font-bold text-white mb-3">{property.name}</h2>
              <p className="text-gray-400 leading-relaxed">{property.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-indigo-400">{property.availableShares}</p>
                <p className="text-xs text-gray-400 mt-1">Cotas disponíveis</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-white">{property.totalShares}</p>
                <p className="text-xs text-gray-400 mt-1">Total de cotas</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-400">{occupancyPercent}%</p>
                <p className="text-xs text-gray-400 mt-1">Vendido</p>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4">Comprar cotas</h3>

              <div className="flex items-center gap-4 mb-4">
                <p className="text-gray-400 text-sm">Quantidade</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShareAmount(Math.max(1, shareAmount - 1))}
                    className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-bold transition-colors"
                  >
                    −
                  </button>
                  <span className="text-white font-bold text-lg w-6 text-center">
                    {shareAmount}
                  </span>
                  <button
                    onClick={() => setShareAmount(Math.min(property.availableShares, shareAmount + 1))}
                    className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-gray-800 mb-4">
                <span className="text-gray-400 text-sm">Total</span>
                <span className="text-white font-bold text-xl">{totalCost} ETH</span>
              </div>

              <button
                onClick={handleBuy}
                disabled={isbuying || property.availableShares === 0}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
              >
                {isbuying ? 'Processando...' : 'Comprar cotas'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Carteira: {address?.slice(0, 6)}...{address?.slice(-4)} · {balance}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}