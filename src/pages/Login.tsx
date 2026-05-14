import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { CheckSquare, Loader2, Sparkles, Mail, Lock } from 'lucide-react'
import AdBanner from '../components/AdBanner'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [isResetMode, setIsResetMode] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })

    if (error) setError(error.message)
    else setMessage('Se ha enviado un enlace de recuperación a tu correo.')
    setLoading(false)
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('¡Cuenta creada! Revisa tu correo para confirmar.')
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
      <div className="w-full max-w-[440px] space-y-8 animate-in fade-in zoom-in-95 duration-700">
        {/* Ad Space on Login */}
        <AdBanner type="login" />

        <div className="bg-white p-10 rounded-[32px] shadow-soft border border-gray-100">
          <div className="text-center mb-10">
            <div className="mx-auto h-14 w-14 bg-[#5B4FCF] text-white rounded-2xl flex items-center justify-center shadow-soft mb-6">
              <CheckSquare size={28} />
            </div>
            <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tight">
              {isResetMode ? 'Recuperar Clave' : isLogin ? '¡Bienvenido de nuevo!' : 'Crea tu espacio'}
            </h2>
            <p className="text-gray-400 mt-2 font-medium">
              {isResetMode ? 'Te enviaremos un enlace a tu correo.' : isLogin ? 'Tus tareas te están esperando.' : 'Organiza tu vida universitaria hoy.'}
            </p>
          </div>

          <form className="space-y-5" onSubmit={isResetMode ? handleResetPassword : handleAuth}>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Universitario</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#5B4FCF] transition-colors" size={18} />
                  <input
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#5B4FCF]/30 focus:ring-4 focus:ring-[#5B4FCF]/5 outline-none transition-soft font-medium text-[#1A1A1A]"
                    placeholder="correo@ejemplo.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              {!isResetMode && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Contraseña</label>
                    <button 
                      type="button"
                      onClick={() => setIsResetMode(true)}
                      className="text-[10px] font-bold text-[#5B4FCF] hover:underline"
                    >
                      ¿Olvidaste tu clave?
                    </button>
                  </div>
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
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-red-600 text-xs font-bold text-center animate-in shake duration-500">
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
              disabled={loading}
              className="w-full py-4 bg-[#5B4FCF] hover:bg-[#4A3EB8] text-white rounded-2xl font-black text-sm shadow-soft active:scale-[0.98] transition-soft disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  <span>{isResetMode ? 'Enviar Enlace' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}</span>
                  <Sparkles size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-gray-50">
            {isResetMode ? (
              <button
                onClick={() => setIsResetMode(false)}
                className="text-xs font-bold text-[#5B4FCF] hover:underline uppercase tracking-widest"
              >
                Volver al inicio de sesión
              </button>
            ) : (
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs font-bold text-gray-400 hover:text-[#5B4FCF] transition-colors uppercase tracking-widest"
              >
                {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            )}
          </div>
        </div>
        
        <p className="text-center text-[10px] text-gray-300 font-medium uppercase tracking-[0.2em]">
          Recordatorio © 2026 • Powered by Supabase
        </p>
      </div>
    </div>
  )
}
