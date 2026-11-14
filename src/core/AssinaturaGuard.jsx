import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { TORRE_STATUS_TOKEN } from './env'
import { LOJA_TEMA } from '../config/tema'

const SUPORTE_WHATSAPP = '5583996180441'

export default function AssinaturaGuard({ children, token = TORRE_STATUS_TOKEN }) {
  const [status, setStatus] = useState({
    bloqueado: false,
    motivo: null,
    falhaValidacao: false,
    loading: Boolean(token),
  })

  useEffect(() => {
    if (!token) return undefined
    let ativo = true

    async function verificarAssinatura() {
      try {
        const { data, error } = await supabase
          .schema('torre')
          .rpc('consultar_status_loja', { p_token: token })

        if (!ativo) return

        if (!error && data) {
          if (data.encontrado) {
            setStatus({
              bloqueado: data.bloqueado === true,
              motivo: data.motivo || null,
              falhaValidacao: false,
              loading: false,
            })
            return
          }
          if (data.bloqueado) {
            setStatus({
              bloqueado: true,
              motivo: data.motivo || 'Validação de licença da aplicação não reconhecida.',
              falhaValidacao: true,
              loading: false,
            })
            return
          }
        }
      } catch (err) {
        console.warn('Verificação de assinatura (fallback seguro ativo):', err)
      }

      if (ativo) {
        setStatus({
          bloqueado: false,
          motivo: null,
          falhaValidacao: false,
          loading: false,
        })
      }
    }

    verificarAssinatura()
    return () => {
      ativo = false
    }
  }, [token])

  if (status.loading || !status.bloqueado) {
    return children
  }

  const nomeLoja = LOJA_TEMA.brandFullName || LOJA_TEMA.brandName || 'Loja'
  const mensagemWhats = encodeURIComponent(
    status.falhaValidacao
      ? `Olá Albert! Sou de ${nomeLoja}. O catálogo está indicando necessidade de verificação de licença. Poderia verificar?`
      : `Olá Albert! Sou de ${nomeLoja}. Vi que o catálogo está temporariamente suspenso e gostaria de regularizar para reativar o site.`
  )

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-5">
        <div className="w-16 h-16 bg-red-950/40 border border-red-500/40 rounded-full flex items-center justify-center mx-auto text-red-400 text-2xl animate-pulse">
          🔒
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-wide">
            {status.falhaValidacao ? 'Licença em Verificação' : 'Catálogo Temporariamente Suspenso'}
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            {status.motivo || 'Este domínio encontra-se temporariamente suspenso para manutenção e regularização.'}
          </p>
        </div>

        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">Lojista: {nomeLoja}</p>
          <p>
            {status.falhaValidacao
              ? 'Entre em contato com o suporte para revalidação das credenciais do domínio.'
              : 'Para desbloqueio imediato, realize a regularização pendente.'}
          </p>
        </div>

        <a
          href={`https://wa.me/${SUPORTE_WHATSAPP}?text=${mensagemWhats}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-900/30"
        >
          {status.falhaValidacao ? 'Falar com o Suporte ➔' : 'Regularizar & Reativar Catálogo ➔'}
        </a>

        <p className="text-[11px] text-slate-500">
          AS Gestão Digital • Plataforma de Lojas e Catálogos
        </p>
      </div>
    </div>
  )
}
