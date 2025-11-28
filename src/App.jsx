import React, { useEffect, useMemo, useRef, useState } from 'react'
import { FiShoppingCart, FiMenu, FiX, FiPlus, FiMinus, FiTrash2, FiSend, FiHome, FiPhone, FiMoon, FiSun, FiSearch, FiLoader } from 'react-icons/fi'
import { GiHamburger } from 'react-icons/gi'
import { TbToolsKitchen2 } from 'react-icons/tb'
import ProductCard from './components/ProductCard'
import OfertasDia from './components/OfertasDia'

export default function TiendaComida() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [carrito, setCarrito] = useState([])
  const [categoriaActiva, setCategoriaActiva] = useState('todos')
  const [mostrarCarrito, setMostrarCarrito] = useState(false)
  const [mostrarPedidoModal, setMostrarPedidoModal] = useState(false)
  const [enviandoPedido, setEnviandoPedido] = useState(false)
  const [clienteNombre, setClienteNombre] = useState('')
  const [clienteTelefono, setClienteTelefono] = useState('')
  const [mostrarHorarioModal, setMostrarHorarioModal] = useState(false)
  const [mostrarContactoModal, setMostrarContactoModal] = useState(false)
  const [enviandoConsulta, setEnviandoConsulta] = useState(false)
  const [consultaMsg, setConsultaMsg] = useState('hola me gustaria hacer un pedido ya q su comida es muy rica')
  const [toastMsg, setToastMsg] = useState('')
  const [toastType, setToastType] = useState('success')
  const [verOfertas, setVerOfertas] = useState(true)
  const cardsRef = useRef(null)
  const [temaOscuro, setTemaOscuro] = useState(() => {
    const saved = localStorage.getItem('temaOscuro')
    return saved ? saved === 'true' : false
  })
  const [productos, setProductos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [logoOk, setLogoOk] = useState(true)
  const descuento = Number(String(import.meta.env.VITE_DESCUENTO ?? '0').replace(/[^0-9.]/g, '')) || 0
  const ofertaLimite = Number(String(import.meta.env.VITE_OFERTA ?? '0').replace(/[^0-9.]/g, '')) || 0
  const telefonoContacto = String(import.meta.env.VITE_CONTACT_PHONE ?? '+54 9 11 2333-9962')
  const diasAtencion = String(import.meta.env.VITE_ATTENTION_DAYS ?? '')

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg)
    setToastType(type)
    setTimeout(() => setToastMsg(''), 2500)
  }

  const getImagenSrc = (img) => {
    if (!img || typeof img !== 'string') return null
    if (/^https?:\/\//.test(img)) return img
    const isFile = /(png|jpe?g|gif|webp|svg|avif)$/i.test(img)
    if (!isFile) return null
    let clean = String(img).trim().replace(/^\.\/+/, '').replace(/^\/+/, '')
    clean = clean.replace(/^(\.\.\/)+/, '../')
    if (/^(combos|altoke|fondo-carrucel)\//i.test(clean)) {
      clean = clean.replace(/^\.\.\//, '')
      return `/${clean.replace(/\s/g, '%20')}`
    }
    return `/combos/${clean.replace(/\s/g, '%20')}`
  }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', temaOscuro)
    localStorage.setItem('temaOscuro', String(temaOscuro))
  }, [temaOscuro])

  useEffect(() => {
    fetch('/config/productos.json')
      .then(r => r.json())
      .then(setProductos)
      .catch(() => setProductos([]))
  }, [])


  const categorias = [
    { id: 'todos', nombre: 'Todos', icono: '🍽️' },
    { id: 'combos', nombre: 'Combos', icono: '🎉' },
    { id: 'hamburguesas', nombre: 'Hamburguesas', icono: '🍔' },
    { id: 'pizzas', nombre: 'Pizzas', icono: '🍕' },
    { id: 'panchos', nombre: 'Panchos', icono: '🌭' },
    { id: 'bebidas', nombre: 'Bebidas', icono: '🥤' },
  ]

  const agregarAlCarrito = (producto) => {
    const disponible = (Number(producto?.precio) || 0) > 0 && (Number(producto?.stock ?? 1) > 0)
    if (!disponible) {
      showToast('Sin stock o precio no disponible', 'error')
      return
    }
    const existe = carrito.find(item => item.id === producto.id)
    if (existe) {
      setCarrito(carrito.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item))
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }])
    }
    setBusqueda('')
  }

  const modificarCantidad = (id, accion) => {
    if (accion === 'aumentar') {
      setCarrito(carrito.map(item => item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item))
    } else {
      setCarrito(carrito.map(item => item.id === id && item.cantidad > 1 ? { ...item, cantidad: item.cantidad - 1 } : item))
    }
  }

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id))
  }

  const precioUnitarioBase = (item) => Number(item.precio) || 0
  const aplicaDescuentoItem = (item) => {
    const base = precioUnitarioBase(item)
    return descuento > 0 && base < ofertaLimite && item.cantidad >= 2
  }
  const precioSegundaUnidad = (item) => {
    const base = precioUnitarioBase(item)
    return Math.round(base * (1 - descuento / 100))
  }
  const totalItem = (item) => {
    const base = precioUnitarioBase(item)
    if (aplicaDescuentoItem(item)) {
      const desc = precioSegundaUnidad(item)
      return desc + base * (item.cantidad - 1)
    }
    return base * item.cantidad
  }
  const calcularTotal = () => carrito.reduce((total, item) => total + totalItem(item), 0)

  const construirMensaje = () => {
    let mensaje = '🍔 *NUEVO PEDIDO* 🍔\n\n'
    mensaje += '📋 *DETALLE:*\n'
    carrito.forEach(item => {
      const base = precioUnitarioBase(item)
      const line = totalItem(item)
      mensaje += `\n• ${item.cantidad}x ${item.nombre}\n`
      if (aplicaDescuentoItem(item)) {
        const desc = precioSegundaUnidad(item)
        mensaje += `  2da unidad: $${desc} | restantes: $${base}\n`
      } else {
        mensaje += `  $${base} c/u\n`
      }
      mensaje += `  Línea = $${line}\n`
    })
    mensaje += `\n💰 *TOTAL: $${calcularTotal()}*\n`
    mensaje += `\n👤 *Cliente:* ${clienteNombre || 'Sin nombre'}\n`
    mensaje += `📞 *Teléfono:* ${clienteTelefono || 'Sin teléfono'}\n`
    const replyTail = import.meta.env.VITE_WHATSAPP_REPLY || '¡Gracias por tu pedido! 😊'
    mensaje += `\n${replyTail}`
    return mensaje
  }

  const abrirPedidoModal = () => {
    if (carrito.length === 0) {
      alert('¡El carrito está vacío!')
      return
    }
    setMostrarPedidoModal(true)
  }

  const abrirWhatsAppWeb = (numero, texto, nuevaPestana = false) => {
    const phone = String(numero || '').replace(/[^0-9]/g, '')
    if (!phone || phone.length < 10) {
      window.location.href = '/error-whatsapp.html'
      return
    }
    const encoded = encodeURIComponent(String(texto || ''))
    const url = `https://wa.me/${phone}?text=${encoded}`
    if (nuevaPestana) {
      window.open(url, '_blank')
    } else {
      window.location.href = url
    }
  }

  const enviarWhatsAppConsulta = () => {
    const numeroWhatsApp = import.meta.env.VITE_WHATSAPP_NUMBER || '5491123339962'
    const replyText = String(import.meta.env.VITE_WHATSAPP_REPLY || '')
    const attentionDays = String(import.meta.env.VITE_ATTENTION_DAYS || '')
    const texto = `${consultaMsg || ''}\n\n⏰ Días de Atención: ${attentionDays}\n${replyText}`
    abrirWhatsAppWeb(numeroWhatsApp, texto, false)
    setMostrarContactoModal(false)
    showToast('Redirigiendo a WhatsApp', 'success')
  }

  const copiarMensaje = async () => {
    const texto = construirMensaje()
    try { await navigator.clipboard.writeText(texto) } catch {}
  }

  const enviarPedidoFinal = () => {
    if (carrito.length === 0) {
      alert('¡El carrito está vacío!')
      return
    }
    const numeroWhatsApp = import.meta.env.VITE_WHATSAPP_NUMBER || '5491123339962'
    const attentionDays = String(diasAtencion || '')
    const descuentoNum = Number(String(import.meta.env.VITE_DESCUENTO ?? '0').replace(/[^0-9.]/g,'')) || 0
    const base = construirMensaje()
    const hayDescuento = carrito.some(it => aplicaDescuentoItem(it)) && descuentoNum > 0
    const totalConDescuento = calcularTotal()
    const totalSinDescuento = carrito.reduce((t, it) => t + precioUnitarioBase(it) * it.cantidad, 0)
    const extras = hayDescuento
      ? `\n💸 Precio original: $${totalSinDescuento}\n🎯 Descuento aplicado: -${descuentoNum}%\n💰 TOTAL con descuento: $${totalConDescuento}\n📅 Fecha del Pedido: ${new Date().toLocaleDateString()}\n⏰ Días de Atención: ${attentionDays}`
      : `\n📅 Fecha del Pedido: ${new Date().toLocaleDateString()}\n⏰ Días de Atención: ${attentionDays}`
    const mensaje = `${base}\n${extras}`
    abrirWhatsAppWeb(numeroWhatsApp, mensaje, false)
    setMostrarPedidoModal(false)
    showToast('Redirigiendo a WhatsApp', 'success')
  }

  const productosFiltrados = useMemo(() => {
    const q = normalizeText(busqueda)
    if (!q) return productos
    return productos.filter(p => normalizeText(p.nombre).includes(q))
  }, [busqueda, productos])

  const cantidadItems = carrito.reduce((total, item) => total + item.cantidad, 0)
  const logoSrc = import.meta.env.VITE_LOGO_PATH || '/logo-altoke.png'

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <nav className="bg-gradient-to-r from-orange-500 to-red-500 dark:from-gray-800 dark:to-gray-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <button onClick={() => setMenuAbierto(!menuAbierto)} className="p-2 hover:bg-white/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/40" aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}>
                {menuAbierto ? <FiX size={28} /> : <FiMenu size={28} />}
              </button>

            <div className="flex items-center gap-3">
              <h1 className="text-[20px] sm:text-[26px] font-bold font-orbitron flex items-center gap-2 px-[2px] py-[2px]">
                <span>AL T</span>
                <GiHamburger size={24} className="text-yellow-300" />
                <span>KE</span>
              </h1>
              <div className="relative hidden sm:block ml-[11px] sm:ml-[14px]">
                <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/80" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar..."
                  className="w-40 sm:w-56 pl-8 pr-3 py-2 rounded-full bg-white/20 text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-white/40"
                  aria-label="Buscar productos"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setTemaOscuro(!temaOscuro)} className="p-2 hover:bg-white/20 rounded-lg transition-colors" aria-label="Cambiar tema">
                {temaOscuro ? <FiSun size={24} /> : <FiMoon size={24} />}
              </button>
              <button onClick={() => setMostrarCarrito(!mostrarCarrito)} className="relative p-2 hover:bg-white/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/40" aria-label={mostrarCarrito ? 'Cerrar carrito' : 'Abrir carrito'}>
                <FiShoppingCart size={28} />
                {cantidadItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-600 font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center animate-pulse">
                    {cantidadItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {menuAbierto && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setMenuAbierto(false)}>
          <div className="bg-white dark:bg-gray-800 w-72 h-full shadow-2xl p-6 animate-slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-orange-600">Menú</h2>
              <button onClick={() => setMenuAbierto(false)}>
                <FiX size={24} className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* Buscador principal en menú (primer ítem) */}
            <div className="relative mb-4">
              <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/90 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div className="space-y-4">
              <button onClick={() => { setMenuAbierto(false); setCategoriaActiva('todos'); setVerOfertas(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="w-full flex items-center gap-3 p-4 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <FiHome size={24} className="text-orange-500" />
                <span className="font-semibold text-gray-800 dark:text-gray-100">Inicio</span>
              </button>
              <button onClick={() => { setMenuAbierto(false); setCategoriaActiva('todos'); setVerOfertas(false); cardsRef.current && cardsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} className="w-full flex items-center gap-3 p-4 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <TbToolsKitchen2 size={24} className="text-orange-500" />
                <span className="font-semibold text-gray-800 dark:text-gray-100">Productos</span>
              </button>
              <button onClick={() => { setMenuAbierto(false); setMostrarContactoModal(true) }} className="w-full flex items-center gap-3 p-4 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <FiPhone size={24} className="text-orange-500" />
                <span className="font-semibold text-gray-800 dark:text-gray-100">Contacto</span>
              </button>
            </div>

            <button onClick={() => setMostrarHorarioModal(true)} className="mt-8 w-full p-4 bg-gradient-to-r from-orange-100 to-red-100 dark:from-gray-700 dark:to-gray-700 rounded-lg text-left hover:from-orange-200 hover:to-red-200">
              <p className="text-sm font-semibold text-orange-800 dark:text-gray-100">📍 Horarios y Atención</p>
              <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">Tocar para ver días y teléfono</p>
            </button>
          </div>
        </div>
      )}

      {mostrarCarrito && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setMostrarCarrito(false)}>
          <div className="bg-white dark:bg-gray-800 w-full max-w-md h-full ml-auto shadow-2xl flex flex-col animate-slide-in-right" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 dark:from-gray-800 dark:to-gray-700 text-white p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Tu Carrito</h2>
                <button onClick={() => setMostrarCarrito(false)}>
                  <FiX size={24} />
                </button>
              </div>
              <p className="text-orange-100 mt-1">{cantidadItems} productos</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {carrito.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <FiShoppingCart size={64} className="mb-4" />
                  <p className="text-lg">Tu carrito está vacío</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {carrito.map(item => (
                    <div key={item.id} className="bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-gray-700 rounded-lg p-4 shadow-md">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-bold text-gray-800 dark:text-gray-100">{item.nombre}</p>
                          {(() => {
                            const base = precioUnitarioBase(item)
                            if (aplicaDescuentoItem(item)) {
                              const desc = precioSegundaUnidad(item)
                              return (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500 line-through">${base.toFixed(2)}</span>
                                  <span className="text-orange-600 font-semibold">${desc.toFixed(2)}</span>
                                  <span className="text-xs bg-black text-yellow-300 px-2 py-0.5 rounded">2da -{descuento}%</span>
                                </div>
                              )
                            }
                            return <p className="text-orange-600 font-semibold">${base.toFixed(2)}</p>
                          })()}
                        </div>
                        {getImagenSrc(item.imagen)
                          ? <img src={getImagenSrc(item.imagen)} alt={item.nombre} className="w-14 h-14 object-cover rounded-[1rem]" />
                          : <span className="text-3xl">{item.imagen}</span>
                        }
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 bg-orange-100 dark:bg-gray-700 rounded-lg p-1">
                          <button onClick={() => modificarCantidad(item.id, 'disminuir')} className="bg-orange-500 text-white p-1 rounded hover:bg-orange-600">
                            <FiMinus size={16} />
                          </button>
                          <span className="font-bold text-lg px-3 text-gray-800 dark:text-gray-100">{item.cantidad}</span>
                          <button onClick={() => modificarCantidad(item.id, 'aumentar')} className="bg-orange-500 text-white p-1 rounded hover:bg-orange-600">
                            <FiPlus size={16} />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          {(() => {
                            return (
                              <span className="font-bold text-lg text-orange-600">${totalItem(item).toFixed(2)}</span>
                            )
                          })()}
                          <button onClick={() => eliminarDelCarrito(item.id)} className="bg-red-500 text-white p-2 rounded hover:bg-red-600">
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {carrito.length > 0 && (
              <div className="border-t-2 border-orange-200 dark:border-gray-700 p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold text-gray-800 dark:text-gray-100">Total:</span>
                  <span className="text-3xl font-bold text-orange-600">${calcularTotal().toFixed(2)}</span>
                </div>
                <button onClick={abrirPedidoModal} className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-600 hover:to-green-700 flex items-center justify-center gap-2 shadow-lg transform hover:scale-105 transition-all">
                  <FiSend size={24} />
                  Enviar Pedido por WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}
{
      <main role="main" id="main-content">
      <div className="max-w-7xl mx-auto sm:px-4 px-2 py-3">
        {verOfertas && !busqueda.trim() && <OfertasDia />}

        

        <div ref={cardsRef} className="mt-6 mx-auto max-w-none grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(270px,1fr))] gap-[3px]">
          {productosFiltrados.map((producto, idx) => (
            <ProductCard
              key={producto.id}
              producto={producto}
              imagenSrc={getImagenSrc(producto.imagen)}
              onAdd={() => agregarAlCarrito(producto)}
              priority={idx === 0}
            />
          ))}
        </div>
      </div>
      </main> 
    }

      {!mostrarCarrito && carrito.length > 0 && (
        <button onClick={() => setMostrarCarrito(true)} className="fixed bottom-6 right-6 bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all z-30 focus:outline-none focus:ring-2 focus:ring-orange-300" aria-label="Abrir carrito">
          <div className="relative">
            <FiShoppingCart size={32} />
            <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-600 font-bold text-sm w-6 h-6 rounded-full flex items-center justify-center">
              {cantidadItems}
            </span>
          </div>
        </button>
      )}
      {mostrarHorarioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setMostrarHorarioModal(false)}>
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-2xl p-4">
              <h3 className="text-xl font-bold">Atención</h3>
            </div>
            <div className="p-4 space-y-3">
              {diasAtencion && (<p className="text-gray-800 dark:text-gray-100"><span className="font-semibold">Días:</span> {diasAtencion}</p>)}
              {telefonoContacto && (<p className="text-gray-800 dark:text-gray-100"><span className="font-semibold">Teléfono:</span> {telefonoContacto}</p>)}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button onClick={() => setMostrarHorarioModal(false)} className="px-4 py-2 rounded-lg bg-orange-500 text-white">Cerrar</button>
            </div>
          </div>
        </div>
      )}
      {mostrarContactoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setMostrarContactoModal(false)}>
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-2xl p-4">
              <h3 className="text-xl font-bold">Consulta por WhatsApp</h3>
            </div>
            <div className="p-4 space-y-3">
              {telefonoContacto && (<p className="text-gray-800 dark:text-gray-100"><span className="font-semibold">Teléfono:</span> {telefonoContacto}</p>)}
              <textarea value={consultaMsg} onChange={(e) => setConsultaMsg(e.target.value)} className="w-full h-28 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"></textarea>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button onClick={() => setMostrarContactoModal(false)} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100">Cancelar</button>
              <button onClick={enviarWhatsAppConsulta} disabled={enviandoConsulta} className="px-4 py-2 rounded-lg bg-green-600 text-white flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                {enviandoConsulta ? <FiLoader className="animate-spin" size={18} /> : <FiSend size={18} />}
                {enviandoConsulta ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
      {mostrarPedidoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setMostrarPedidoModal(false)}>
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-2xl p-4">
              <h3 className="text-xl font-bold">Confirmar pedido</h3>
              <p className="text-white/80 text-sm">Completa tus datos y revisa el mensaje</p>
            </div>
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <p className="text-sm text-gray-600 dark:text-gray-300"><span className="font-semibold">WhatsApp destino:</span> {String(import.meta.env.VITE_WHATSAPP_NUMBER || '5491123339962')}</p>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">Nombre</label>
                <input type="text" value={clienteNombre} onChange={(e) => setClienteNombre(e.target.value)} placeholder="Tu nombre" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">Teléfono</label>
                <input type="tel" value={clienteTelefono} onChange={(e) => setClienteTelefono(e.target.value)} placeholder="Tu número" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 -mx-4 px-4 py-3 border-t border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
                <button onClick={copiarMensaje} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-semibold">Copiar</button>
                <div className="flex items-center gap-3">
                  <button onClick={() => setMostrarPedidoModal(false)} className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold">Cancelar</button>
                  <button onClick={enviarPedidoFinal} disabled={enviandoPedido} className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                    {enviandoPedido ? <FiLoader className="animate-spin" size={18} /> : <FiSend size={18} />}
                    {enviandoPedido ? 'Enviando...' : 'Enviar pedido'}
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Mensaje a enviar</p>
                <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-100">{construirMensaje()}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {toastMsg && (
        <div className={`fixed bottom-0 left-0 right-0 z-50 w-full ${toastType === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          <div className="max-w-7xl mx-auto px-4 py-2 text-center text-white font-semibold">
            {toastMsg}
          </div>
        </div>
      )}
    </div>
  )
}
  const normalizeText = (s) => (s || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()