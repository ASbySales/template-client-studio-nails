import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  History,
  MessageCircle,
  RotateCcw,
  ShoppingBag,
  Trash2,
} from 'lucide-react'
import { LOJA_TEMA } from '../config/tema'
import { STORAGE_PREFIX, STUDIO_LOGO, TENANT_ID, WHATSAPP_NUMBER } from './env'
import { BottomSheet, EstadoVazio } from './FeedbackUI'
import { useOverlayBack, useScrollLock } from './hooksUi'
import { useUI } from './uiContext'
import {
  LIMITE_SUBSTITUTIVOS,
  aceitaAdicionais,
  calcularPrecoItem,
  calcularTotalCarrinho,
  contarSubstitutivos,
  formatarDataBr,
  formatarMoeda,
  horarioJaPassouHoje,
  mascaraWhatsapp,
  obterDataHojeISO,
  obterDiaSemanaISO,
  obterHorariosDoDia,
} from './regrasCalculo'
import {
  buscarDatasOcupadas,
  enviarSolicitacaoAgendamento,
  obterDadosClienteSalvos,
  obterHistoricoSalvo,
  prepararItensRepetirPedido,
} from './checkoutService'

const MESES_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function fallbackImagem(e) {
  if (e.currentTarget.dataset.fbDone) return
  e.currentTarget.dataset.fbDone = '1'
  e.currentTarget.src = STUDIO_LOGO
}

export default function CarrinhoSheet({
  carr,
  itens = [],
  setItens,
  opcionaisData = [],
  removerItem: removerProp,
  limparCarrinho: limparProp,
  alterarQtdPrincipal: alterarQtdProp,
  alterarOpcionalItem: alterarOpcProp,
}) {
  const ui = useUI()
  const [passo, setPasso] = useState('lista')
  const [historico, setHistorico] = useState(() => obterHistoricoSalvo(STORAGE_PREFIX))
  const [nome, setNome] = useState(() => obterDadosClienteSalvos(STORAGE_PREFIX).nome)
  const [whatsapp, setWhatsapp] = useState(() => obterDadosClienteSalvos(STORAGE_PREFIX).whatsapp)
  const [dataAgendamento, setDataAgendamento] = useState('')
  const [horarioAgendamento, setHorarioAgendamento] = useState('')
  const [mesCalendario, setMesCalendario] = useState(() => {
    const hoje = obterDataHojeISO()
    const [ano, mes] = hoje.split('-').map(Number)
    return new Date(ano, (mes || 1) - 1, 1)
  })
  const [mapaOcupadas, setMapaOcupadas] = useState({})
  const [listaOcupadas, setListaOcupadas] = useState([])
  const [carregandoDatas, setCarregandoDatas] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState('')

  const hojeISO = obterDataHojeISO()

  useEffect(() => {
    if (passo !== 'checkout') return
    let ativo = true
    setCarregandoDatas(true)
    buscarDatasOcupadas(TENANT_ID)
      .then((res) => {
        if (!ativo) return
        setMapaOcupadas(res.mapa || {})
        setListaOcupadas(res.datas || [])
      })
      .finally(() => {
        if (ativo) setCarregandoDatas(false)
      })
    return () => {
      ativo = false
    }
  }, [passo])

  const diasDoMes = useMemo(() => {
    const ano = mesCalendario.getFullYear()
    const mes = mesCalendario.getMonth()
    const primeiroDiaSemana = new Date(ano, mes, 1).getDay()
    const totalDias = new Date(ano, mes + 1, 0).getDate()
    const celulas = []
    for (let i = 0; i < primeiroDiaSemana; i += 1) {
      celulas.push(null)
    }
    for (let dia = 1; dia <= totalDias; dia += 1) {
      const mm = String(mes + 1).padStart(2, '0')
      const dd = String(dia).padStart(2, '0')
      celulas.push({ dia, iso: `${ano}-${mm}-${dd}` })
    }
    return celulas
  }, [mesCalendario])

  const mesAtualPrefix = `${mesCalendario.getFullYear()}-${String(mesCalendario.getMonth() + 1).padStart(2, '0')}`
  const podeVoltarMes = mesAtualPrefix > hojeISO.slice(0, 7)
  const datasOcupadasNoMes = listaOcupadas.filter((d) => d.data.startsWith(mesAtualPrefix))
  const infoDiaSelecionado = dataAgendamento ? mapaOcupadas[dataAgendamento] : null
  const horariosDiaSelecionado = useMemo(
    () => (dataAgendamento ? obterHorariosDoDia(dataAgendamento) : []),
    [dataAgendamento]
  )
  const isSabadoSelecionado = dataAgendamento ? obterDiaSemanaISO(dataAgendamento) === 6 : false

  useScrollLock(true)
  useOverlayBack(true, () => {
    if (!enviando) carr?.()
  })
  useOverlayBack(passo !== 'lista', () => setPasso('lista'))

  const t = LOJA_TEMA.classes
  const totalGeral = calcularTotalCarrinho(itens, opcionaisData)

  const remover = (idEscolha) => {
    if (removerProp) return removerProp(idEscolha)
    setItens((prev) => prev.filter((it) => it.idEscolha !== idEscolha))
  }

  const alterarQtd = (idEscolha, dir) => {
    if (alterarQtdProp) return alterarQtdProp(idEscolha, dir)
    const delta = dir === 'mais' ? 1 : -1
    setItens((prev) =>
      prev.map((it) =>
        it.idEscolha === idEscolha
          ? { ...it, quantidade: Math.max(1, (Number(it.quantidade) || 1) + delta) }
          : it
      )
    )
  }

  const alterarOpc = (idEscolha, opc, delta) => {
    if (alterarOpcProp) return alterarOpcProp(idEscolha, opc, delta)
    setItens((prev) =>
      prev.map((it) => {
        if (it.idEscolha !== idEscolha || it.produto?.aceita_adicionais === false) return it
        const atual = it.opcionais?.[opc.id] || 0
        if (delta > 0 && opc.tipo === 'substitutivo') {
          if (contarSubstitutivos(it.opcionais, opcionaisData) >= LIMITE_SUBSTITUTIVOS) return it
        }
        const novo = Math.max(0, atual + delta)
        const copy = { ...(it.opcionais || {}) }
        if (novo > 0) copy[opc.id] = novo
        else delete copy[opc.id]
        return { ...it, opcionais: copy }
      })
    )
  }

  const solicitarLimpeza = async () => {
    const ok = ui?.confirmar
      ? await ui.confirmar({
          titulo: 'Limpar agendamento?',
          texto: 'Todos os procedimentos selecionados serão removidos da sacola.',
          ok: 'Limpar tudo',
          cancelar: 'Voltar',
          perigo: true,
        })
      : true

    if (!ok) return
    if (limparProp) limparProp()
    else setItens([])
  }

  const reaproveitarPedido = (registro) => {
    setErroEnvio('')
    const res = prepararItensRepetirPedido(registro)
    if (!res.ok) {
      setErroEnvio(res.erro)
      ui?.avisar?.(res.erro)
      return
    }
    setItens(res.itens)
    setPasso('lista')
    ui?.avisar?.(`Agendamento ${registro.codigo || ''} carregado!`.trim())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErroEnvio('')

    try {
      setEnviando(true)
      const res = await enviarSolicitacaoAgendamento({
        tenantId: TENANT_ID,
        whatsappDestino: WHATSAPP_NUMBER,
        brandName: LOJA_TEMA.brandName,
        storagePrefix: STORAGE_PREFIX,
        nome,
        whatsapp,
        dataAgendamento,
        horarioAgendamento,
        honeypot,
        itens,
        opcionaisData,
        historicoAtual: historico,
      })

      if (res.ignoredBot) return

      setHistorico(res.historicoAtualizado)
      setItens([])
      carr?.()
      ui?.avisar?.(`Solicitação ${res.codigoFormatado} enviada!`)

      const janela = window.open(res.whatsappUrl, '_blank', 'noopener,noreferrer')
      if (!janela) {
        window.location.href = res.whatsappUrl
      }
    } catch (error) {
      console.error('Erro ao registrar solicitação:', error)
      setErroEnvio(error.message || 'Não foi possível enviar a solicitação. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  const titulo =
    passo === 'checkout'
      ? 'Identificação'
      : passo === 'historico'
        ? 'Seu Histórico'
        : 'Seu Agendamento'

  const direitaHeader = (
    <>
      {passo !== 'checkout' && historico.length > 0 && (
        <button
          type="button"
          onClick={() => setPasso((p) => (p === 'historico' ? 'lista' : 'historico'))}
          className={`h-8 px-2.5 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-transform active:scale-95 ${t.pillBadge}`}
        >
          <History className="w-3.5 h-3.5" />
          {passo === 'historico' ? 'Sacola' : 'Histórico'}
        </button>
      )}
      {passo === 'lista' && itens.length > 0 && (
        <button
          type="button"
          onClick={solicitarLimpeza}
          title="Limpar agendamento"
          aria-label="Limpar agendamento"
          className="h-8 w-8 rounded-full flex items-center justify-center text-red-400 hover:text-red-500 cursor-pointer transition-transform active:scale-90"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </>
  )

  const rodape =
    passo === 'lista' && itens.length > 0 ? (
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold ${t.textMuted}`}>Total estimado:</span>
          <span className={`text-lg font-bold ${t.accentText}`}>
            R$ {formatarMoeda(totalGeral)}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setErroEnvio('')
            setPasso('checkout')
          }}
          className={`w-full h-11 font-bold text-sm rounded-xl hover:scale-[1.01] active:scale-95 transition-all cursor-pointer border-none ${t.primaryBtn}`}
        >
          Avançar
        </button>
      </div>
    ) : null

  return (
    <BottomSheet
      titulo={titulo}
      aoFechar={carr}
      carregando={enviando}
      textoCarregando="Registrando solicitação..."
      maxWidth="max-w-[420px]"
      esquerdaHeader={
        passo !== 'lista' ? (
          <button
            type="button"
            disabled={enviando}
            onClick={() => setPasso('lista')}
            aria-label="Voltar"
            className={`h-8 w-8 rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-90 ${t.closeBtn}`}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : null
      }
      direitaHeader={direitaHeader}
      rodape={rodape}
    >
      {passo === 'historico' && (
        <div className="flex flex-col gap-3 text-left">
          <p className={`text-xs ${t.textMuted}`}>
            Reaproveite agendamentos enviados anteriormente:
          </p>
          {historico.map((hist) => (
            <div key={hist.id} className={`rounded-2xl p-3 flex flex-col gap-2 ${t.cardItemBg}`}>
              <div className={`flex items-center justify-between pb-1.5 border-b ${t.sheetBorder}`}>
                <span className={`text-xs font-bold font-mono ${t.accentText}`}>
                  {hist.codigo}
                </span>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {hist.dataAgendamento && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.pillBadge}`}>
                      {formatarDataBr(hist.dataAgendamento)}
                      {hist.horarioAgendamento ? ` · ${hist.horarioAgendamento}` : ''}
                    </span>
                  )}
                  <span className={`text-[10px] ${t.textMuted}`}>
                    {hist.data ? new Date(hist.data).toLocaleDateString('pt-BR') : ''}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                {(hist.itensCompletos || []).map((item, idx) => (
                  <div key={idx} className={`flex items-center justify-between text-xs ${t.textSecondary}`}>
                    <span className="truncate pr-2">
                      • {item.produto?.nome} {item.quantidade > 1 ? `(${item.quantidade}x)` : ''}
                    </span>
                    <span className={`font-bold shrink-0 ${t.accentText}`}>
                      R$ {item.produto?.valor || formatarMoeda(item.produto?.preco)}
                    </span>
                  </div>
                ))}
              </div>

              <div className={`flex items-center justify-between pt-2 border-t ${t.sheetBorder}`}>
                <span className={`text-xs font-bold ${t.textPrimary}`}>
                  Total: R$ {formatarMoeda(hist.valor)}
                </span>
                <button
                  type="button"
                  onClick={() => reaproveitarPedido(hist)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform border-none ${t.primaryBtn}`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Repetir Pedido
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {passo === 'lista' &&
        (itens.length === 0 ? (
          <div className="flex flex-col items-center">
            <EstadoVazio
              Icone={ShoppingBag}
              titulo="Nenhum serviço selecionado"
              texto="Escolha seus procedimentos de nail design no catálogo."
              acaoRotulo={historico.length > 0 ? `Repetir ${historico[0].codigo}` : undefined}
              aoClicar={historico.length > 0 ? () => reaproveitarPedido(historico[0]) : undefined}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {itens.map((it) => {
              const precoItem = calcularPrecoItem(it, opcionaisData)
              const totalSubst = contarSubstitutivos(it.opcionais, opcionaisData)
              const aceitaAdic = aceitaAdicionais(it.produto, opcionaisData)

              return (
                <div key={it.idEscolha} className={`rounded-2xl p-3 flex flex-col gap-2 ${t.cardItemBg}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={it.produto?.img || STUDIO_LOGO}
                        alt={it.produto?.nome}
                        loading="lazy"
                        onError={fallbackImagem}
                        className={`w-12 h-12 rounded-xl object-cover shrink-0 ${t.mediaBg}`}
                      />
                      <div className="flex flex-col text-left min-w-0">
                        <span className={`font-bold text-xs truncate ${t.textPrimary}`}>
                          {it.produto?.nome}
                        </span>
                        <span className={`text-xs font-bold mt-0.5 ${t.accentText}`}>
                          R$ {formatarMoeda(precoItem)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className={`flex items-center rounded-lg px-1 ${t.mediaBg}`}>
                        <button
                          type="button"
                          onClick={() => alterarQtd(it.idEscolha, 'menos')}
                          className={`h-6 w-5 flex items-center justify-center text-xs font-bold cursor-pointer ${t.textMuted}`}
                        >
                          -
                        </button>
                        <span className={`text-xs font-bold px-1 ${t.textPrimary}`}>
                          {it.quantidade || 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => alterarQtd(it.idEscolha, 'mais')}
                          className={`h-6 w-5 flex items-center justify-center text-xs font-bold cursor-pointer ${t.textMuted}`}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => remover(it.idEscolha)}
                        aria-label="Remover item"
                        className="text-red-400 hover:text-red-500 p-1 cursor-pointer transition-transform active:scale-90"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {aceitaAdic && (
                    <div className={`border-t pt-2 flex flex-col gap-1.5 ${t.sheetBorder}`}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider text-left ${t.textMuted}`}>
                        Unitários ({totalSubst}/{LIMITE_SUBSTITUTIVOS} substitutivos):
                      </span>
                      {opcionaisData.map((opc) => {
                        const qtdOpc = it.opcionais?.[opc.id] || 0
                        const isSubst = opc.tipo === 'substitutivo'
                        const bloqMais = isSubst && totalSubst >= LIMITE_SUBSTITUTIVOS
                        return (
                          <div
                            key={opc.id}
                            className={`flex items-center justify-between text-[11px] rounded-xl px-2.5 py-1.5 ${t.mediaBg}`}
                          >
                            <div className="flex flex-col text-left min-w-0 pr-2">
                              <span className={`font-semibold truncate ${t.textSecondary}`}>
                                {opc.nome}
                              </span>
                              <span className={`text-[10px] ${t.textMuted}`}>
                                R$ {opc.valor} · {isSubst ? 'Substitutivo (1/10)' : 'Extra'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => alterarOpc(it.idEscolha, opc, -1)}
                                className={`h-5 w-5 rounded-full text-xs font-bold flex items-center justify-center cursor-pointer ${t.stepBtn}`}
                              >
                                -
                              </button>
                              <span className={`w-4 text-center font-bold ${t.textPrimary}`}>
                                {qtdOpc}
                              </span>
                              <button
                                type="button"
                                disabled={bloqMais}
                                onClick={() => alterarOpc(it.idEscolha, opc, 1)}
                                className={`h-5 w-5 rounded-full text-xs font-bold flex items-center justify-center ${t.stepBtn} ${
                                  bloqMais ? t.stepBtnDisabled : 'cursor-pointer'
                                }`}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}

      {passo === 'checkout' && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 py-1 text-left">
          <input
            type="text"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <p className={`text-xs leading-relaxed ${t.textMuted}`}>
            Escolha a data e o horário desejados (até 2h30 por período) e confirme no WhatsApp:
          </p>

          <div className={`rounded-2xl p-3 flex flex-col gap-2.5 ${t.cardItemBg}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Calendar className={`w-4 h-4 ${t.accentText}`} />
                <span className={`text-xs font-bold ${t.textPrimary}`}>
                  Data do Agendamento
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={!podeVoltarMes}
                  onClick={() =>
                    setMesCalendario((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
                  }
                  aria-label="Mês anterior"
                  className={`h-7 w-7 rounded-lg flex items-center justify-center ${t.stepBtn} ${
                    podeVoltarMes ? 'cursor-pointer' : t.stepBtnDisabled
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className={`text-[11px] font-bold min-w-[96px] text-center ${t.textPrimary}`}>
                  {MESES_PT[mesCalendario.getMonth()]} {mesCalendario.getFullYear()}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setMesCalendario((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
                  }
                  aria-label="Próximo mês"
                  className={`h-7 w-7 rounded-lg flex items-center justify-center cursor-pointer ${t.stepBtn}`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 text-[10px]">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className={`inline-flex items-center gap-1 ${t.textMuted}`}>
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  Com reservas
                </span>
                <span className={`inline-flex items-center gap-1 ${t.textMuted}`}>
                  <span className={`w-2 h-2 rounded-full border inline-block ${t.sheetBorder}`} />
                  Livre
                </span>
                <span className={`inline-flex items-center gap-1 ${t.textMuted}`}>
                  Dom fechado
                </span>
              </div>
              {carregandoDatas && (
                <span className={`text-[10px] italic ${t.textMuted}`}>Consultando...</span>
              )}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {DIAS_SEMANA.map((dia) => (
                <span key={dia} className={`text-[10px] font-bold py-0.5 ${t.textMuted}`}>
                  {dia}
                </span>
              ))}

              {diasDoMes.map((cel, i) => {
                if (!cel) return <div key={`v-${i}`} />
                const diaSem = obterDiaSemanaISO(cel.iso)
                const isDomingo = diaSem === 0
                const isSabado = diaSem === 6
                const passado = cel.iso < hojeISO
                const desabilitado = passado || isDomingo
                const maxVagasDia = isSabado ? 2 : 4
                const infoOcup = mapaOcupadas[cel.iso]
                const totalDia = infoOcup?.total || 0
                const ocupado = totalDia > 0
                const lotado = totalDia >= maxVagasDia
                const selecionado = dataAgendamento === cel.iso

                return (
                  <button
                    key={cel.iso}
                    type="button"
                    disabled={desabilitado}
                    onClick={() => {
                      setDataAgendamento(cel.iso)
                      const permitidos = obterHorariosDoDia(cel.iso)
                      setHorarioAgendamento((atual) =>
                        permitidos.some(
                          (h) => h.id === atual && !horarioJaPassouHoje(cel.iso, h.inicioMin)
                        )
                          ? atual
                          : ''
                      )
                      setErroEnvio('')
                    }}
                    title={
                      isDomingo
                        ? 'Domingo: sem atendimento'
                        : passado
                          ? 'Data passada'
                          : ocupado
                            ? `${formatarDataBr(cel.iso)}: ${totalDia}/${maxVagasDia} horário(s) já solicitados`
                            : `${formatarDataBr(cel.iso)}: ${maxVagasDia} horários livres`
                    }
                    style={
                      selecionado
                        ? {
                            backgroundColor: LOJA_TEMA.corPrimaria,
                            color: LOJA_TEMA.isDark ? '#111111' : '#FFFFFF',
                            borderColor: LOJA_TEMA.corPrimaria,
                          }
                        : undefined
                    }
                    className={`relative h-9 rounded-xl text-xs font-bold flex flex-col items-center justify-center border transition-all ${
                      desabilitado
                        ? `opacity-25 cursor-not-allowed border-transparent ${t.textMuted}`
                        : selecionado
                          ? 'shadow-sm scale-[1.03] cursor-pointer'
                          : lotado
                            ? `border-rose-500/60 bg-rose-500/12 hover:bg-rose-500/20 cursor-pointer ${t.textPrimary}`
                            : ocupado
                              ? `border-amber-500/60 bg-amber-500/12 hover:bg-amber-500/20 cursor-pointer ${t.textPrimary}`
                              : `${t.mediaBg} cursor-pointer hover:opacity-85 ${t.textPrimary}`
                    }`}
                  >
                    <span className="leading-none">{cel.dia}</span>
                    {!desabilitado && ocupado && (
                      <span
                        className={`text-[8px] font-bold leading-none mt-0.5 ${
                          selecionado
                            ? 'opacity-90'
                            : lotado
                              ? 'text-rose-500'
                              : 'text-amber-500'
                        }`}
                      >
                        {totalDia}/{maxVagasDia}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {dataAgendamento ? (
              <div className={`border-t pt-2.5 flex flex-col gap-2 ${t.sheetBorder}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className={`w-3.5 h-3.5 ${t.accentText}`} />
                    <span className={`text-xs font-bold ${t.textPrimary}`}>
                      Horário ({formatarDataBr(dataAgendamento)})
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.pillBadge}`}>
                    {isSabadoSelecionado ? 'Sábado · 2 manhã' : 'Seg a Sex · até 2h30'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {horariosDiaSelecionado.map((slot) => {
                    const passouHoje = horarioJaPassouHoje(dataAgendamento, slot.inicioMin)
                    const slotAprovado = infoDiaSelecionado?.horariosAprovados?.includes(slot.id)
                    const slotOcupado =
                      slotAprovado || infoDiaSelecionado?.horariosOcupados?.includes(slot.id)
                    const slotSelecionado = horarioAgendamento === slot.id

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={passouHoje}
                        onClick={() => {
                          setHorarioAgendamento(slot.id)
                          setErroEnvio('')
                        }}
                        style={
                          slotSelecionado
                            ? {
                                backgroundColor: LOJA_TEMA.corPrimaria,
                                color: LOJA_TEMA.isDark ? '#111111' : '#FFFFFF',
                                borderColor: LOJA_TEMA.corPrimaria,
                              }
                            : undefined
                        }
                        className={`rounded-xl px-2.5 py-2 border text-left transition-all flex flex-col gap-0.5 ${
                          passouHoje
                            ? `opacity-35 cursor-not-allowed ${t.mediaBg} ${t.textMuted}`
                            : slotSelecionado
                              ? 'shadow-sm scale-[1.02] cursor-pointer'
                              : slotOcupado
                                ? `border-amber-500/60 bg-amber-500/12 hover:bg-amber-500/20 cursor-pointer ${t.textPrimary}`
                                : `${t.mediaBg} cursor-pointer hover:opacity-85 ${t.textPrimary}`
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] font-bold leading-tight">{slot.id}</span>
                        </div>
                        <span
                          className={`text-[9px] font-semibold leading-tight ${
                            slotSelecionado
                              ? 'opacity-90'
                              : passouHoje
                                ? t.textMuted
                                : slotOcupado
                                  ? 'text-amber-500'
                                  : t.textMuted
                          }`}
                        >
                          {passouHoje
                            ? 'Horário encerrado'
                            : slotAprovado
                              ? 'Já aprovado'
                              : slotOcupado
                                ? 'Já solicitado'
                                : `${slot.turno} · Livre`}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {infoDiaSelecionado ? (
                  <div
                    className={`rounded-xl p-2.5 border text-[11px] leading-snug flex items-start gap-2 ${
                      LOJA_TEMA.isDark
                        ? 'bg-amber-950/50 border-amber-500/40 text-amber-200'
                        : 'bg-amber-50 border-amber-300/80 text-amber-950'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                    <span>
                      <strong>{formatarDataBr(dataAgendamento)}</strong> já possui{' '}
                      <strong>
                        {infoDiaSelecionado.total} de {isSabadoSelecionado ? 2 : 4} períodos
                      </strong>{' '}
                      com solicitação{infoDiaSelecionado.possuiAprovado ? ' (incluindo horário aprovado)' : ''}.
                      {horarioAgendamento &&
                      infoDiaSelecionado.horariosOcupados?.includes(horarioAgendamento)
                        ? ` O período ${horarioAgendamento} já tem solicitação — confirmaremos no WhatsApp.`
                        : ' Alinharemos a disponibilidade exata pelo WhatsApp.'}
                    </span>
                  </div>
                ) : (
                  <div
                    className={`rounded-xl p-2.5 border text-[11px] leading-snug flex items-start gap-2 ${
                      LOJA_TEMA.isDark
                        ? 'bg-emerald-950/40 border-emerald-500/35 text-emerald-200'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                    <span>
                      <strong>{formatarDataBr(dataAgendamento)}</strong> está livre em todos os{' '}
                      {isSabadoSelecionado ? '2 horários da manhã' : '4 horários do dia'}
                      {horarioAgendamento ? ` (${horarioAgendamento} selecionado).` : ' — escolha seu horário acima.'}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              datasOcupadasNoMes.length > 0 && (
                <p className={`text-[10px] leading-snug ${t.textMuted}`}>
                  Dias com reserva neste mês:{' '}
                  <strong className={t.textSecondary}>
                    {datasOcupadasNoMes
                      .slice(0, 6)
                      .map((d) => `${d.data.slice(8, 10)}/${d.data.slice(5, 7)} (${d.total})`)
                      .join(', ')}
                    {datasOcupadasNoMes.length > 6 ? '...' : ''}
                  </strong>
                </p>
              )
            )}
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1 ${t.textSecondary}`}>
              Seu Nome:
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Maria Silva"
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none ${t.inputField}`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1 ${t.textSecondary}`}>
              Seu WhatsApp:
            </label>
            <input
              type="tel"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(mascaraWhatsapp(e.target.value))}
              placeholder="(83) 9 9999-9999"
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none ${t.inputField}`}
            />
          </div>

          {erroEnvio && (
            <p className={`text-xs font-bold p-2.5 rounded-xl border ${t.errorBox}`}>
              ⚠️ {erroEnvio}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className={`w-full h-12 mt-2 font-bold text-sm rounded-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border-none ${t.primaryBtn}`}
          >
            <MessageCircle className="w-[18px] h-[18px]" />
            {enviando ? 'Registrando...' : 'Ir ao WhatsApp'}
          </button>
        </form>
      )}
    </BottomSheet>
  )
}
