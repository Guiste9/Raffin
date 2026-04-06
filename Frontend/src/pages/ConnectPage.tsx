import { useWallet } from '../hooks/useWallet'

export default function ConnectPage() {
  const { connectors, connectAsync, isPending } = useWallet()

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 w-full max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">RaffChain</h1>
          <p className="text-gray-400">Multipropriedade tokenizada na blockchain</p>
        </div>

        <p className="text-gray-400 text-sm mb-6">Conecte sua carteira para continuar</p>

        <div className="flex flex-col gap-3">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => connectAsync({ connector })}
              disabled={isPending}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
            >
              {isPending ? 'Conectando...' : `Conectar com ${connector.name}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}