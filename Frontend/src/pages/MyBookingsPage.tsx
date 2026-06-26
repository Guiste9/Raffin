import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet'
import {
  useMyBookings,
  getBookingStatus,
  canCancelBooking,
  formatBookingDate,
  getBookingNights,
  type Booking,
} from '../hooks/useMyBookings'

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  active: { label: 'Ativa', className: 'bg-emerald-900 text-emerald-400' },
  in_progress: { label: 'Em andamento', className: 'bg-blue-900 text-blue-400' },
  completed: { label: 'Concluída', className: 'bg-gray-800 text-gray-300' },
  cancelled: { label: 'Cancelada', className: 'bg-red-900 text-red-400' },
}

function BookingCard({
  booking,
  onCancel,
  isCancelling,
  cancellingId,
  formatPaid,
  formatRefund,
}: {
  booking: Booking
  onCancel: (booking: Booking) => void
  isCancelling: boolean
  cancellingId: number | null
  formatPaid: (totalPaid: bigint) => string
  formatRefund: (totalPaid: bigint) => string
}) {
  const status = getBookingStatus(booking)
  const statusInfo = STATUS_LABELS[status]
  const nights = getBookingNights(booking.checkIn, booking.checkOut)
  const cancellable = canCancelBooking(booking)
  const isThisCancelling = isCancelling && cancellingId === booking.id

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Reserva #{booking.id}</p>
          <p className="font-semibold text-white text-lg">
            {formatBookingDate(booking.checkIn)} → {formatBookingDate(booking.checkOut)}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {nights} {nights === 1 ? 'noite' : 'noites'}
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-lg shrink-0 ${statusInfo.className}`}>
          {statusInfo.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div className="bg-gray-950/60 rounded-xl p-3">
          <p className="text-gray-500 text-xs mb-1">Valor pago</p>
          <p className="text-white font-medium">{formatPaid(booking.totalPaid)} ETH</p>
        </div>
        {cancellable && (
          <div className="bg-gray-950/60 rounded-xl p-3">
            <p className="text-gray-500 text-xs mb-1">Reembolso estimado (80%)</p>
            <p className="text-emerald-400 font-medium">{formatRefund(booking.totalPaid)} ETH</p>
          </div>
        )}
      </div>

      {cancellable && (
        <button
          onClick={() => onCancel(booking)}
          disabled={isCancelling}
          className="w-full py-2.5 bg-red-900/40 hover:bg-red-900/60 border border-red-800 text-red-300 text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isThisCancelling ? 'Cancelando na blockchain...' : 'Solicitar cancelamento'}
        </button>
      )}
    </div>
  )
}

export default function MyBookingsPage() {
  const navigate = useNavigate()
  const { address, balance, disconnect } = useWallet()
  const {
    activeBookings,
    historyBookings,
    isLoading,
    cancelBooking,
    isPending,
    isConfirming,
    isSuccess,
    txHash,
    reset,
    refetch,
    formatPaid,
    formatRefund,
  } = useMyBookings(address)

  const [cancellingId, setCancellingId] = useState<number | null>(null)

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''
  const isCancelling = isPending || isConfirming

  useEffect(() => {
    if (isSuccess) {
      alert('Reserva cancelada! O reembolso de 80% foi enviado para sua carteira.')
      setCancellingId(null)
      reset()
      refetch()
    }
  }, [isSuccess])

  function handleCancel(booking: Booking) {
    const refund = formatRefund(booking.totalPaid)
    const confirmed = window.confirm(
      `Cancelar a reserva #${booking.id}?\n\n` +
        `Check-in: ${formatBookingDate(booking.checkIn)}\n` +
        `Check-out: ${formatBookingDate(booking.checkOut)}\n\n` +
        `Reembolso: ${refund} ETH (80% do valor pago)\n\n` +
        `Esta ação é irreversível na blockchain.`
    )
    if (!confirmed) return

    setCancellingId(booking.id)
    cancelBooking(booking.id)
  }

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
            Minhas reservas
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
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

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Minhas reservas</h2>
          <p className="text-gray-400">
            Gerencie suas estadias reservadas. Cancelamentos antes do check-in recebem 80% de reembolso.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-gray-400">Carregando reservas da blockchain...</p>
          </div>
        ) : activeBookings.length === 0 && historyBookings.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
            <p className="text-gray-500 mb-2">Você ainda não possui reservas.</p>
            <p className="text-gray-600 text-sm mb-6">
              Compre cotas de um imóvel e reserve suas datas de estadia.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="py-2 px-6 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl transition-colors"
            >
              Explorar imóveis
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {activeBookings.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Reservas ativas ({activeBookings.length})
                </h3>
                <div className="flex flex-col gap-4">
                  {activeBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onCancel={handleCancel}
                      isCancelling={isCancelling}
                      cancellingId={cancellingId}
                      formatPaid={formatPaid}
                      formatRefund={formatRefund}
                    />
                  ))}
                </div>
              </section>
            )}

            {historyBookings.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Histórico ({historyBookings.length})
                </h3>
                <div className="flex flex-col gap-4">
                  {historyBookings
                    .sort((a, b) => Number(b.checkIn - a.checkIn))
                    .map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        onCancel={handleCancel}
                        isCancelling={isCancelling}
                        cancellingId={cancellingId}
                        formatPaid={formatPaid}
                        formatRefund={formatRefund}
                      />
                    ))}
                </div>
              </section>
            )}
          </div>
        )}

        {txHash && (
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-xs text-indigo-400 hover:text-indigo-300 mt-8"
          >
            Ver última transação no Etherscan ↗
          </a>
        )}
      </main>
    </div>
  )
}
