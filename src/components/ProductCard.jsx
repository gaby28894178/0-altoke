import React from 'react'
import { FiShoppingCart } from 'react-icons/fi'
import { GiHamburger } from 'react-icons/gi'
import './ProductCard.css'

export default function ComboCard({ producto, imagenSrc, onAdd }) {
  const descNorm = (producto?.descripcion || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const esComboConLata = descNorm.includes('lata')
  const nombreOriginal = (producto?.nombre || '').toString()
  const esTituloCombo = /\bcombo\b/i.test(nombreOriginal)
  const tituloLimpio = nombreOriginal.replace(/\bcombo\b/ig, '').replace(/\s{2,}/g, ' ').trim()
  const categoriaNorm = (producto?.categoria || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const esCategoriaCombo = /\bcombo(s)?\b/i.test(categoriaNorm)
  const esCategoriaBebidas = /\bbebidas\b/i.test(categoriaNorm)
  const esCombo = (esTituloCombo || esComboConLata || esCategoriaCombo) && !esCategoriaBebidas
  const etiquetaCombo = esCategoriaCombo && /combos/i.test(producto?.categoria || '') ? 'COMBOS' : 'COMBO'
  const ofertaLimite = Number(String(import.meta.env.VITE_OFERTA ?? '0').replace(/[^0-9.]/g,'')) || 0
  const descuento = Number(String(import.meta.env.VITE_DESCUENTO ?? '0').replace(/[^0-9.]/g,'')) || 0
  const basePrecio = Number(producto?.precio) || 0
  const aplicaDescuento = descuento > 0 && basePrecio < ofertaLimite
  const precioFinal = aplicaDescuento ? Math.round(basePrecio * (1 - descuento / 100)) : basePrecio
  return (
    <div className=" div
      relative
      h-[calc(15rem-12px)] sm:h-[calc(16rem-12px)]
      rounded-lg
      overflow-hidden
      border border-orange-200
      shadow-[0_2px_6px_rgba(0,0,0,0.08)]
      bg-white
      flex
      group transition-transform duration-300 ease-out transform-gpu sm:hover:-translate-y-[2px] sm:hover:scale-[1.04] sm:hover:shadow-lg
      max-w-[380px] sm:max-w-none mx-auto
    " style={{ willChange: 'transform' }}>
      <span className="shine absolute top-0 left-[-50%] h-full w-[30%] bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 mix-blend-overlay"></span>
      {/* Imagen con "AL TOKE" incluido en el diseño - 65% */}
      <div className="w-[60%] sm:w-[65%] h-full relative overflow-hidden rounded-l-lg bg-gray-800">
        {imagenSrc
          ? (() => {
              const primary = imagenSrc.replace(/\.(png|jpe?g)$/i, '.webp')
              return (
                <img
                  src={primary}
                  alt={producto.nombre}
                  className="w-full h-full object-cover img"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { e.currentTarget.src = imagenSrc }}
                />
              )
            })()
          : <div className="w-full h-full bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center text-3xl">
              🍔
            </div>
        }
        {esCombo && (
          <div className="absolute -left-2 top-[2.25rem] -rotate-[28deg] origin-top-left z-10 pointer-events-none">
            <div className="relative">
              <div className="absolute left-[-50%] top-1/2 -translate-y-1/2 w-[200%] h-[30px] bg-yellow-500"></div>
              <span className="relative text-white px-3 font-bold tracking-wide shadow-md" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.85)' }}>{etiquetaCombo}</span>
            </div>
          </div>
        )}
      
      </div>

      <div className="w-[40%] sm:w-[35%] h-full bg-gray-800 text-white py-2 px-0.5 flex flex-col justify-start relative">
        
        <div>
          <div className="flex items-center justify-center gap-1 mb-1 font-orbitron text-white text-[13px]">
            <span>AL T</span>
            <GiHamburger size={18} className="text-yellow-300" />
            <span>KE</span>
          </div>
          <h3 className="font-bold text-[13px] sm:text-[14px] text-yellow-300 leading-tight mb-1 text-center">
            {esTituloCombo ? tituloLimpio : nombreOriginal}
          </h3>
          
          {/* Descripción */}
          <p className="text-gray-300 text-[10px] sm:text-[11px] leading-tight clamp-3 overflow-hidden text-center mt-1.5">
            {producto.descripcion}
          </p>
        </div>

        {/* Precio y Botón (fijo debajo de la mitad) */}
        <div className="absolute left-0 right-0 bottom-[44px] px-0">
          <div className="space-y-1">
            {aplicaDescuento ? (
              <div>
                <span className="block text-center text-gray-300 line-through">${basePrecio}</span>
                <span className="block w-full bg-black text-yellow-300 text-xs px-2 py-0.5 text-center">2da unidad -{descuento}%</span>
                <span className="block text-center bg-black text-yellow-300 font-extrabold text-base px-2 py-0.5 rounded">${precioFinal}</span>
              </div>
            ) : (
              <span className="block text-center bg-green-500 text-white font-bold text-base px-2 py-0.5 rounded">${basePrecio}</span>
            )}
          </div>
        </div>
        <div className="absolute left-0 right-0 bottom-1 px-0">
          <button 
            onClick={onAdd}
            className="
              w-full
              flex items-center justify-center gap-1
              py-1.5 sm:py-2
              bg-gradient-to-r from-orange-500 to-red-500
              text-white font-medium
              rounded
              hover:from-orange-600 hover:to-red-600
              text-[11px]
            "
          >
            <FiShoppingCart size={12} />
            Agregar
          </button>
        </div>
      </div>
    </div>
  )
}