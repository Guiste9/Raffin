import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-5xl font-bold text-white mb-4">RaffChain</h1>
      <p className="text-gray-400 text-lg max-w-xl mb-10">
        Invista em imóveis de forma fracionada. Compre cotas, reserve estadias e participe da governança.
      </p>
      <button
        onClick={() => navigate('/connect')}
        className="py-3 px-8 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors text-lg"
      >
        Começar agora
      </button>
    </div>
  )
}