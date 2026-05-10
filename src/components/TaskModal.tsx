import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { X, Loader2 } from 'lucide-react'

export default function TaskModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: { 
  isOpen: boolean, 
  onClose: () => void,
  onSuccess: () => void
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

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen])

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

    const { error } = await supabase.from('tareas').insert([payload])

    setLoading(false)
    if (!error) {
      onSuccess()
      onClose()
    } else {
      alert('Error al guardar la tarea: ' + error.message)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Nueva Tarea</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título de la tarea *</label>
            <input 
              required type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              value={formData.titulo}
              onChange={e => setFormData({...formData, titulo: e.target.value})}
              placeholder="Ej. Ensayo de Historia"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea 
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
              value={formData.descripcion}
              onChange={e => setFormData({...formData, descripcion: e.target.value})}
              placeholder="Detalles adicionales sobre la tarea..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Materia</label>
              <input 
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                value={formData.materia}
                onChange={e => setFormData({...formData, materia: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maestro(a)</label>
              <input 
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                value={formData.maestro}
                onChange={e => setFormData({...formData, maestro: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Entrega *</label>
              <input 
                required type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                value={formData.fecha_entrega}
                onChange={e => setFormData({...formData, fecha_entrega: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Entrega</label>
              <input 
                type="time"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                value={formData.hora_entrega}
                onChange={e => setFormData({...formData, hora_entrega: e.target.value})}
              />
            </div>
          </div>
          
        </form>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading || !formData.titulo || !formData.fecha_entrega}
            className="flex items-center justify-center min-w-[100px] px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Guardar Tarea'}
          </button>
        </div>
      </div>
    </div>
  )
}
