import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { LogOut, CheckSquare, Calendar as CalendarIcon, User, LayoutDashboard } from 'lucide-react'

export default function Layout({ children }: { children: ReactNode }) {
  const { signOut, user } = useAuth()
  const location = useLocation()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (!user) return
    const fetchCount = async () => {
      const { count } = await supabase
        .from('tareas')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('estado', 'pendiente')
      
      setPendingCount(count || 0)
    }
    fetchCount()

    // Real-time update for the count
    const channel = supabase
      .channel('tasks_count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tareas' }, () => {
        fetchCount()
      })
      .subscribe()

    return () => { channel.unsubscribe() }
  }, [user])

  const userName = user?.email?.split('@')[0] || 'Estudiante'
  const initial = userName.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-[240px] bg-white border-b md:border-r border-gray-100 shadow-soft z-20 flex-shrink-0 flex flex-col">
        <div className="px-6 py-8 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10 group cursor-pointer">
            <div className="bg-[#5B4FCF] p-2 rounded-xl text-white shadow-soft transition-transform group-hover:scale-110 duration-300">
              <CheckSquare size={20} className="group-hover:rotate-12 transition-transform" />
            </div>
            <span className="text-xl font-bold text-[#1A1A1A] tracking-tight">Recordatorio</span>
          </div>
          
          {/* Nav */}
          <nav className="flex-1 space-y-1.5">
            <NavLink 
              to="/" 
              active={location.pathname === '/'}
              icon={<LayoutDashboard size={18} />}
              label="Mis Tareas"
            />
            <NavLink 
              to="/calendar" 
              active={location.pathname === '/calendar'}
              icon={<CalendarIcon size={18} />}
              label="Vista Semanal"
            />
          </nav>

          {/* User Summary */}
          <div className="mt-auto pt-6 border-t border-gray-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#5B4FCF]/10 border border-[#5B4FCF]/20 flex items-center justify-center text-[#5B4FCF] font-bold text-sm shadow-sm">
                {initial}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-[#1A1A1A] truncate">{userName}</span>
                <div className={`mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold w-fit uppercase tracking-wider ${
                  pendingCount > 5 ? 'bg-error/10 text-error' : 
                  pendingCount > 0 ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                }`}>
                  {pendingCount} tareas pendientes
                </div>
              </div>
            </div>

            <button 
              onClick={() => signOut()}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors w-full rounded-lg hover:bg-gray-50"
            >
              <LogOut size={16} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

function NavLink({ to, active, icon, label }: { to: string, active: boolean, icon: any, label: string }) {
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-soft ${
        active 
          ? 'bg-[#5B4FCF]/5 text-[#5B4FCF]' 
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
      }`}
    >
      <span className={active ? 'text-[#5B4FCF]' : 'text-gray-400'}>{icon}</span>
      {label}
    </Link>
  )
}
