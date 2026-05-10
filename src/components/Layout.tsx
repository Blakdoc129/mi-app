import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useLocation } from 'react-router-dom'
import { LogOut, CheckSquare, Calendar as CalendarIcon, User } from 'lucide-react'

export default function Layout({ children }: { children: ReactNode }) {
  const { signOut, user } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-b md:border-r border-gray-200 shadow-sm z-10 flex-shrink-0">
        <div className="h-full flex flex-col px-4 py-6">
          <div className="flex items-center gap-3 px-2 mb-8">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md shadow-indigo-200">
              <CheckSquare size={24} />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Recordatorio</span>
          </div>
          
          <nav className="flex-1 space-y-2">
            <Link 
              to="/" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${location.pathname === '/' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <CheckSquare size={20} /> Tareas
            </Link>
            <Link 
              to="/calendar" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${location.pathname === '/calendar' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <CalendarIcon size={20} /> Calendario
            </Link>
          </nav>

          <div className="border-t border-gray-200 pt-4 mt-auto">
            <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-gray-50 rounded-lg">
              <div className="bg-white p-2 rounded-full shadow-sm border border-gray-200">
                <User size={16} className="text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 truncate">
                {user?.email?.split('@')[0]}
              </span>
            </div>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
            >
              <LogOut size={20} /> Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gray-50/50">
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
