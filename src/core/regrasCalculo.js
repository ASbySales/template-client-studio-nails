export const LIMITE_SUBSTITUTIVOS = 10

export function parseValorNumerico(valor) {
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : 0
  const texto = String(valor ?? '0').trim()
  if (!texto) return 0
  const limpo = texto.includes(',')
    ? texto.replace(/[^\d,-]/g, '').replace(',', '.')
    : texto.replace(/[^\d.-]/g, '')
  const parsed = parseFloat(limpo)
  return Number.isFinite(parsed) ? parsed : 0
}

export function formatarMoeda(valor) {
  return (Number(valor) || 0).toFixed(2).replace('.', ',')
}

export function ordenarPorOrdem(a, b) {
  const ordA = a?.ordem ?? 999999
  const ordB = b?.ordem ?? 999999
  if (ordA !== ordB) return ordA - ordB
  return (Number(a?.id) || 0) - (Number(b?.id) || 0)
}

export function mascaraWhatsapp(valorBruto) {
  let digits = String(valorBruto || '').replace(/\D/g, '')
  if (digits.length > 11) digits = digits.slice(0, 11)
  if (digits.length > 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7)}`
  }
  if (digits.length > 2) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }
  if (digits.length > 0) {
    return `(${digits}`
  }
  return ''
}

export function validarWhatsapp(valor) {
  const digits = String(valor || '').replace(/\D/g, '')
  return {
    valido: digits.length >= 10 && digits.length <= 11,
    digits,
  }
}

export function isServicoUnitario(servico) {
  return servico?.tipo === 'extra' || servico?.tipo === 'substitutivo'
}

export function aceitaAdicionais(produto, opcionaisData = []) {
  return Boolean(
    produto &&
      produto.aceita_adicionais !== false &&
      Array.isArray(opcionaisData) &&
      opcionaisData.length > 0
  )
}

export function contarSubstitutivos(opcionais = {}, opcionaisData = []) {
  return Object.entries(opcionais || {}).reduce((acc, [idStr, qtd]) => {
    const o = (opcionaisData || []).find((x) => Number(x.id) === Number(idStr))
    return o && o.tipo === 'substitutivo' ? acc + (Number(qtd) || 0) : acc
  }, 0)
}

export function limparOpcionaisZerados(opcionais = {}) {
  const limpo = {}
  Object.entries(opcionais || {}).forEach(([idStr, qtd]) => {
    const idNum = Number(idStr)
    const qtdNum = Number(qtd) || 0
    if (Number.isInteger(idNum) && idNum > 0 && qtdNum > 0) {
      limpo[idNum] = qtdNum
    }
  })
  return limpo
}

export function calcularPrecoItem(item, opcionaisData = []) {
  if (!item || !item.produto) return 0
  const valorBase = parseValorNumerico(item.produto.valor ?? item.produto.preco)
  const qtdPrincipal = Math.max(1, Number(item.quantidade) || 1)
  let total = valorBase * qtdPrincipal

  Object.entries(item.opcionais || {}).forEach(([idStr, qtdOpc]) => {
    const qtd = Number(qtdOpc) || 0
    if (qtd <= 0) return
    const opc = (opcionaisData || []).find((o) => Number(o.id) === Number(idStr))
    if (!opc) return
    const valorOpc = parseValorNumerico(opc.valor ?? opc.preco)
    if (opc.tipo === 'substitutivo') {
      total += qtd * (valorOpc - valorBase / 10)
    } else {
      total += qtd * valorOpc
    }
  })

  return Math.max(0, total)
}

export function calcularTotalCarrinho(itens = [], opcionaisData = []) {
  return (itens || []).reduce(
    (soma, item) => soma + calcularPrecoItem(item, opcionaisData),
    0
  )
}

export function normalizarServico(raw, categoriaNome = '') {
  const valorNumerico = parseValorNumerico(raw?.valor ?? raw?.preco)
  const nome = raw?.nome || raw?.titulo || ''
  const img = raw?.img || raw?.imagem || ''
  return {
    ...raw,
    id: raw?.id,
    nome,
    titulo: nome,
    categoria: categoriaNome || raw?.categoria || '',
    valorNumerico,
    preco: valorNumerico,
    valor: formatarMoeda(valorNumerico),
    img,
    imagem: img,
    tipo: raw?.tipo || 'principal',
    aceita_adicionais: raw?.aceita_adicionais !== false,
    duracao: raw?.duracao || '',
    destaque: Boolean(raw?.destaque),
  }
}

export function validarItemCarrinho(item) {
  const rawId = item?.produto?.id ?? item?.id
  const servicoId = Number(rawId)
  return Number.isInteger(servicoId) && servicoId > 0
}

export function montarPayloadItens(itens = []) {
  return (itens || []).map((item) => {
    const rawId = item?.produto?.id ?? item?.id
    const servicoId = Number(rawId)
    if (!Number.isInteger(servicoId) || servicoId <= 0) {
      throw new Error(
        `Procedimento "${item?.produto?.nome || 'desconhecido'}" sem identificador válido.`
      )
    }

    const opcionais = Object.entries(item.opcionais || {})
      .map(([opcId, qtd]) => ({
        servico_id: Number(opcId),
        quantidade: Number(qtd) || 0,
      }))
      .filter(
        (o) =>
          Number.isInteger(o.servico_id) &&
          o.servico_id > 0 &&
          o.quantidade > 0
      )

    return {
      servico_id: servicoId,
      quantidade: Math.max(1, Number(item.quantidade) || 1),
      opcionais,
    }
  })
}

export function formatarCodigoAgendamento(solicitacao) {
  const id = Number(solicitacao?.id)
  if (Number.isInteger(id) && id > 0) {
    return `#AG-${String(id).padStart(4, '0')}`
  }
  return '#AG-NOVO'
}

export function formatarMensagemWhatsApp({
  codigoFormatado,
  nome,
  whatsapp,
  itens,
  opcionaisData,
  brandName,
}) {
  let msg = `💅 *SOLICITAÇÃO DE AGENDAMENTO - ${String(brandName || 'STUDIO').toUpperCase()}* (${codigoFormatado})\n\n`
  msg += `👤 *Cliente:* ${String(nome || '').trim()}\n`
  msg += `📱 *WhatsApp:* ${whatsapp}\n\n`
  msg += `📋 *PROCEDIMENTOS:*\n`

  ;(itens || []).forEach((it, idx) => {
    const subItem = calcularPrecoItem(it, opcionaisData)
    msg += `\n${idx + 1}. *${it.produto?.nome}* (x${it.quantidade || 1}) - R$ ${formatarMoeda(subItem)}`
    Object.entries(it.opcionais || {}).forEach(([idStr, qtd]) => {
      if (Number(qtd) > 0) {
        const o = (opcionaisData || []).find((x) => Number(x.id) === Number(idStr))
        if (o) {
          const tag = o.tipo === 'substitutivo' ? 'Substitutivo' : 'Extra'
          msg += `\n   └ ${qtd}x ${o.nome} (${tag})`
        }
      }
    })
  })

  const totalGeral = calcularTotalCarrinho(itens, opcionaisData)
  msg += `\n\n💰 *VALOR TOTAL: R$ ${formatarMoeda(totalGeral)}*`
  msg += `\n\n_Olá! Acabei de enviar minha solicitação pelo catálogo. Gostaria de confirmar dia e horário!_`
  return msg
}
