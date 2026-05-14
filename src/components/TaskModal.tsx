import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { X, Loader2, Book, User, Calendar as CalendarIcon, Clock, AlignLeft } from 'lucide-react'

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

export default function TaskModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  editTask
}: { 
  isOpen: boolean, 
  onClose: () => void,
  onSuccess: () => void,
  editTask?: Tarea
}) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    materia: '',
    maestro: '',
    fecha_entrega: '',
    hora_entrega: '',
    estado: 'pendiente'
  })

  useEffect(() => {
    if (isOpen) {
      if (editTask) {
        setFormData({
          titulo: editTask.titulo || '',
          descripcion: editTask.descripcion || '',
          materia: editTask.materia || '',
          maestro: editTask.maestro || '',
          fecha_entrega: editTask.fecha_entrega || '',
          hora_entrega: editTask.hora_entrega || '',
          estado: editTask.estado || 'pendiente'
        })
      } else {
        setFormData({
          titulo: '',
          descripcion: '',
          materia: '',
          maestro: '',
          fecha_entrega: new Date().toISOString().split('T')[0],
          hora_entrega: '',
          estado: 'pendiente'
        })
      }
    }
  }, [isOpen, editTask])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    const payload = {
      ...formData,
      user_id: user.id,
      hora_entrega: formData.hora_entrega || null,
      descripcion: formData.descripcion || null,
      materia: formData.materia || null,
      maestro: formData.maestro || null,
    }

    let error;
    if (editTask) {
      const { error: err } = await supabase.from('tareas').update(payload).eq('id', editTask.id)
      error = err
    } else {
      const { error: err } = await supabase.from('tareas').insert([payload])
      error = err
    }

    setLoading(false)
    if (!error) {
      onSuccess()
      onClose()
    } else {
      alert('Error al guardar: ' + error.message)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-[500px] max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500"
      >
        <div className="flex justify-between items-center px-8 py-6 border-b border-gray-50">
          <div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">{editTask ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
            <p className="text-xs font-medium text-gray-400 mt-0.5">Completa los detalles de tu entrega.</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-[#1A1A1A] hover:bg-gray-50 rounded-xl transition-soft"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Título */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Título de la tarea</label>
            <div className="relative group">
              <input 
                required type="text"
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-[#5B4FCF]/30 focus:ring-4 focus:ring-[#5B4FCF]/5 outline-none transition-soft font-medium text-[#1A1A1A]"
                value={formData.titulo}
                onChange={e => setFormData({...formData, titulo: e.target.value})}
                placeholder="Ej. Análisis de Algoritmos"
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
              <AlignLeft size={12} /> Descripción
            </label>
            <textarea 
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-[#5B4FCF]/30 focus:ring-4 focus:ring-[#5B4FCF]/5 outline-none transition-soft font-medium text-[#1A1A1A] resize-none"
              value={formData.descripcion}
              onChange={e => setFormData({...formData, descripcion: e.target.value})}
              placeholder="Notas adicionales..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <Book size={12} /> Materia
              </label>
              <input 
                type="text"
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-[#5B4FCF]/30 focus:ring-4 focus:ring-[#5B4FCF]/5 outline-none transition-soft font-medium text-[#1A1A1A]"
                value={formData.materia}
                onChange={e => setFormData({...formData, materia: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <User size={12} /> Maestro
              </label>
              <input 
                type="text"
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-[#5B4FCF]/30 focus:ring-4 focus:ring-[#5B4FCF]/5 outline-none transition-soft font-medium text-[#1A1A1A]"
                value={formData.maestro}
                onChange={e => setFormData({...formData, maestro: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <CalendarIcon size={12} /> Fecha
              </label>
              <input 
                required type="date"
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-[#5B4FCF]/30 focus:ring-4 focus:ring-[#5B4FCF]/5 outline-none transition-soft font-medium text-[#1A1A1A]"
                value={formData.fecha_entrega}
                onChange={e => setFormData({...formData, fecha_entrega: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <Clock size={12} /> Hora
              </label>
              <input 
                type="time"
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-[#5B4FCF]/30 focus:ring-4 focus:ring-[#5B4FCF]/5 outline-none transition-soft font-medium text-[#1A1A1A]"
                value={formData.hora_entrega}
                onChange={e => setFormData({...formData, hora_entrega: e.target.value})}
              />
            </div>
          </div>
        </form>

        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-soft rounded-xl"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading || !formData.titulo || !formData.fecha_entrega}
            className="flex items-center justify-center min-w-[140px] px-6 py-3 text-sm font-bold text-white bg-[#5B4FCF] rounded-xl hover:bg-[#4A3EB8] shadow-soft active:scale-95 transition-soft disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : (editTask ? 'Guardar Cambios' : 'Crear Tarea')}
          </button>
        </div>
      </div>
    </div>
  )
}
