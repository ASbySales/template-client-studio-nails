import { supabase } from './supabase'
import { TENANT_ID } from './env'
import { normalizarServico, ordenarPorOrdem } from './regrasCalculo'

export async function carregarCatalogoTenant(tenantId = TENANT_ID) {
  const { data: catData, error: errCat } = await supabase
    .from('categorias')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('arquivado', false)
    .order('ordem', { ascending: true })
    .order('id', { ascending: true })

  if (errCat) throw errCat

  const { data: servData, error: errServ } = await supabase
    .from('servicos')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('arquivado', false)
    .order('ordem', { ascending: true })
    .order('id', { ascending: true })

  if (errServ) throw errServ

  const categoriasOrdenadas = [...(catData || [])].sort(ordenarPorOrdem)
  const servicosOrdenados = [...(servData || [])].sort(ordenarPorOrdem)

  const categorias = categoriasOrdenadas.map((cat) => ({
    ...cat,
    servicos: servicosOrdenados
      .filter((s) => Number(s.categoria_id) === Number(cat.id))
      .map((s) => normalizarServico(s, cat.nome)),
  }))

  const categoriasVitrine = categorias.filter(
    (cat) => cat.escolha !== false && cat.servicos.length > 0
  )

  const adicionais = categorias
    .filter((cat) => cat.escolha === false)
    .flatMap((cat) => cat.servicos)

  const itensVitrine = categoriasVitrine.flatMap((cat) => cat.servicos)

  return {
    categorias,
    categoriasVitrine,
    adicionais,
    itensVitrine,
  }
}
