import { useEffect, useRef } from 'react'

let lockCount = 0

function aplicarScrollLock() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return
  const scrollY = window.scrollY || window.pageYOffset || 0
  document.body.dataset.scrollY = String(scrollY)
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollY}px`
  document.body.style.left = '0'
  document.body.style.right = '0'
  document.body.style.width = '100%'
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'
}

function liberarScrollLock() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return
  const scrollY = document.body.dataset.scrollY
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.left = ''
  document.body.style.right = ''
  document.body.style.width = ''
  document.body.style.overflow = ''
  document.documentElement.style.overflow = ''
  if (scrollY !== undefined && scrollY !== '') {
    window.scrollTo(0, parseInt(scrollY, 10) || 0)
    delete document.body.dataset.scrollY
  }
}

export function useScrollLock(ativo) {
  useEffect(() => {
    if (!ativo) return undefined

    if (lockCount === 0) {
      aplicarScrollLock()
    }
    lockCount += 1

    return () => {
      lockCount = Math.max(0, lockCount - 1)
      if (lockCount === 0) {
        liberarScrollLock()
      }
    }
  }, [ativo])
}

const overlayStack = []
let sentinelPushed = false
let suppressNextPop = 0
let listenerAttached = false
let syncTimer = null

function scheduleHistorySync(delay = 0) {
  if (typeof window === 'undefined') return
  window.clearTimeout(syncTimer)
  syncTimer = window.setTimeout(() => {
    if (overlayStack.length > 0 && !sentinelPushed) {
      sentinelPushed = true
      window.history.pushState(
        { ...(window.history.state || {}), __agOverlaySentinel: true },
        ''
      )
    } else if (overlayStack.length === 0 && sentinelPushed) {
      sentinelPushed = false
      if (window.history.state?.__agOverlaySentinel) {
        suppressNextPop += 1
        window.history.back()
      }
    }
  }, delay)
}

function ensurePopListener() {
  if (listenerAttached || typeof window === 'undefined') return
  listenerAttached = true
  window.addEventListener('popstate', () => {
    if (suppressNextPop > 0) {
      suppressNextPop -= 1
      return
    }
    if (overlayStack.length > 0) {
      sentinelPushed = false
      const topo = overlayStack.pop()
      topo?.onClose?.()
      scheduleHistorySync(35)
    }
  })
}

export function useOverlayBack(ativo, aoFechar) {
  const aoFecharRef = useRef(aoFechar)

  useEffect(() => {
    aoFecharRef.current = aoFechar
  })

  useEffect(() => {
    if (!ativo || typeof window === 'undefined') return undefined
    ensurePopListener()

    const entrada = {
      onClose: () => aoFecharRef.current?.(),
    }

    overlayStack.push(entrada)
    scheduleHistorySync(0)

    return () => {
      const idx = overlayStack.indexOf(entrada)
      if (idx !== -1) {
        overlayStack.splice(idx, 1)
      }
      scheduleHistorySync(0)
    }
  }, [ativo])
}
