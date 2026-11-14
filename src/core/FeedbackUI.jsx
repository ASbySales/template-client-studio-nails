import { useRef, useState } from 'react'
import { RefreshCw, X } from 'lucide-react'
import { LOJA_TEMA } from '../config/tema'

export function BottomSheet({
  titulo,
  subtitulo,
  aoFechar,
  children,
  rodape,
  esquerdaHeader,
  direitaHeader,
  maxWidth = 'max-w-[430px]',
  z = 50,
  carregando = false,
  textoCarregando = 'Processando...',
}) {
  const [arraste, setArraste] = useState(0)
  const inicioY = useRef(null)
  const t = LOJA_TEMA.classes
  const fontHeading = LOJA_TEMA.fontHeading

  const onTouchStart = (e) => {
    if (carregando || e.touches.length !== 1) return
    inicioY.current = e.touches[0].clientY
  }

  const onTouchMove = (e) => {
    if (inicioY.current === null || carregando) return
    const delta = e.touches[0].clientY - inicioY.current
    if (delta > 0) setArraste(delta)
  }

  const onTouchEnd = () => {
    if (inicioY.current === null) return
    if (arraste > 95 && !carregando) {
      setArraste(0)
      inicioY.current = null
      aoFechar?.()
      return
    }
    setArraste(0)
    inicioY.current = null
  }

  return (
    <div
      onClick={() => {
        if (!carregando) aoFechar?.()
      }}
      className={`fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4 ag-anim-fade ${t.backdrop}`}
      style={{ zIndex: z }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${maxWidth} max-h-[92vh] sm:max-h-[90vh] rounded-t-[28px] sm:rounded-3xl flex flex-col overflow-hidden ag-anim-sheet ${t.sheetSurface}`}
        style={{
          transform: arraste ? `translateY(${arraste}px)` : undefined,
          transition: arraste ? 'none' : 'transform 0.2s ease',
        }}
      >
        {carregando && (
          <div className={`absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 ${t.spinnerBg}`}>
            <div className={`w-10 h-10 border-4 rounded-full animate-spin ${t.spinnerRing}`} />
            <p className={`text-xs sm:text-sm font-semibold ${fontHeading} ${t.textPrimary}`}>
              {textoCarregando}
            </p>
          </div>
        )}

        {/* Area de arraste no mobile + cabecalho */}
        <div
          className={`pt-2.5 pb-3 px-4 border-b shrink-0 touch-none ${t.sheetBorder}`}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className={`mx-auto h-1.5 w-11 rounded-full mb-2.5 sm:hidden ${t.sheetHandle}`} />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {esquerdaHeader}
              <div className="min-w-0 text-left">
                <h2 className={`text-sm sm:text-base font-bold truncate ${fontHeading} ${t.textPrimary}`}>
                  {titulo}
                </h2>
                {subtitulo && (
                  <p className={`text-[11px] truncate ${t.textMuted}`}>{subtitulo}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {direitaHeader}
              <button
                type="button"
                disabled={carregando}
                onClick={aoFechar}
                aria-label="Fechar"
                className={`h-8 w-8 rounded-full flex items-center justify-center font-bold cursor-pointer transition-transform active:scale-90 ${t.closeBtn}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain no-scrollbar p-4">
          {children}
        </div>

        {rodape && (
          <div className={`px-4 pt-3 ag-pb-safe border-t shrink-0 ${t.sheetBorder}`}>
            {rodape}
          </div>
        )}
      </div>
    </div>
  )
}

export function PuxarAtualizar({ aoAtualizar, children, className = '' }) {
  const inicioRef = useRef(null)
  const [puxado, setPuxado] = useState(0)
  const [atualizando, setAtualizando] = useState(false)
  const t = LOJA_TEMA.classes

  const onTouchStart = (e) => {
    if (atualizando || e.touches.length !== 1) return
    const topoScroll = (window.scrollY || document.documentElement.scrollTop || 0) <= 2
    const bloqueado = document.body.style.position === 'fixed'
    if (topoScroll && !bloqueado) {
      inicioRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
    } else {
      inicioRef.current = null
    }
  }

  const onTouchMove = (e) => {
    if (!inicioRef.current || atualizando) return
    const touch = e.touches[0]
    const dy = touch.clientY - inicioRef.current.y
    const dx = Math.abs(touch.clientX - inicioRef.current.x)

    if (dx > Math.abs(dy) && dx > 10) {
      inicioRef.current = null
      setPuxado(0)
      return
    }

    if (dy > 8) {
      setPuxado(Math.min(84, (dy - 8) * 0.48))
    }
  }

  const onTouchEnd = async () => {
    if (!inicioRef.current) return
    inicioRef.current = null

    if (puxado > 54 && aoAtualizar) {
      setAtualizando(true)
      setPuxado(46)
      try {
        await aoAtualizar()
      } finally {
        setAtualizando(false)
        setPuxado(0)
      }
    } else {
      setPuxado(0)
    }
  }

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className={className}
    >
      {(puxado > 0 || atualizando) && (
        <div
          className="flex items-center justify-center overflow-hidden transition-all duration-150"
          style={{ height: puxado }}
        >
          <RefreshCw
            className={`w-5 h-5 ${t.refreshIcon} ${atualizando ? 'animate-spin' : ''}`}
            style={{ transform: `rotate(${puxado * 4}deg)` }}
          />
        </div>
      )}
      {children}
    </div>
  )
}

export function EstadoVazio({
  Icone,
  titulo,
  texto,
  acaoRotulo,
  aoClicar,
  className = '',
}) {
  const t = LOJA_TEMA.classes
  const fontHeading = LOJA_TEMA.fontHeading

  return (
    <div className={`flex flex-col items-center justify-center text-center py-10 px-5 gap-2.5 ${className}`}>
      {Icone && (
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-1 ${t.emptyIconWrap}`}>
          <Icone className={`w-6 h-6 ${t.emptyIcon}`} />
        </div>
      )}
      <p className={`text-sm font-bold ${fontHeading} ${t.textPrimary}`}>{titulo}</p>
      {texto && <p className={`text-xs max-w-[230px] leading-relaxed ${t.textMuted}`}>{texto}</p>}
      {acaoRotulo && aoClicar && (
        <button
          type="button"
          onClick={aoClicar}
          className={`mt-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-transform active:scale-95 ${t.secondaryBtn}`}
        >
          {acaoRotulo}
        </button>
      )}
    </div>
  )
}
