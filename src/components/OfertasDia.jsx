import React, { useEffect, useMemo, useRef, useState } from 'react'
import "./OfertasDia.css" 

function normalizeImagen(img) {
  if (!img || typeof img !== 'string') return null
  if (/^https?:\/\//.test(img)) return img
  const isFile = /(png|jpe?g|gif|webp|svg)$/i.test(img)
  if (!isFile) return null
  const clean = img.replace(/^\.\//, '').replace(/^\//, '')
  const withBase = clean.startsWith('combos/') ? clean : `combos/${clean}`
  return `/${withBase}`
}

const getProdImagenSrc = (prod) => {
  const local = normalizeImagen(prod?.imagen)
  if (local) return local
  const url = String(prod?.imagenUrl || '')
  return /^https?:\/\//.test(url) ? url : null
}

const truncate = (s, n) => {
  const t = String(s || '')
  return t.length <= n ? t : t.slice(0, Math.max(0, n - 1)) + '…'
}

export default function OfertasDia() {
  const [productos, setProductos] = useState([])
  const [active, setActive] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)
  const trackRef = useRef(null)
  const ofertaPorcentaje = Number(String(import.meta.env.VITE_DESCUENTO ?? '0').replace(/[^0-9.]/g,'')) || 0
  const ofertaMinPrecio = Number(String(import.meta.env.VITE_OFERTA ?? '0').replace(/[^0-9.]/g,'')) || 0

  useEffect(() => {
    fetch('/combos/productos.json')
      .then(r => r.json())
      .then(setProductos)
      .catch(() => setProductos([]))
  }, [])

  const ofertasList = useMemo(() => {
    return productos.filter(p => Number(p.precio) < ofertaMinPrecio)
  }, [productos, ofertaMinPrecio])

  const prev = () => setActive(a => (a <= 0 ? Math.max(0, ofertasList.length - 1) : a - 1))
  const next = () => setActive(a => (a >= ofertasList.length - 1 ? 0 : a + 1))

  useEffect(() => {
    if (!ofertasList.length) return
    const id = setInterval(() => {
      setActive(a => (a >= ofertasList.length - 1 ? 0 : a + 1))
    }, 5000)
    return () => clearInterval(id)
  }, [ofertasList.length])

  useEffect(() => {
    const el = trackRef.current
    if (!el || !ofertasList.length) return
    const slides = el.querySelectorAll('.carousel-slide')
    const target = slides[active]
    const left = target ? target.offsetLeft : active * el.clientWidth
    if (active === 0 && !isInitialized) {
      el.scrollTo({ left: 0, behavior: 'auto' })
      setIsInitialized(true)
    } else {
      el.scrollTo({ left, behavior: 'smooth' })
    }
  }, [active, ofertasList.length, isInitialized])

  // Reset initialization cuando cambia la lista
  useEffect(() => {
    setIsInitialized(false)
  }, [ofertasList.length])

  return (
    ofertasList.length === 0 ? null : (
    <section className="ofertas-container">
      <h2 className="ofertas-titulo">Ofertas del Día</h2>
      
      <div className="carousel-wrapper">
        <div 
          ref={trackRef} 
          className="carousel-track"
          style={{ scrollBehavior: 'smooth' }}
        >
          {ofertasList.map((prod, idx) => {
            const base = Number(prod.precio)
            const oferta = Math.round(base * (1 - (ofertaPorcentaje || 0) / 100))
            
            return (
              <div 
                key={prod.id || idx} 
                className="carousel-slide"
                data-slide-index={idx}
              >
                <div className="slide-content">
                  <div className="image-section">
                    <div className="image-container-fixed">
                      {getProdImagenSrc(prod) ? (() => {
                        const original = getProdImagenSrc(prod)
                        if (/^\/combos\//i.test(original)) {
                          const m = original.match(/\/combos\/(.+?)\.(png|jpe?g|webp)$/i)
                          const base = m ? m[1] : original.replace(/^\/combos\//, '').replace(/\.(png|jpe?g|webp)$/i, '')
                          const w424 = `/combos/${base}_424.webp`
                          const w640 = `/combos/${base}_640.webp`
                          const w800 = `/combos/${base}_800.webp`
                          const j424 = `/combos/${base}_424.jpg`
                          const j640 = `/combos/${base}_640.jpg`
                          const j800 = `/combos/${base}_800.jpg`
                          const fallback = j640
                          return (
                            <picture>
                              <source type="image/webp" srcSet={`${w424} 424w, ${w640} 640w, ${w800} 800w`} sizes="(max-width: 630px) 424px, 640px" />
                              <source type="image/jpeg" srcSet={`${j424} 424w, ${j640} 640w, ${j800} 800w`} sizes="(max-width: 630px) 424px, 640px" />
                              <img 
                                src={fallback}
                                alt={prod.nombre} 
                                className="standardized-image imagencarrucel"
                                loading={idx === 0 ? 'eager' : 'lazy'}
                                decoding="async"
                                fetchpriority={idx === 0 ? 'high' : 'low'}
                                onError={(e) => {
                                  const cur = e.currentTarget.src
                                  if (/\.webp($|\?)/i.test(cur)) {
                                    e.currentTarget.src = original
                                    return
                                  }
                                  e.currentTarget.style.display = 'none'
                                  const placeholder = e.currentTarget.nextElementSibling
                                  if (placeholder) placeholder.style.display = 'flex'
                                }}
                              />
                            </picture>
                          )
                        }
                        const primary = String(original).replace(/\.(png|jpe?g)$/i, '.webp')
                        return (
                          <img 
                            src={idx === 0 ? primary : primary}
                            alt={prod.nombre} 
                            className="standardized-image imagencarrucel"
                            loading={idx === 0 ? 'eager' : 'lazy'}
                            decoding="async"
                            fetchpriority={idx === 0 ? 'high' : 'low'}
                            onError={(e) => {
                              const cur = e.currentTarget.src
                              if (/\.webp($|\?)/i.test(cur)) {
                                e.currentTarget.src = original
                                return
                              }
                              e.currentTarget.style.display = 'none'
                              const placeholder = e.currentTarget.nextElementSibling
                              if (placeholder) placeholder.style.display = 'flex'
                            }}
                          />
                        )
                      })() : null}
                      <div className="image-placeholder-fixed">
                        📦
                      </div>
                    </div>
                  </div>
                  <div className="content-section">
                    <div className="text-content-centered">
                      <h3 className="product-name-centered">{prod.nombre}</h3>
                      <p className="product-description-centered">{truncate(prod.descripcion, 39)}</p>
                      
                      <div className="discount-banner-centered">
                        <p>Descuento del {ofertaPorcentaje}% aplicado</p>
                      </div>
                    </div>
                    
                    <div className="pricing-section-centered">
                      <div className="prices-row">
                        <span className="original-price-centered">${base.toLocaleString()}</span>
                        <span className="discount-price-centered">${oferta.toLocaleString()}</span>
                      </div>
                      
                      <div className="badges-row">
                        <span className="percentage-badge-compact">-{ofertaPorcentaje}%</span>
                        <span className="min-price-badge-compact">Menor a ${ofertaMinPrecio.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {ofertasList.length > 1 && (
          <div className="carousel-indicators">
            {ofertasList.map((_, idx) => (
              <button
                key={idx}
                className={`indicator ${idx === active ? 'active' : ''}`}
                onClick={() => {
                  setActive(idx)
                  setIsInitialized(true)
                }}
                aria-label={`Ir a oferta ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
    )
  )
}