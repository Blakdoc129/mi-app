import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import TaskModal from '../components/TaskModal'
import { Plus, BookOpen, Calendar as CalendarIcon, Trash2, Edit2, AlertCircle, CheckSquare } from 'lucide-react'
import { format, isPast, isToday } from 'date-fns'
import { es } from 'date-fns/locale'

type Tarea = {
  id: string;
  titulo: string;
  descripcion: string | null;
  materia: string | null;
  maestro: string | null;
  fecha_entrega: string;
  hora_entrega: string | null;
  estado: string;
}

export default function Dashboard() {
  const { user } = useAuth()
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchTareas = async () => {
    if (!user) return
    const { data } = await supabase
      .from('tareas')
      .select('*')
      .order('fecha_entrega', { ascending: true })
    
    if (data) setTareas(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchTareas()
  }, [user])

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mis Tareas</h1>
          <p className="text-gray-500 mt-1">Aquí puedes ver y gestionar tus próximos entregables.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all shadow-sm hover:shadow-md hover:shadow-indigo-200"
        >
          <Plus size={20} />
          <span>Nueva Tarea</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : tareas.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
          <div className="bg-indigo-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-500">
            <CheckSquare size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No hay tareas pendientes</h3>
          <p className="text-gray-500 mt-1">¡Estás al día! Disfruta tu tiempo libre o crea una nueva tarea.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-6 px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors"
          >
            Crear primera tarea
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tareas.map(tarea => (
            <TaskCard key={tarea.id} tarea={tarea} onUpdate={fetchTareas} />
          ))}
        </div>
      )}

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchTareas} 
      />
    </Layout>
  )
}

function TaskCard({ tarea, onUpdate }: { tarea: Tarea, onUpdate: () => void }) {
  const handleDelete = async () => {
    if (confirm('¿Eliminar esta tarea?')) {
      await supabase.from('tareas').delete().eq('id', tarea.id)
      onUpdate()
    }
  }

  const toggleEstado = async () => {
    const newEstado = tarea.estado === 'entregada' ? 'pendiente' : 'entregada'
    await supabase.from('tareas').update({ estado: newEstado }).eq('id', tarea.id)
    onUpdate()
  }

  // Parse dates carefully to avoid timezone shift
  const dueDate = new Date(tarea.fecha_entrega + 'T12:00:00')
  const isLate = tarea.estado !== 'entregada' && isPast(dueDate) && !isToday(dueDate)
  const isDueToday = tarea.estado !== 'entregada' && isToday(dueDate)

  return (
    <div className={`bg-white p-5 rounded-2xl border shadow-sm transition-all hover:shadow-md flex flex-col h-full ${
      tarea.estado === 'entregada' ? 'opacity-70 border-gray-200' : 
      isLate ? 'border-red-200 bg-red-50/20' : 
      isDueToday ? 'border-amber-200 bg-amber-50/20' : 'border-gray-200 hover:border-indigo-200'
    }`}>
      <div className="flex justify-between items-start mb-3 gap-3">
        <h3 className={`font-semibold text-lg line-clamp-2 leading-tight ${tarea.estado === 'entregada' ? 'text-gray-500' : 'text-gray-900'}`}>
          {tarea.titulo}
        </h3>
        <button onClick={toggleEstado} className={`p-1.5 rounded-full flex-shrink-0 transition-colors ${
          tarea.estado === 'entregada' ? 'text-green-600 bg-green-100 hover:bg-green-200' : 'text-gray-400 bg-gray-50 hover:bg-gray-100 hover:text-indigo-600 border border-gray-200'
        }`}>
          <CheckSquare size={20} />
        </button>
      </div>
      
      {tarea.descripcion && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">{tarea.descripcion}</p>
      )}

      <div className="space-y-2.5 mt-auto pt-4">
        {tarea.materia && (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 w-fit px-2.5 py-1 rounded-md">
            <BookOpen size={14} className="text-indigo-500" />
            <span className="font-medium">{tarea.materia}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm">
          <CalendarIcon size={16} className={isLate ? 'text-red-500' : isDueToday ? 'text-amber-500' : 'text-gray-400'} />
          <span className={`font-medium ${isLate ? 'text-red-600' : isDueToday ? 'text-amber-600' : 'text-gray-600'}`}>
            {format(dueDate, "EEEE d 'de' MMM", { locale: es })}
            {tarea.hora_entrega && ` • ${tarea.hora_entrega.slice(0, 5)}`}
          </span>
          {isLate && <AlertCircle size={14} className="text-red-500 ml-1" />}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold tracking-wide ${
          tarea.estado === 'entregada' ? 'bg-green-100 text-green-700' :
          isLate ? 'bg-red-100 text-red-700' :
          'bg-indigo-100 text-indigo-700'
        }`}>
          {tarea.estado.toUpperCase()}
        </span>
        
        <div className="flex gap-1">
          <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
            <Edit2 size={16} />
          </button>
          <button onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
