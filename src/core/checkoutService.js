import { supabase } from './supabase'
import { TENANT_ID, WHATSAPP_NUMBER, STORAGE_PREFIX } from './env'
import {
  PADRAO_CONFIG_AGENDA,
  calcularTotalCarrinho,
  formatarCodigoAgendamento,
  formatarDataBr,
  formatarMensagemWhatsApp,
  horarioJaPassouHoje,
  montarPayloadItens,
  normalizarConfigAgenda,
  obterConfigDoDia,
  obterDataHojeISO,
  obterHorariosDoDia,
  validarItemCarrinho,
  validarWhatsapp,
} from './regrasCalculo'

export async function buscarConfigAgenda(tenantId = TENANT_ID) {
  try {
    const { data, error } = await supabase.rpc('listar_config_agenda_publico', {
      p_tenant_id: tenantId,
    })
    if (error) throw error
    if (!data || data.habilitado === false || !Array.isArray(data.semana)) {
      return { ok: false, config: PADRAO_CONFIG_AGENDA }
    }
    return { ok: true, config: normalizarConfigAgenda(data) }
  } catch (e) {
    console.warn('Não foi possível consultar grade de horários:', e)
    return { ok: false, config: PADRAO_CONFIG_AGENDA }
  }
}

export async function buscarDatasOcupadas(tenantId = TENANT_ID) {
  try {
    const { data, error } = await supabase.rpc('listar_datas_ocupadas_publico', {
      p_tenant_id: tenantId,
    })
    if (error) throw error

    const datas = (Array.isArray(data) ? data : [])
      .filter((r) => r && r.data_agendamento)
      .map((r) => {
        const horariosRaw = Array.isArray(r.horarios_ocupados)
          ? r.horarios_ocupados
          : Array.isArray(r.horarios)
            ? r.horarios
            : []
        const horariosOcupados = horariosRaw
          .map((h) => (typeof h === 'string' ? h : h?.horario || h?.horario_agendamento || ''))
          .filter(Boolean)
        const horariosAprovados = Array.isArray(r.horarios_aprovados)
          ? r.horarios_aprovados.filter(Boolean)
          : horariosRaw
              .filter((h) => typeof h === 'object' && (h?.aprovado || h?.status === 'aprovado'))
              .map((h) => h.horario || h.horario_agendamento)
              .filter(Boolean)

        return {
          data: String(r.data_agendamento).slice(0, 10),
          total: Number(r.total_agendamentos) || 1,
          possuiAprovado: Boolean(r.possui_aprovado),
          horariosOcupados,
          horariosAprovados,
        }
      })

    const mapa = {}
    datas.forEach((d) => {
      mapa[d.data] = d
    })

    return { ok: true, datas, mapa }
  } catch (e) {
    console.warn('Não foi possível consultar datas ocupadas:', e)
    return { ok: false, datas: [], mapa: {} }
  }
}

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
  dataAgendamento = null,
  horarioAgendamento = null,
  configAgenda = PADRAO_CONFIG_AGENDA,
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

  const dataLimpa = String(dataAgendamento || '').trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataLimpa)) {
    throw new Error('Por favor, selecione a data desejada para o agendamento.')
  }

  if (dataLimpa < obterDataHojeISO()) {
    throw new Error('Selecione uma data a partir de hoje.')
  }

  const cfgDia = obterConfigDoDia(dataLimpa, configAgenda)
  const horariosPermitidos = obterHorariosDoDia(dataLimpa, configAgenda)
  if (!cfgDia.ativo || horariosPermitidos.length === 0) {
    throw new Error(
      cfgDia.motivo
        ? `Não realizamos atendimentos em ${formatarDataBr(dataLimpa)} (${cfgDia.motivo}). Escolha outra data.`
        : 'Não realizamos atendimentos na data selecionada. Escolha outro dia.'
    )
  }

  const horarioLimpo = String(horarioAgendamento || '').trim()
  const slotObj = horariosPermitidos.find((h) => h.id === horarioLimpo)
  if (!slotObj) {
    throw new Error('Por favor, selecione um dos horários disponíveis para a data escolhida.')
  }

  if (horarioJaPassouHoje(dataLimpa, slotObj.inicioMin)) {
    throw new Error('Este horário de hoje já se encerrou. Escolha outro horário ou outra data.')
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
      p_data_agendamento: dataLimpa,
      p_horario_agendamento: horarioLimpo,
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
    dataAgendamento: dataLimpa,
    horarioAgendamento: horarioLimpo,
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
    dataAgendamento: dataLimpa,
    horarioAgendamento: horarioLimpo,
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
