import { supabase } from './supabase'
import { TENANT_ID, WHATSAPP_NUMBER, STORAGE_PREFIX } from './env'
import {
  calcularTotalCarrinho,
  formatarCodigoAgendamento,
  formatarMensagemWhatsApp,
  montarPayloadItens,
  validarItemCarrinho,
  validarWhatsapp,
} from './regrasCalculo'

const KEYS = (prefix = STORAGE_PREFIX) => ({
  carrinho: `${prefix}_carrinho_itens`,
  nome: `${prefix}_cliente_nome`,
  whatsapp: `${prefix}_cliente_whatsapp`,
  historico: `${prefix}_historico_agendamentos`,
  ultimoEnvio: `${prefix}_ultimo_envio`,
})

export function carregarCarrinhoLocal(prefix = STORAGE_PREFIX) {
  try {
    const salvo = localStorage.getItem(KEYS(prefix).carrinho)
    const parsed = salvo ? JSON.parse(salvo) : []
    return Array.isArray(parsed) ? parsed.filter(validarItemCarrinho) : []
  } catch {
    return []
  }
}

export function salvarCarrinhoLocal(itens, prefix = STORAGE_PREFIX) {
  try {
    localStorage.setItem(KEYS(prefix).carrinho, JSON.stringify(itens || []))
  } catch (e) {
    console.error('Erro ao sincronizar carrinho no cache:', e)
  }
}

export function obterDadosClienteSalvos(prefix = STORAGE_PREFIX) {
  try {
    const k = KEYS(prefix)
    return {
      nome: localStorage.getItem(k.nome) || '',
      whatsapp: localStorage.getItem(k.whatsapp) || '',
    }
  } catch {
    return { nome: '', whatsapp: '' }
  }
}

export function obterHistoricoSalvo(prefix = STORAGE_PREFIX) {
  try {
    const salvo = JSON.parse(localStorage.getItem(KEYS(prefix).historico) || '[]')
    return Array.isArray(salvo) ? salvo : []
  } catch {
    return []
  }
}

export function prepararItensRepetirPedido(agendamentoAnterior) {
  const listaItens = agendamentoAnterior?.itensCompletos || agendamentoAnterior?.itens
  if (!Array.isArray(listaItens) || listaItens.length === 0) {
    return { ok: false, erro: 'Este agendamento não possui itens disponíveis.' }
  }

  const itensValidos = listaItens.filter(validarItemCarrinho)
  if (itensValidos.length === 0) {
    return {
      ok: false,
      erro: 'O formato deste agendamento antigo não pôde ser recuperado. Adicione os itens pelo catálogo.',
    }
  }

  const base = Date.now()
  const itensClonados = itensValidos.map((it, idx) => ({
    ...it,
    idEscolha: base + idx + Math.random(),
  }))

  return { ok: true, itens: itensClonados }
}

export async function enviarSolicitacaoAgendamento({
  tenantId = TENANT_ID,
  whatsappDestino = WHATSAPP_NUMBER,
  brandName,
  storagePrefix = STORAGE_PREFIX,
  nome,
  whatsapp,
  honeypot = '',
  itens = [],
  opcionaisData = [],
  historicoAtual = [],
}) {
  if (honeypot) {
    return { ignoredBot: true }
  }

  if (!String(nome || '').trim()) {
    throw new Error('Por favor, informe seu nome completo.')
  }

  const { valido } = validarWhatsapp(whatsapp)
  if (!valido) {
    throw new Error('Informe um número de WhatsApp válido com DDD.')
  }

  if (!Array.isArray(itens) || itens.length === 0) {
    throw new Error('Sua lista de serviços está vazia.')
  }

  const payloadItens = montarPayloadItens(itens)

  const { data: solicitacao, error: erroRPC } = await supabase.rpc(
    'criar_solicitacao_agendamento',
    {
      p_tenant_id: tenantId,
      p_nome_cliente: nome.trim(),
      p_whatsapp_cliente: whatsapp,
      p_data_agendamento: null,
      p_horario_agendamento: null,
      p_observacoes: null,
      p_itens: payloadItens,
    }
  )

  if (erroRPC) throw erroRPC

  const codigoFormatado = formatarCodigoAgendamento(solicitacao)
  const k = KEYS(storagePrefix)

  try {
    localStorage.setItem(k.nome, nome.trim())
    localStorage.setItem(k.whatsapp, whatsapp)
    localStorage.setItem(k.ultimoEnvio, Date.now().toString())
  } catch (e) {
    console.warn('Falha ao salvar preferências locais:', e)
  }

  const novoItemHist = {
    id: solicitacao?.id ?? Date.now(),
    codigo: codigoFormatado,
    data: new Date().toISOString(),
    valor: calcularTotalCarrinho(itens, opcionaisData),
    itensCompletos: itens,
  }

  const historicoAtualizado = [
    novoItemHist,
    ...(historicoAtual || []).filter((h) => h.id !== novoItemHist.id),
  ].slice(0, 5)

  try {
    localStorage.setItem(k.historico, JSON.stringify(historicoAtualizado))
    localStorage.removeItem(k.carrinho)
  } catch (e) {
    console.warn('Falha ao atualizar histórico local:', e)
  }

  const mensagem = formatarMensagemWhatsApp({
    codigoFormatado,
    nome,
    whatsapp,
    itens,
    opcionaisData,
    brandName,
  })

  const numeroLimpo = String(whatsappDestino || '').replace(/\D/g, '')
  const whatsappUrl = `https://wa.me/${numeroLimpo}?text=${encodeURIComponent(mensagem)}`

  return {
    ignoredBot: false,
    solicitacao,
    codigoFormatado,
    historicoAtualizado,
    mensagem,
    whatsappUrl,
  }
}
