import { ExternalLink, Sparkles } from 'lucide-react'

export default function AdBanner({ type = 'sidebar' }: { type?: 'sidebar' | 'banner' | 'login' }) {
  const ads = [
    {
      title: "Master en React Pro",
      desc: "Domina el desarrollo moderno con este curso 100% online.",
      tag: "PATROCINADO",
      color: "bg-indigo-600"
    },
    {
      title: "Cursos de Python 2026",
      desc: "Aprende IA y Ciencia de Datos con los mejores.",
      tag: "OFERTA",
      color: "bg-emerald-600"
    }
  ]

  const ad = ads[Math.floor(Math.random() * ads.length)]

  if (type === 'sidebar') {
    return (
      <div className="mt-auto mx-4 mb-6 p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl relative overflow-hidden group border border-white/5">
        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
          <Sparkles className="text-white" size={40} />
        </div>
        <div className="relative z-10">
          <span className="text-[9px] font-black text-white/50 tracking-[0.2em] uppercase">{ad.tag}</span>
          <h4 className="text-white font-bold text-sm mt-1 leading-tight">{ad.title}</h4>
          <p className="text-white/60 text-[10px] mt-1.5 leading-relaxed">{ad.desc}</p>
          <button className="mt-3 w-full py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5">
            Ver más <ExternalLink size={10} />
          </button>
        </div>
      </div>
    )
  }

  if (type === 'login') {
    return (
      <div className="w-full p-6 bg-[#5B4FCF]/5 border border-[#5B4FCF]/10 rounded-2xl flex items-center gap-4 group cursor-pointer transition-soft hover:border-[#5B4FCF]/30">
        <div className="w-12 h-12 bg-[#5B4FCF] rounded-xl flex items-center justify-center text-white shadow-soft shrink-0">
          <Sparkles size={24} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#5B4FCF] tracking-widest uppercase">Promoción</span>
            <div className="h-px flex-1 bg-[#5B4FCF]/10" />
          </div>
          <h4 className="text-[#1A1A1A] font-bold text-sm mt-0.5">¡Ahorra en tus libros! 📚</h4>
          <p className="text-gray-400 text-xs mt-0.5">Obtén 20% de descuento usando el código 'CETIS030'</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full p-5 bg-white border border-gray-100 rounded-2xl flex items-center justify-between gap-6 shadow-soft group">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 ${ad.color} rounded-xl flex items-center justify-center text-white`}>
          <Sparkles size={20} />
        </div>
        <div>
          <h4 className="text-[#1A1A1A] font-bold text-sm">{ad.title}</h4>
          <p className="text-gray-400 text-xs">{ad.desc}</p>
        </div>
      </div>
      <button className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-500 text-xs font-bold rounded-xl transition-colors">
        Patrocinado
      </button>
    </div>
  )
}
