import React from 'react'
import { FiShoppingCart } from 'react-icons/fi'
import { GiHamburger } from 'react-icons/gi'
import './ProductCard.css'

export default function ComboCard({ producto, imagenSrc, onAdd, priority = false }) {
  const nombreOriginal = (producto?.nombre || '').toString()
  const esTituloCombo = /\bcombo\b/i.test(nombreOriginal)
  const tituloLimpio = nombreOriginal.replace(/\bcombo\b/ig, '').replace(/\s{2,}/g, ' ').trim()
  const categoriaNorm = (producto?.categoria || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const esCategoriaCombo = /\bcombos\b/i.test(categoriaNorm)
  const esCombo = esTituloCombo && esCategoriaCombo
  const etiquetaCombo = 'COMBO'
  const ofertaLimite = Number(String(import.meta.env.VITE_OFERTA ?? '0').replace(/[^0-9.]/g,'')) || 0
  const descuento = Number(String(import.meta.env.VITE_DESCUENTO ?? '0').replace(/[^0-9.]/g,'')) || 0
  const basePrecio = Number(producto?.precio) || 0
  const aplicaDescuento = descuento > 0 && basePrecio < ofertaLimite
  const precioFinal = aplicaDescuento ? Math.round(basePrecio * (1 - descuento / 100)) : basePrecio
  const renderDescripcion = () => {
    const t = String(producto?.descripcion || '')
    const parts = t.split(/(arte(?:san|zan)al)/ig)
    return parts.map((p, i) => (
      /^arte(?:san|zan)al$/i.test(p)
        ? <span key={i} className="text-orange-500">{p}</span>
        : <span key={i}>{p}</span>
    ))
  }
  const sinStock = (Number(producto?.precio) || 0) <= 0 || (Number(producto?.stock ?? 1) <= 0)
  
  return (
    <div className="combo-card">
      <span className="shine"></span>
      
      {/* Imagen con "AL TOKE" incluido en el diseño - 65% */}
      <div className="combo-card-image">
        {imagenSrc
          ? (() => {
              const isLocal = /^\/combos\//i.test(imagenSrc)
              if (isLocal) {
                const m = imagenSrc.match(/\/combos\/(.+?)\.(png|jpe?g|webp)$/i)
                const base = m ? m[1] : imagenSrc.replace(/^\/combos\//, '').replace(/\.(png|jpe?g|webp)$/i, '')
                const safe = base.replace(/\s/g, '%20')
                const w424 = `/combos/${safe}_424.webp`
                const w640 = `/combos/${safe}_640.webp`
                const w800 = `/combos/${safe}_800.webp`
                const j424 = `/combos/${safe}_424.jpg`
                const j640 = `/combos/${safe}_640.jpg`
                const j800 = `/combos/${safe}_800.jpg`
                const fallback = j640
                return (
                  <picture>
                    <source type="image/webp" srcSet={`${w424} 424w, ${w640} 640w, ${w800} 800w`} sizes="(max-width: 630px) 424px, 640px" />
                    <source type="image/jpeg" srcSet={`${j424} 424w, ${j640} 640w, ${j800} 800w`} sizes="(max-width: 630px) 424px, 640px" />
                    <img
                      src={fallback}
                      alt={producto.nombre}
                      className="combo-card-img"
                      loading={priority ? 'eager' : 'lazy'}
                      fetchpriority={priority ? 'high' : 'low'}
                      decoding="async"
                      onError={(e) => { e.currentTarget.src = imagenSrc }}
                    />
                  </picture>
                )
              }
              const primary = imagenSrc.replace(/\.(png|jpe?g)$/i, '.webp')
              return (
                <img
                  src={primary}
                  alt={producto.nombre}
                  className="combo-card-img"
                  loading={priority ? 'eager' : 'lazy'}
                  fetchpriority={priority ? 'high' : 'low'}
                  decoding="async"
                  onError={(e) => { e.currentTarget.src = imagenSrc }}
                />
              )
            })()
          : <div className="combo-card-placeholder">
              🍔
            </div>
        }
        {esCombo && (
          <div className="combo-badge">
            <div className="combo-badge-bg"></div>
            <span className="combo-badge-text">{etiquetaCombo}</span>
          </div>
        )}
      </div>

      <div className="combo-card-content">
        <div className="combo-card-header">
          <div className="combo-card-title">
            <span>AL T</span>
            <GiHamburger size={20} className="combo-card-burger" />
            <span>KE</span>
          </div>
          <h3 className="combo-card-name">
            {`Combo ${producto?.id ?? ''}`}
          </h3>
          
          <p className="combo-card-description">
            {renderDescripcion()}
          </p>
        </div>

        {/* Precio y Botón (fijo debajo de la mitad) */}
        <div className="combo-card-price-section">
          <div className="combo-card-prices">
            {aplicaDescuento ? (
              <div>
                <span className="combo-card-original-price">${basePrecio.toFixed(2)}</span>
                <span className="combo-card-discount-badge">2da unidad -{descuento}%</span>
                <span className="combo-card-final-price">${precioFinal.toFixed(2)}</span>
              </div>
            ) : (
              <span className="combo-card-normal-price">${basePrecio.toFixed(2)}</span>
            )}
          </div>
        </div>
        <div className="combo-card-button-section">
          <button 
            onClick={onAdd}
            disabled={sinStock}
            className="combo-card-button"
          >
            <FiShoppingCart size={12} />
            {sinStock ? 'Sin stock' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  )
}