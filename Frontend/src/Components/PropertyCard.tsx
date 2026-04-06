import { useNavigate } from 'react-router-dom'

interface PropertyCardProps {
  id: string
  name: string
  description: string
  imageUrl: string
  pricePerShare: string
  availableShares: number
  totalShares: number
  location: string
}

export default function PropertyCard({
  id,
  name,
  description,
  imageUrl,
  pricePerShare,
  availableShares,
  totalShares,
  location,
}: PropertyCardProps) {
  const navigate = useNavigate()
  const occupancyPercent = Math.round(((totalShares - availableShares) / totalShares) * 100)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-indigo-500 transition-colors group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg">
          {availableShares}/{totalShares} cotas
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-white text-lg leading-tight">{name}</h3>
        </div>

        <p className="text-gray-400 text-sm mb-1 flex items-center gap-1">
          📍 {location}
        </p>

        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{description}</p>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Ocupação das cotas</span>
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
            <p className="text-indigo-400 font-bold text-lg">{pricePerShare} ETH</p>
          </div>
          <button
            onClick={() => navigate(`/property/${id}`)}
            className="py-2 px-5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Ver detalhes
          </button>
        </div>
      </div>
    </div>
  )
}