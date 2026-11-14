export { supabase } from './supabase'
export {
  TENANT_ID,
  WHATSAPP_NUMBER,
  TORRE_STATUS_TOKEN,
  STORAGE_PREFIX,
  STUDIO_LOGO,
} from './env'
export {
  LIMITE_SUBSTITUTIVOS,
  parseValorNumerico,
  formatarMoeda,
  ordenarPorOrdem,
  mascaraWhatsapp,
  validarWhatsapp,
  isServicoUnitario,
  aceitaAdicionais,
  contarSubstitutivos,
  limparOpcionaisZerados,
  calcularPrecoItem,
  calcularTotalCarrinho,
  normalizarServico,
  validarItemCarrinho,
  montarPayloadItens,
  formatarCodigoAgendamento,
  formatarMensagemWhatsApp,
} from './regrasCalculo'
export { carregarCatalogoTenant } from './catalogoService'
export {
  carregarCarrinhoLocal,
  salvarCarrinhoLocal,
  obterDadosClienteSalvos,
  obterHistoricoSalvo,
  prepararItensRepetirPedido,
  enviarSolicitacaoAgendamento,
} from './checkoutService'
export { useScrollLock, useOverlayBack } from './hooksUi'
export { useCatalogo } from './useCatalogo'
export { useCarrinho } from './useCarrinho'
export { useUI } from './uiContext'
export { default as UIProvider } from './UIProvider'
export { default as AssinaturaGuard } from './AssinaturaGuard'
export { BottomSheet, PuxarAtualizar, EstadoVazio } from './FeedbackUI'
export { default as ModalServico } from './ModalServico'
export { default as CarrinhoSheet } from './CarrinhoSheet'
