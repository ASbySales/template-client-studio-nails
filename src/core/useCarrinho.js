import { useCallback, useEffect, useRef, useState } from 'react'
import { STORAGE_PREFIX } from './env'
import {
  LIMITE_SUBSTITUTIVOS,
  calcularTotalCarrinho,
  contarSubstitutivos,
  limparOpcionaisZerados,
} from './regrasCalculo'
import { carregarCarrinhoLocal, salvarCarrinhoLocal } from './checkoutService'

export function useCarrinho(opcionaisData = [], avisar = null) {
  const [itens, setItens] = useState(() => carregarCarrinhoLocal(STORAGE_PREFIX))
  const itensRef = useRef(itens)

  useEffect(() => {
    itensRef.current = itens
    salvarCarrinhoLocal(itens, STORAGE_PREFIX)
  }, [itens])

  const totalItens = itens.reduce((acc, it) => acc + (Number(it.quantidade) || 1), 0)
  const totalValor = calcularTotalCarrinho(itens, opcionaisData)

  const adicionarAoCarrinho = useCallback(
    (produto, { quantidadePrincipal = 1, opcionais = {} } = {}) => {
      if (!produto) return
      const opcionaisLimpos = limparOpcionaisZerados(opcionais)
      const novoItem = {
        idEscolha: Date.now() + Math.random(),
        produto,
        quantidade: Math.max(1, Number(quantidadePrincipal) || 1),
        opcionais: opcionaisLimpos,
      }
      setItens((prev) => [...prev, novoItem])
      avisar?.(`${produto.nome} adicionado ao agendamento`)
    },
    [avisar]
  )

  const removerItem = useCallback(
    (idEscolha) => {
      const listaAtual = itensRef.current
      const idx = listaAtual.findIndex((i) => i.idEscolha === idEscolha)
      if (idx === -1) return
      const removido = listaAtual[idx]

      setItens((prev) => prev.filter((i) => i.idEscolha !== idEscolha))

      if (avisar) {
        avisar(`"${removido?.produto?.nome || 'Procedimento'}" removido`, {
          rotulo: 'Desfazer',
          fn: () => {
            setItens((atuais) => {
              if (atuais.some((i) => i.idEscolha === removido.idEscolha)) {
                return atuais
              }
              const copia = [...atuais]
              copia.splice(Math.min(idx, copia.length), 0, removido)
              return copia
            })
          },
        })
      }
    },
    [avisar]
  )

  const limparCarrinho = useCallback(() => {
    const snapshot = itensRef.current
    if (!snapshot.length) return
    setItens([])

    if (avisar) {
      avisar('Agendamento limpo', {
        rotulo: 'Desfazer',
        fn: () => setItens(snapshot),
      })
    }
  }, [avisar])

  const alterarQtdPrincipal = useCallback((idEscolha, deltaOuDirecao) => {
    const delta =
      deltaOuDirecao === 'mais'
        ? 1
        : deltaOuDirecao === 'menos'
          ? -1
          : Number(deltaOuDirecao) || 0

    setItens((prev) =>
      prev.map((item) => {
        if (item.idEscolha !== idEscolha) return item
        const qtdAtual = Number(item.quantidade) || 1
        return {
          ...item,
          quantidade: Math.max(1, qtdAtual + delta),
        }
      })
    )
  }, [])

  const alterarOpcionalItem = useCallback(
    (idEscolha, opc, delta) => {
      if (!opc) return
      setItens((prev) =>
        prev.map((item) => {
          if (item.idEscolha !== idEscolha) return item
          if (item.produto?.aceita_adicionais === false) return item

          const atual = Number(item.opcionais?.[opc.id]) || 0
          if (delta > 0 && opc.tipo === 'substitutivo') {
            const totalSubst = contarSubstitutivos(item.opcionais, opcionaisData)
            if (totalSubst >= LIMITE_SUBSTITUTIVOS) return item
          }

          const novaQtd = Math.max(0, atual + delta)
          const novosOpcionais = { ...(item.opcionais || {}) }
          if (novaQtd > 0) novosOpcionais[opc.id] = novaQtd
          else delete novosOpcionais[opc.id]

          return {
            ...item,
            opcionais: novosOpcionais,
          }
        })
      )
    },
    [opcionaisData]
  )

  return {
    itens,
    setItens,
    totalItens,
    totalValor,
    adicionarAoCarrinho,
    removerItem,
    limparCarrinho,
    alterarQtdPrincipal,
    alterarOpcionalItem,
  }
}
