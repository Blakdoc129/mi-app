import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import TaskModal from '../components/TaskModal'
import { Plus, BookOpen, Calendar as CalendarIcon, Trash2, Edit2, AlertCircle, CheckSquare, Clock } from 'lucide-react'
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
  const [editingTask, setEditingTask] = useState<Tarea | undefined>(undefined)

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

  const metrics = {
    pending: tareas.filter(t => t.estado === 'pendiente').length,
    delivered: tareas.filter(t => t.estado === 'entregada').length,
    overdue: tareas.filter(t => t.estado !== 'entregada' && isPast(new Date(t.fecha_entrega + 'T23:59:59')) && !isToday(new Date(t.fecha_entrega + 'T12:00:00'))).length
  }

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <h1 className="text-[32px] font-bold text-[#1A1A1A] leading-tight">Mis Tareas</h1>
          <p className="text-gray-400 mt-1 text-sm font-medium">Gestiona tus entregas universitarias con precisión.</p>
        </div>
        <button 
          onClick={() => {
            setEditingTask(undefined)
            setIsModalOpen(true)
          }}
          className="bg-[#5B4FCF] hover:bg-[#4A3EB8] text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-soft shadow-soft active:scale-95 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>Nueva Tarea</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <MetricCard label="Pendientes" value={metrics.pending} color="text-[#5B4FCF]" bg="bg-[#5B4FCF]/5" />
        <MetricCard label="Entregadas" value={metrics.delivered} color="text-[#22C55E]" bg="bg-[#22C55E]/5" />
        <MetricCard label="Vencidas" value={metrics.overdue} color="text-[#EF4444]" bg="bg-[#EF4444]/5" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : tareas.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-soft animate-in zoom-in-95 duration-500">
          <div className="bg-[#FAFAFA] h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
            <BookOpen size={40} />
          </div>
          <h3 className="text-xl font-bold text-[#1A1A1A]">¡Todo al día!</h3>
          <p className="text-gray-400 mt-2 max-w-xs mx-auto">Añade tu próxima entrega para mantener el ritmo.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-8 px-6 py-2.5 bg-gray-50 text-[#5B4FCF] font-bold rounded-xl hover:bg-[#5B4FCF]/5 transition-soft border border-transparent hover:border-[#5B4FCF]/10"
          >
            Crear primera tarea
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tareas.map(tarea => (
            <TaskCard 
              key={tarea.id} 
              tarea={tarea} 
              onUpdate={fetchTareas} 
              onEdit={() => {
                setEditingTask(tarea)
                setIsModalOpen(true)
              }}
            />
          ))}
        </div>
      )}

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchTareas}
        editTask={editingTask}
      />
    </Layout>
  )
}

function MetricCard({ label, value, color, bg }: { label: string, value: number, color: string, bg: string }) {
  return (
    <div className={`${bg} p-6 rounded-2xl border border-white/50 shadow-soft flex flex-col gap-1 transition-soft hover:scale-[1.02]`}>
      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      <span className={`text-4xl font-black ${color}`}>{value}</span>
    </div>
  )
}

function TaskCard({ tarea, onUpdate, onEdit }: { tarea: Tarea, onUpdate: () => void, onEdit: () => void }) {
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

  const dueDate = new Date(tarea.fecha_entrega + 'T12:00:00')
  const isOverdue = tarea.estado !== 'entregada' && isPast(new Date(tarea.fecha_entrega + 'T23:59:59')) && !isToday(dueDate)
  const isDueToday = tarea.estado !== 'entregada' && isToday(dueDate)
  
  const statusColor = 
    tarea.estado === 'entregada' ? 'bg-[#22C55E]' :
    isOverdue ? 'bg-[#EF4444]' :
    isDueToday ? 'bg-[#F59E0B]' : 'bg-gray-300'

  return (
    <div className={`group bg-white p-6 rounded-2xl border border-gray-100 shadow-soft transition-soft hover:translate-y-[-4px] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative overflow-hidden flex flex-col h-full ${
      tarea.estado === 'entregada' ? 'opacity-60' : ''
    }`}>
      {/* State border */}
      <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${statusColor}`} />

      <div className="flex justify-between items-start mb-4 gap-4">
        <h3 className="text-[18px] font-bold text-[#1A1A1A] line-clamp-2 leading-tight flex-1">
          {tarea.titulo}
        </h3>
        
        {/* Actions - visible only on hover */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-[#5B4FCF] hover:bg-[#5B4FCF]/5 rounded-lg transition-colors">
            <Edit2 size={16} />
          </button>
          <button onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-error hover:bg-error/5 rounded-lg transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      {tarea.descripcion && (
        <p className="text-sm text-gray-400 mb-6 line-clamp-2 font-normal leading-relaxed">{tarea.descripcion}</p>
      )}

      <div className="mt-auto flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {tarea.materia && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#5B4FCF] bg-[#5B4FCF]/5 px-2.5 py-1 rounded-full uppercase tracking-wider">
              <BookOpen size={12} />
              {tarea.materia}
            </div>
          )}
          <div className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
            tarea.estado === 'entregada' ? 'bg-[#22C55E]/10 text-[#22C55E]' :
            isOverdue ? 'bg-[#EF4444]/10 text-[#EF4444]' :
            isDueToday ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'bg-gray-100 text-gray-500'
          }`}>
            {tarea.estado}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Clock size={14} className={isDueToday ? 'text-[#F59E0B]' : 'text-gray-300'} />
            <span className={isDueToday ? 'text-[#F59E0B] font-bold' : ''}>
              {format(dueDate, "d 'de' MMMM", { locale: es })}
              {tarea.hora_entrega && ` • ${tarea.hora_entrega.slice(0, 5)}`}
            </span>
          </div>

          <button 
            onClick={toggleEstado} 
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-soft ${
              tarea.estado === 'entregada' 
                ? 'bg-[#22C55E] text-white' 
                : 'bg-gray-50 text-gray-300 hover:bg-[#5B4FCF]/10 hover:text-[#5B4FCF] border border-gray-100'
            }`}
          >
            <CheckSquare size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-50 shadow-soft h-[200px] flex flex-col gap-4">
      <div className="h-6 bg-gray-50 rounded-lg w-3/4 animate-pulse" />
      <div className="h-4 bg-gray-50 rounded-lg w-full animate-pulse" />
      <div className="mt-auto h-4 bg-gray-50 rounded-lg w-1/2 animate-pulse" />
    </div>
  )
}
