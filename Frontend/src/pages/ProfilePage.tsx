import { useNavigate } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet'
import { useUserProfile } from '../hooks/useUserProfile'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { address, balance, disconnect } = useWallet()
  const { sharesOwned, shareValue, ownershipPercent, propertyName, isLoading } = useUserProfile(address)

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
          <button className="text-sm text-white font-medium border-b border-indigo-400 pb-0.5">
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

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-1">Meu perfil</h2>
          <p className="text-gray-400 font-mono text-sm">{address}</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-gray-400">Carregando dados da blockchain...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <p className="text-gray-400 text-sm mb-1">Saldo da carteira</p>
                <p className="text-2xl font-bold text-white">{balance}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <p className="text-gray-400 text-sm mb-1">Cotas possuídas</p>
                <p className="text-2xl font-bold text-indigo-400">{sharesOwned}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <p className="text-gray-400 text-sm mb-1">Valor investido</p>
                <p className="text-2xl font-bold text-emerald-400">{shareValue} ETH</p>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-4">Meus investimentos</h3>

{sharesOwned > 0 ? (
  <div
    className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center justify-between hover:border-indigo-500 transition-colors cursor-pointer"
    onClick={() => navigate('/property/1')}
  >
    <div className="flex items-center gap-4">
      <img
        src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"
        alt={propertyName}
        className="w-16 h-16 rounded-xl object-cover"
      />
      <div>
        <p className="font-semibold text-white">{propertyName}</p>
        <p className="text-gray-400 text-sm">Meireles, Fortaleza, CE</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs px-2 py-0.5 bg-indigo-900 text-indigo-300 rounded-lg">
            {sharesOwned} cotas
          </span>
          <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-300 rounded-lg">
            {ownershipPercent}% do imóvel
          </span>
        </div>
      </div>
    </div>
    <div className="text-right">
      <p className="text-emerald-400 font-bold">{shareValue} ETH</p>
      <p className="text-gray-500 text-xs mt-1">valor investido</p>
      <p className="text-indigo-400 text-xs mt-2">Ver detalhes →</p>
    </div>
  </div>
) : (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
    <p className="text-gray-500 mb-4">Você ainda não possui cotas em nenhum imóvel.</p>
    <button
      onClick={() => navigate('/dashboard')}
      className="py-2 px-6 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl transition-colors"
    >
      Explorar imóveis
    </button>
  </div>
)}
          </>
        )}
      </main>
    </div>
  )
}