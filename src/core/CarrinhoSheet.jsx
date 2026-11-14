import { useState } from 'react'
import { ArrowLeft, History, MessageCircle, RotateCcw, ShoppingBag, Trash2 } from 'lucide-react'
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
  formatarMoeda,
  mascaraWhatsapp,
} from './regrasCalculo'
import {
  enviarSolicitacaoAgendamento,
  obterDadosClienteSalvos,
  obterHistoricoSalvo,
  prepararItensRepetirPedido,
} from './checkoutService'

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
  const [honeypot, setHoneypot] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState('')

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
                <span className={`text-[10px] ${t.textMuted}`}>
                  {hist.data ? new Date(hist.data).toLocaleDateString('pt-BR') : ''}
                </span>
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
            Informe seus dados para registrar sua solicitação e confirmar o horário pelo WhatsApp:
          </p>

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
