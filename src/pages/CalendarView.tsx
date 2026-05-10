import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar as CalendarIcon, Clock, CheckSquare } from 'lucide-react'

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

  const today = new Date()
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }) // Monday

  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i))

  useEffect(() => {
    const fetchTareas = async () => {
      if (!user) return
      const { data } = await supabase
        .from('tareas')
        .select('*')
        .order('fecha_entrega', { ascending: true })
      
      if (data) setTareas(data)
      setLoading(false)
    }
    fetchTareas()
  }, [user])

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <CalendarIcon size={32} className="text-indigo-600" />
          Vista Semanal
        </h1>
        <p className="text-gray-500 mt-1">
          Tus entregas para la semana del {format(weekDays[0], "d 'de' MMMM", { locale: es })}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {weekDays.map(day => {
            const dayTasks = tareas.filter(t => isSameDay(new Date(t.fecha_entrega + 'T12:00:00'), day))
            const isCurrentDay = isToday(day)

            return (
              <div 
                key={day.toISOString()} 
                className={`bg-white rounded-2xl border flex flex-col overflow-hidden shadow-sm ${
                  isCurrentDay ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200'
                }`}
              >
                <div className={`p-3 text-center border-b ${isCurrentDay ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-50 border-gray-100'}`}>
                  <div className={`text-xs font-bold uppercase tracking-wider ${isCurrentDay ? 'text-indigo-600' : 'text-gray-500'}`}>
                    {format(day, 'EEEE', { locale: es })}
                  </div>
                  <div className={`text-2xl font-black mt-0.5 ${isCurrentDay ? 'text-indigo-700' : 'text-gray-900'}`}>
                    {format(day, 'd')}
                  </div>
                </div>
                
                <div className="p-3 flex-1 flex flex-col gap-2 min-h-[120px] bg-white">
                  {dayTasks.length === 0 ? (
                    <div className="text-center text-sm text-gray-400 mt-4 italic">Sin entregas</div>
                  ) : (
                    dayTasks.map(tarea => (
                      <div 
                        key={tarea.id} 
                        className={`text-sm p-2 rounded-lg border flex flex-col gap-1 ${
                          tarea.estado === 'entregada' ? 'bg-gray-50 border-gray-100 opacity-60' : 
                          'bg-white border-gray-200 shadow-sm hover:border-indigo-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900 line-clamp-2 leading-tight">
                          {tarea.titulo}
                        </div>
                        {tarea.hora_entrega && (
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} /> {tarea.hora_entrega.slice(0, 5)}
                          </div>
                        )}
                        {tarea.estado === 'entregada' && (
                          <div className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
                            <CheckSquare size={12} /> Entregada
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Layout>
  )
}
