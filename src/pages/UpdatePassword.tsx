import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { CheckSquare, Loader2, Sparkles, Lock } from 'lucide-react'

export default function UpdatePassword() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
    } else {
      setMessage('¡Contraseña actualizada con éxito! Redirigiendo...')
      setTimeout(() => navigate('/login'), 2000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
      <div className="w-full max-w-[440px] space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-white p-10 rounded-[32px] shadow-soft border border-gray-100">
          <div className="text-center mb-10">
            <div className="mx-auto h-14 w-14 bg-[#5B4FCF] text-white rounded-2xl flex items-center justify-center shadow-soft mb-6">
              <Lock size={28} />
            </div>
            <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tight">Nueva Contraseña</h2>
            <p className="text-gray-400 mt-2 font-medium">Ingresa tu nueva clave de acceso.</p>
          </div>

          <form className="space-y-5" onSubmit={handleUpdate}>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nueva Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#5B4FCF] transition-colors" size={18} />
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#5B4FCF]/30 focus:ring-4 focus:ring-[#5B4FCF]/5 outline-none transition-soft font-medium text-[#1A1A1A]"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-red-600 text-xs font-bold text-center">
                {error}
              </div>
            )}
            
            {message && (
              <div className="p-4 bg-green-50 rounded-2xl border border-green-100 text-green-600 text-xs font-bold text-center">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-4 bg-[#5B4FCF] hover:bg-[#4A3EB8] text-white rounded-2xl font-black text-sm shadow-soft active:scale-[0.98] transition-soft disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  <span>Actualizar Contraseña</span>
                  <Sparkles size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
