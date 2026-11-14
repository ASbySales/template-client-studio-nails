import { useCallback, useEffect, useRef, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { LOJA_TEMA } from '../config/tema'
import { UIContext } from './uiContext'
import { useOverlayBack, useScrollLock } from './hooksUi'
import './core.css'

export default function UIProvider({ children }) {
  const [toast, setToast] = useState(null)
  const [confirmacao, setConfirmacao] = useState(null)
  const timerRef = useRef(null)
  const t = LOJA_TEMA.classes
  const fontHeading = LOJA_TEMA.fontHeading

  useEffect(() => {
    return () => window.clearTimeout(timerRef.current)
  }, [])

  const fecharToast = useCallback(() => {
    window.clearTimeout(timerRef.current)
    setToast(null)
  }, [])

  const avisar = useCallback((msg, acao) => {
    window.clearTimeout(timerRef.current)
    setToast({ msg, acao, id: Date.now() })
    timerRef.current = window.setTimeout(() => {
      setToast(null)
    }, acao ? 5000 : 3200)
  }, [])

  const confirmar = useCallback((opcoes) => {
    return new Promise((resolve) => {
      setConfirmacao({ ...opcoes, resolve })
    })
  }, [])

  const responderConfirmacao = useCallback((valor) => {
    setConfirmacao((atual) => {
      if (atual?.resolve) atual.resolve(valor)
      return null
    })
  }, [])

  useScrollLock(Boolean(confirmacao))
  useOverlayBack(Boolean(confirmacao), () => responderConfirmacao(false))

  return (
    <UIContext.Provider value={{ avisar, confirmar, fecharToast }}>
      {children}

      {toast && (
        <div
          key={toast.id}
          className="fixed left-3 right-3 z-[90] pointer-events-none ag-anim-pop ag-pt-safe"
        >
          <div
            className={`pointer-events-auto mx-auto max-w-md flex items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl border backdrop-blur-md ${t.toastBox}`}
          >
            <Sparkles className={`w-4 h-4 shrink-0 ${t.toastAccent}`} />
            <span className="text-xs sm:text-sm font-medium flex-1 text-left">
              {toast.msg}
            </span>
            {toast.acao && (
              <button
                type="button"
                onClick={() => {
                  toast.acao.fn?.()
                  fecharToast()
                }}
                className={`text-xs sm:text-sm font-bold px-2.5 py-1 rounded-lg cursor-pointer transition-transform active:scale-95 ${t.toastAccent} hover:opacity-85`}
              >
                {toast.acao.rotulo}
              </button>
            )}
          </div>
        </div>
      )}

      {confirmacao && (
        <div
          onClick={() => responderConfirmacao(false)}
          className={`fixed inset-0 z-[95] flex items-end sm:items-center justify-center p-0 sm:p-4 ag-anim-fade ${t.backdrop}`}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 ag-pb-safe ag-anim-sheet shadow-2xl text-left ${t.sheetSurface}`}
          >
            <div className={`mx-auto h-1.5 w-11 rounded-full mb-3 sm:hidden ${t.sheetHandle}`} />
            <h3 className={`text-base sm:text-lg font-bold ${fontHeading} ${t.textPrimary}`}>
              {confirmacao.titulo}
            </h3>
            {confirmacao.texto && (
              <p className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${t.textMuted}`}>
                {confirmacao.texto}
              </p>
            )}
            <div className="grid grid-cols-2 gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => responderConfirmacao(false)}
                className={`h-11 rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-transform active:scale-95 ${t.secondaryBtn}`}
              >
                {confirmacao.cancelar || 'Cancelar'}
              </button>
              <button
                type="button"
                onClick={() => responderConfirmacao(true)}
                className={`h-11 rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-transform active:scale-95 ${
                  confirmacao.perigo ? t.dangerBtn : t.primaryBtn
                }`}
              >
                {confirmacao.ok || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </UIContext.Provider>
  )
}
