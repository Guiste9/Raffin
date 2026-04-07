import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet'
import { usePropertyMarket } from '../hooks/usePropertyMarket'
import { useUserProfile } from '../hooks/useUserProfile'
import { formatEther } from 'viem'

export default function BookingPage() {
  const navigate = useNavigate()
  const { address } = useWallet()
  const { sharesOwned } = useUserProfile(address)
  const { dailyRate, dailyRateRaw, dailyRateLoading, bookStay, isPending, isConfirming, isSuccess, txHash } = usePropertyMarket()
  console.log('dailyRate:', dailyRate)
console.log('dailyRateRaw:', dailyRateRaw)
console.log('dailyRateLoading:', dailyRateLoading)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [checkIn, setCheckIn] = useState<string>(today.toISOString().split('T')[0])
  const [checkOut, setCheckOut] = useState<string>(tomorrow.toISOString().split('T')[0])

  const nights = Math.ceil(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
  )

  const totalCost = dailyRateRaw && nights > 0
    ? formatEther(BigInt(nights) * dailyRateRaw)
    : '0'

  useEffect(() => {
    if (isSuccess) {
      alert('Reserva confirmada na blockchain!')
      navigate('/profile')
    }
  }, [isSuccess])

  function handleBook() {
    if (nights <= 0) {
      alert('Data de checkout deve ser após o check-in.')
      return
    }
    if (sharesOwned <= 0) {
      alert('Você precisa ter cotas para reservar.')
      return
    }
    bookStay(new Date(checkIn), new Date(checkOut))
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/property/1')}
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
      </nav>

      <main className="max-w-lg mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Reservar estadia</h2>
          <p className="text-gray-400">Apartamento Meireles · Fortaleza, CE</p>
        </div>
        <span className="text-white">
            {dailyRateLoading ? 'Carregando...' : `${dailyRate} ETH`}
        </span>

        {sharesOwned <= 0 ? (
          <div className="bg-red-900/30 border border-red-800 rounded-2xl p-6 text-center">
            <p className="text-red-400 mb-4">Você precisa ter cotas deste imóvel para reservar.</p>
            <button
              onClick={() => navigate('/property/1')}
              className="py-2 px-6 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl transition-colors"
            >
              Comprar cotas
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="font-semibold text-white">Selecione as datas</h3>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Check-in</label>
                <input
                  type="date"
                  value={checkIn}
                  min={today.toISOString().split('T')[0]}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Check-out</label>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4">Resumo</h3>

              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Diária</span>
                  <span className="text-white">{dailyRate} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Noites</span>
                  <span className="text-white">{nights > 0 ? nights : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Suas cotas</span>
                  <span className="text-indigo-400">{sharesOwned} cotas</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-800">
                  <span className="text-gray-400">Total</span>
                  <span className="text-white font-bold text-lg">{totalCost} ETH</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleBook}
              disabled={isPending || isConfirming || nights <= 0}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-lg"
            >
              {isPending ? 'Aguardando carteira...' : isConfirming ? 'Confirmando na blockchain...' : 'Confirmar reserva'}
            </button>

            {txHash && (
                <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-xs text-indigo-400 hover:text-indigo-300"
              >
                Ver transação no Etherscan ↗
              </a>
            )}
          </div>
        )}
      </main>
    </div>
  )
}