import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateProperty } from '../hooks/useCreateProperty'

export default function CreatePropertyPage() {
  const navigate = useNavigate()
  const { createProperty, isUploading, isPending, isConfirming, isSuccess, uploadError } = useCreateProperty()

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    symbol: '',
    description: '',
    location: '',
    totalShares: '',
    pricePerShare: '',
    dailyRate: '',
    image: null as File | null,
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setForm({ ...form, image: file })
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSubmit() {
  console.log('handleSubmit chamado')
  console.log('form:', form)

  if (!form.name || !form.symbol || !form.description || !form.location || !form.totalShares || !form.pricePerShare || !form.dailyRate) {
    alert('Preencha todos os campos.')
    return
  }

  if (!form.image) {
    alert('Selecione uma imagem.')
    return
  }

  console.log('chamando createProperty...')
  try {
    await createProperty(form)
  } catch (err) {
    console.error('erro no createProperty:', err)
  }
}

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center max-w-md">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-2">Imóvel tokenizado!</h2>
          <p className="text-gray-400 mb-6">Seu imóvel foi deployado na blockchain com sucesso.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors"
          >
            Ver imóveis
          </button>
        </div>
      </div>
    )
  }

  const isLoading = isUploading || isPending || isConfirming

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
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

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Tokenizar imóvel</h2>
          <p className="text-gray-400">Crie cotas do seu imóvel e venda para investidores.</p>
        </div>

        {uploadError && (
          <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm">{uploadError}</p>
          </div>
        )}

        <div className="flex flex-col gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="font-semibold text-white">Informações do imóvel</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Nome do imóvel</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ex: Apartamento Meireles"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Símbolo do token</label>
                <input
                  name="symbol"
                  value={form.symbol}
                  onChange={handleChange}
                  placeholder="Ex: APTMEI"
                  maxLength={6}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors uppercase"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Localização</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Ex: Meireles, Fortaleza, CE"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Descrição</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Descreva o imóvel, suas características e diferenciais..."
                rows={4}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Imagem do imóvel
                <span className="text-indigo-400 ml-1 text-xs">(será enviada para o IPFS)</span>
              </label>
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Clique para fazer upload</p>
                    <p className="text-gray-600 text-xs mt-1">PNG, JPG até 10MB</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImage}
                />
              </label>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="font-semibold text-white">Configuração das cotas</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Total de cotas</label>
                <input
                  name="totalShares"
                  type="number"
                  min="1"
                  value={form.totalShares}
                  onChange={handleChange}
                  placeholder="Ex: 20"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Preço por cota (ETH)</label>
                <input
                  name="pricePerShare"
                  type="number"
                  step="0.001"
                  min="0"
                  value={form.pricePerShare}
                  onChange={handleChange}
                  placeholder="Ex: 0.05"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Diária (ETH)</label>
              <input
                name="dailyRate"
                type="number"
                step="0.001"
                min="0"
                value={form.dailyRate}
                onChange={handleChange}
                placeholder="Ex: 0.01"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {form.totalShares && form.pricePerShare && (
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-2">Resumo financeiro</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Captação total</span>
                  <span className="text-white font-medium">
                    {(parseFloat(form.totalShares) * parseFloat(form.pricePerShare)).toFixed(4)} ETH
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-400">Taxa da plataforma (5%)</span>
                  <span className="text-red-400 font-medium">
                    -{(parseFloat(form.totalShares) * parseFloat(form.pricePerShare) * 0.05).toFixed(4)} ETH
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1 pt-2 border-t border-gray-700">
                  <span className="text-gray-400">Você recebe</span>
                  <span className="text-emerald-400 font-semibold">
                    {(parseFloat(form.totalShares) * parseFloat(form.pricePerShare) * 0.95).toFixed(4)} ETH
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-lg"
          >
            {isUploading
              ? 'Enviando imagem para IPFS...'
              : isPending
              ? 'Aguardando carteira...'
              : isConfirming
              ? 'Deployando contrato...'
              : 'Tokenizar imóvel'}
          </button>
        </div>
      </main>
    </div>
  )
}