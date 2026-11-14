import { useCallback, useEffect, useState } from 'react'
import { carregarCatalogoTenant } from './catalogoService'
import { TENANT_ID } from './env'

export function useCatalogo(tenantId = TENANT_ID) {
  const [estado, setEstado] = useState({
    categorias: [],
    categoriasVitrine: [],
    adicionais: [],
    itensVitrine: [],
    loading: true,
    erro: '',
  })

  const carregar = useCallback(
    async ({ silencioso = false } = {}) => {
      if (!silencioso) {
        setEstado((prev) => ({ ...prev, loading: true, erro: '' }))
      }
      try {
        const dados = await carregarCatalogoTenant(tenantId)
        setEstado({
          ...dados,
          loading: false,
          erro: '',
        })
      } catch (err) {
        console.error('Erro ao carregar catálogo de procedimentos:', err)
        setEstado((prev) => ({
          ...prev,
          loading: false,
          erro: 'Não foi possível carregar o catálogo agora. Puxe para atualizar ou tente novamente.',
        }))
      }
    },
    [tenantId]
  )

  useEffect(() => {
    let ativo = true
    carregarCatalogoTenant(tenantId)
      .then((dados) => {
        if (!ativo) return
        setEstado({
          ...dados,
          loading: false,
          erro: '',
        })
      })
      .catch((err) => {
        console.error('Erro ao carregar catálogo de procedimentos:', err)
        if (!ativo) return
        setEstado((prev) => ({
          ...prev,
          loading: false,
          erro: 'Não foi possível carregar o catálogo agora. Puxe para atualizar ou tente novamente.',
        }))
      })

    return () => {
      ativo = false
    }
  }, [tenantId])

  const recarregar = useCallback(() => carregar({ silencioso: true }), [carregar])

  return {
    ...estado,
    recarregar,
  }
}
