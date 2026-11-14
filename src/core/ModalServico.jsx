import { useState } from 'react'
import { ArrowLeft, Clock } from 'lucide-react'
import { LOJA_TEMA } from '../config/tema'
import { STUDIO_LOGO } from './env'
import { BottomSheet } from './FeedbackUI'
import { useOverlayBack, useScrollLock } from './hooksUi'
import {
  LIMITE_SUBSTITUTIVOS,
  aceitaAdicionais,
  calcularPrecoItem,
  contarSubstitutivos,
  formatarMoeda,
  isServicoUnitario,
  limparOpcionaisZerados,
} from './regrasCalculo'

function fallbackImagem(e) {
  if (e.currentTarget.dataset.fbDone) return
  e.currentTarget.dataset.fbDone = '1'
  e.currentTarget.src = STUDIO_LOGO
}

export default function ModalServico({ produto, opcionais = [], onClose, onConfirm }) {
  const [passo, setPasso] = useState('detalhes')
  const [quantidade, setQuantidade] = useState(1)
  const [quantOpc, setQuantOpc] = useState({})

  useScrollLock(Boolean(produto))
  useOverlayBack(Boolean(produto), onClose)
  useOverlayBack(Boolean(produto && passo === 'opcionais'), () => setPasso('detalhes'))

  if (!produto) return null

  const t = LOJA_TEMA.classes
  const fontHeading = LOJA_TEMA.fontHeading
  const isUnitario = isServicoUnitario(produto)
  const temAdicionais = aceitaAdicionais(produto, opcionais)
  const totalSubst = contarSubstitutivos(quantOpc, opcionais)
  const precoPreview = calcularPrecoItem(
    { produto, quantidade: 1, opcionais: quantOpc },
    opcionais
  )

  const alterarOpcional = (item, delta) => {
    setQuantOpc((prev) => {
      const atual = prev[item.id] || 0
      if (delta > 0 && item.tipo === 'substitutivo' && totalSubst >= LIMITE_SUBSTITUTIVOS) {
        return prev
      }
      const prox = Math.max(0, atual + delta)
      const copia = { ...prev }
      if (prox > 0) copia[item.id] = prox
      else delete copia[item.id]
      return copia
    })
  }

  const confirmarDetalhes = () => {
    onConfirm?.({ quantidadePrincipal: quantidade, opcionais: {} })
    onClose?.()
  }

  const confirmarOpcionais = () => {
    onConfirm?.({
      quantidadePrincipal: 1,
      opcionais: limparOpcionaisZerados(quantOpc),
    })
    onClose?.()
  }

  if (passo === 'opcionais') {
    return (
      <BottomSheet
        titulo="Adicionais & Unitários"
        subtitulo={`Personalize por unha (${totalSubst}/${LIMITE_SUBSTITUTIVOS} substitutivos)`}
        aoFechar={onClose}
        maxWidth="max-w-[390px]"
        esquerdaHeader={
          <button
            type="button"
            onClick={() => setPasso('detalhes')}
            aria-label="Voltar aos detalhes"
            className={`h-8 w-8 rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-90 ${t.closeBtn}`}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        }
        rodape={
          <button
            type="button"
            onClick={confirmarOpcionais}
            className={`w-full h-11 font-bold text-sm rounded-xl cursor-pointer transition-all hover:scale-[1.01] active:scale-95 border-none ${t.primaryBtn}`}
          >
            Confirmar · R$ {formatarMoeda(precoPreview)}
          </button>
        }
      >
        <div className="flex flex-col gap-2">
          {opcionais.map((item) => {
            const isSubst = item.tipo === 'substitutivo'
            const bloqMais = isSubst && totalSubst >= LIMITE_SUBSTITUTIVOS
            return (
              <div
                key={item.id}
                className={`rounded-2xl p-2.5 flex items-center justify-between gap-2 ${t.cardItemBg}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={item.img || STUDIO_LOGO}
                    alt={item.nome}
                    loading="lazy"
                    onError={fallbackImagem}
                    className={`w-11 h-11 rounded-xl object-cover shrink-0 ${t.mediaBg}`}
                  />
                  <div className="flex flex-col text-left min-w-0">
                    <span className={`text-xs font-bold truncate ${t.textPrimary}`}>
                      {item.nome}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className={`text-[11px] font-semibold ${t.accentText}`}>
                        R$ {item.valor}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase font-semibold ${t.pillBadge}`}>
                        {isSubst ? 'Substitutivo' : 'Extra'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => alterarOpcional(item, -1)}
                    className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer active:scale-90 transition-all ${t.stepBtn}`}
                  >
                    -
                  </button>
                  <span className={`font-bold text-xs w-4 text-center ${t.textPrimary}`}>
                    {quantOpc[item.id] || 0}
                  </span>
                  <button
                    type="button"
                    disabled={bloqMais}
                    onClick={() => alterarOpcional(item, 1)}
                    className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-sm transition-all ${t.stepBtn} ${
                      bloqMais ? t.stepBtnDisabled : 'cursor-pointer active:scale-90'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </BottomSheet>
    )
  }

  return (
    <BottomSheet
      titulo={produto.nome}
      subtitulo={produto.categoria || undefined}
      aoFechar={onClose}
      maxWidth="max-w-[380px]"
      rodape={
        <div className="flex items-center gap-2">
          {temAdicionais && (
            <button
              type="button"
              onClick={() => setPasso('opcionais')}
              className={`h-11 px-3.5 font-semibold text-xs rounded-xl active:scale-95 transition-all cursor-pointer shrink-0 ${t.secondaryBtn}`}
            >
              + Unitários
            </button>
          )}
          <button
            type="button"
            onClick={confirmarDetalhes}
            className={`h-11 flex-1 font-bold text-sm rounded-xl hover:scale-[1.01] active:scale-95 transition-all cursor-pointer border-none ${t.primaryBtn}`}
          >
            Adicionar
          </button>
        </div>
      }
    >
      <div className="flex flex-col items-center">
        <div className={`w-52 h-52 aspect-square rounded-3xl overflow-hidden flex items-center justify-center shadow-sm ${t.mediaBg}`}>
          <img
            src={produto.img || STUDIO_LOGO}
            alt={produto.nome}
            loading="lazy"
            onError={fallbackImagem}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-full max-w-[310px] flex flex-col gap-1.5 text-left mt-4">
          {produto.duracao && (
            <div className={`inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold ${t.textMuted}`}>
              <Clock className="w-3 h-3" /> {produto.duracao}
            </div>
          )}

          <p className={`font-bold text-lg leading-tight ${fontHeading} ${t.textPrimary}`}>
            {produto.nome}
          </p>

          {produto.descricao && (
            <p className={`text-xs leading-relaxed ${t.textMuted}`}>
              {produto.descricao}
            </p>
          )}

          <p className={`text-xl font-bold mt-1 ${t.accentText}`}>
            R$ {produto.valor}
            {isUnitario && (
              <span className={`text-xs font-normal ml-1 ${t.textMuted}`}>/ un</span>
            )}
          </p>
        </div>

        {isUnitario && (
          <div className={`w-full max-w-[310px] flex items-center justify-between px-3.5 py-2.5 rounded-2xl mt-3 ${t.cardItemBg}`}>
            <span className={`text-xs font-bold ${t.textSecondary}`}>Quantidade:</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantidade((prev) => Math.max(1, prev - 1))}
                className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-base cursor-pointer active:scale-90 transition-all ${t.stepBtn}`}
              >
                -
              </button>
              <span className={`font-bold text-sm w-4 text-center ${t.textPrimary}`}>
                {quantidade}
              </span>
              <button
                type="button"
                onClick={() => setQuantidade((prev) => prev + 1)}
                className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-base cursor-pointer active:scale-90 transition-all ${t.stepBtn}`}
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  )
}
