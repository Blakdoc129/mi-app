import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import TaskModal from '../components/TaskModal'
import { format, startOfWeek, addDays, isSameDay, isToday, addWeeks, subWeeks, endOfWeek, isPast } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Plus } from 'lucide-react'

type Tarea = {
  id: string;
  titulo: string;
  materia: string | null;
  fecha_entrega: string;
  hora_entrega: string | null;
  estado: string;
}

export default function CalendarView() {
  const { user } = useAuth()
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)

  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 })
  const endOfCurrentWeek = endOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i))

  const fetchTareas = async () => {
    if (!user) return
    setLoading(true)
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

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1))
  }

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <h1 className="text-[32px] font-bold text-[#1A1A1A] leading-tight flex items-center gap-3">
            <CalendarIcon size={32} className="text-[#5B4FCF]" />
            Vista Semanal
          </h1>
          <p className="text-gray-400 mt-1 text-sm font-medium">
            {format(startOfCurrentWeek, "d 'de' MMMM", { locale: es })} — {format(endOfCurrentWeek, "d 'de' MMMM", { locale: es })}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#5B4FCF] hover:bg-[#4A3EB8] text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 font-bold transition-soft shadow-soft active:scale-95 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            <span className="hidden sm:inline">Nueva Tarea</span>
          </button>

          <div className="flex items-center bg-white border border-gray-100 rounded-2xl p-1 shadow-soft">
          <button 
            onClick={() => navigateWeek('prev')}
            className="p-2 hover:bg-gray-50 text-gray-500 rounded-xl transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-4 text-xs font-bold text-[#5B4FCF] hover:bg-[#5B4FCF]/5 py-2 rounded-lg transition-colors uppercase tracking-widest"
          >
            Hoy
          </button>
          <button 
            onClick={() => navigateWeek('next')}
            className="p-2 hover:bg-gray-50 text-gray-500 rounded-xl transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {Array.from({ length: 7 }).map((_, i) => <SkeletonDay key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 h-full md:min-h-[500px]">
          {weekDays.map(day => {
            const dayTasks = tareas.filter(t => isSameDay(new Date(t.fecha_entrega + 'T12:00:00'), day))
            const isCurrentDay = isToday(day)
            const workloadPercent = Math.min((dayTasks.length / 5) * 100, 100)

            return (
              <div 
                key={day.toISOString()} 
                className={`bg-white rounded-2xl border transition-soft flex flex-col overflow-hidden shadow-soft ${
                  isCurrentDay ? 'border-[#5B4FCF] ring-1 ring-[#5B4FCF]' : 'border-gray-100'
                }`}
              >
                <div className={`p-4 text-center border-b border-gray-50 ${isCurrentDay ? 'bg-[#5B4FCF]/5' : 'bg-white'}`}>
                  <div className={`text-[10px] font-bold uppercase tracking-widest ${isCurrentDay ? 'text-[#5B4FCF]' : 'text-gray-400'}`}>
                    {format(day, 'EEEE', { locale: es })}
                  </div>
                  <div className={`text-2xl font-black mt-1 ${isCurrentDay ? 'text-[#5B4FCF]' : 'text-[#1A1A1A]'}`}>
                    {format(day, 'd')}
                  </div>
                </div>
                
                <div className="p-3 flex-1 flex flex-col gap-2 min-h-[140px] bg-white relative">
                  {dayTasks.length === 0 ? (
                    <div className="text-center text-[11px] text-gray-300 mt-6 italic font-medium px-2">Sin entregas</div>
                  ) : (
                    dayTasks.map(tarea => (
                      <div 
                        key={tarea.id} 
                        className={`text-[12px] p-2 rounded-xl border flex flex-col gap-1 transition-soft hover:border-[#5B4FCF]/30 ${
                          tarea.estado === 'entregada' ? 'bg-gray-50 border-gray-100 opacity-60' : 
                          'bg-white border-gray-100 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            tarea.estado === 'entregada' ? 'bg-[#22C55E]' : 
                            isPast(tarea.hora_entrega ? new Date(`${tarea.fecha_entrega}T${tarea.hora_entrega}`) : new Date(`${tarea.fecha_entrega}T23:59:59`)) ? 'bg-[#EF4444]' : 'bg-[#5B4FCF]'
                          }`} />
                          <div className="font-bold text-[#1A1A1A] line-clamp-1 leading-tight">
                            {tarea.titulo}
                          </div>
                        </div>
                        {tarea.hora_entrega && (
                          <div className="text-[10px] text-gray-400 font-medium flex items-center gap-1 pl-3">
                            <Clock size={10} /> {tarea.hora_entrega.slice(0, 5)}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Progress Bar */}
                <div className="h-1 w-full bg-gray-50 mt-auto">
                  <div 
                    className={`h-full transition-all duration-1000 ${isCurrentDay ? 'bg-[#5B4FCF]' : 'bg-gray-200'}`}
                    style={{ width: `${workloadPercent}%` }}
                  />
                </div>
              </div>
            )
          })}
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

function SkeletonDay() {
  return (
    <div className="bg-white rounded-2xl border border-gray-50 shadow-soft h-[200px] flex flex-col overflow-hidden animate-pulse">
      <div className="p-4 bg-gray-50/50 h-16" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-50 rounded-lg w-full" />
        <div className="h-4 bg-gray-50 rounded-lg w-2/3" />
      </div>
    </div>
  )
}
