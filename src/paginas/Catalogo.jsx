import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import {
  STUDIO_LOGO,
  useUI,
  useCatalogo,
  useCarrinho,
  PuxarAtualizar,
  EstadoVazio,
  ModalServico,
  CarrinhoSheet,
} from '../core'
import ListaCards from '../componentes/ListaCards'
import BotaoCarrinho from './botaoCarrinho'

export default function Catalogo() {
  const navigate = useNavigate()
  const ui = useUI()
  const { categoriasVitrine, adicionais, loading, erro, recarregar } = useCatalogo()
  const {
    itens: itensCarrinho,
    setItens: setItensCarrinho,
    totalItens: totalQtdCarrinho,
    adicionarAoCarrinho,
    removerItem,
    limparCarrinho,
    alterarQtdPrincipal,
    alterarOpcionalItem,
  } = useCarrinho(adicionais, ui?.avisar)

  const [activeProduct, setActiveProduct] = useState(null)
  const [carrinho, setCarrinho] = useState(false)

  if (loading) {
    return (
      <div className='w-full min-h-screen flex flex-col items-center justify-center bg-[#FBF9F5] gap-3'>
        <div className='w-12 h-12 rounded-full border-4 border-[#9F6664] border-t-transparent animate-spin' />
        <p className='text-xs font-semibold text-[#7D6C6A] font-cinzel tracking-wider'>
          Carregando procedimentos...
        </p>
      </div>
    )
  }

  return (
    <div className='w-full min-h-screen flex flex-col items-center justify-start bg-[#FBF9F5] text-[#2A2120] relative selection:bg-[#9F6664]/20'>
      <PuxarAtualizar aoAtualizar={recarregar} className='w-full flex flex-col items-center flex-1'>
        {/* Cabeçalho curvo limpo estilo JK / Flora Haste */}
        <header className='w-full relative bg-white flex flex-col items-center pb-3 shadow-2xs border-b border-[#EDE3E0]'>
          <svg width="0" height="0" className="absolute">
            <defs>
              <clipPath id="serena-catalogo-mask" clipPathUnits="objectBoundingBox">
                <path d="M 0,1 L 0,0 L 1,0 L 1,1 C .65 .8, .35 .8, 0 1 Z" />
              </clipPath>
            </defs>
          </svg>

          <div
            className='h-[126px] w-full relative bg-gradient-to-r from-[#F4E6E3] via-[#E8D0CC] to-[#F4E6E3]'
            style={{ clipPath: 'url(#serena-catalogo-mask)' }}
          />

          <button
            type="button"
            onClick={() => navigate('/')}
            className='fixed top-4 left-4 z-20 bg-white/95 backdrop-blur-xs hover:bg-white text-[#9F6664] border border-[#E8DCD8] rounded-full px-3.5 py-1.5 shadow-sm text-xs font-semibold font-cinzel transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1'
          >
            ❮ Início
          </button>

          <div className='absolute top-11 left-1/2 -translate-x-1/2 w-[112px] h-[112px] rounded-full border-4 border-white border-b-[#C49391] bg-[#FBF9F5] shadow-md overflow-hidden flex items-center justify-center ring-1 ring-[#E8DCD8]'>
            <img
              className='w-full h-full object-cover'
              src={STUDIO_LOGO}
              alt="Logo Studio Serena"
            />
          </div>

          <div className='mt-[64px] flex flex-col items-center text-center px-4'>
            <h1 className='text-2xl text-[#2A2120] font-cinzel font-bold tracking-[0.1em]'>
              STUDIO SERENA
            </h1>
            <span className='text-[11px] font-sans text-[#9F6664] font-semibold tracking-[0.2em] uppercase mt-0.5'>
              Nail Design &amp; Care
            </span>
          </div>
        </header>

        {/* Vitrine de Categorias */}
        <main className='w-full max-w-[480px] flex flex-col items-center px-3 gap-3.5 py-4 pb-24 flex-1'>
          {erro || categoriasVitrine.length === 0 ? (
            <div className='w-full bg-white ring-1 ring-[#EDE3E0] rounded-2xl shadow-2xs'>
              <EstadoVazio
                Icone={RefreshCw}
                titulo={erro ? 'Catálogo indisponível' : 'Nenhum procedimento disponível'}
                texto={erro || 'Nenhum serviço publicado no catálogo no momento.'}
                acaoRotulo='Atualizar catálogo'
                aoClicar={recarregar}
              />
            </div>
          ) : (
            categoriasVitrine.map((cat) => (
              <div
                key={cat.id}
                className='w-full flex flex-col bg-white ring-1 ring-[#EDE3E0] rounded-2xl overflow-hidden shadow-2xs'
              >
                <div className='bg-gradient-to-r from-[#9F6664] via-[#B47D7B] to-[#9F6664] py-2 px-3 border-b border-[#E8DCD8] flex items-center justify-center'>
                  <h2 className='text-xs sm:text-sm text-white font-cinzel font-bold text-center tracking-wider uppercase drop-shadow-2xs'>
                    {cat.nome}
                  </h2>
                </div>
                <ListaCards
                  produtos={cat.servicos}
                  opened={(prod) => setActiveProduct(prod)}
                />
              </div>
            ))
          )}
        </main>
      </PuxarAtualizar>

      {activeProduct && (
        <ModalServico
          key={activeProduct.id}
          produto={activeProduct}
          opcionais={adicionais}
          onClose={() => setActiveProduct(null)}
          onConfirm={(dados) => adicionarAoCarrinho(activeProduct, dados)}
        />
      )}

      <BotaoCarrinho carr={() => setCarrinho(true)} totalItens={totalQtdCarrinho} />

      {carrinho && (
        <CarrinhoSheet
          carr={() => setCarrinho(false)}
          itens={itensCarrinho}
          setItens={setItensCarrinho}
          opcionaisData={adicionais}
          removerItem={removerItem}
          limparCarrinho={limparCarrinho}
          alterarQtdPrincipal={alterarQtdPrincipal}
          alterarOpcionalItem={alterarOpcionalItem}
        />
      )}

      <footer className='w-full max-w-[480px] py-6 flex flex-col items-center justify-end gap-1 text-center mt-auto'>
        <div className='text-[11px] text-[#7D6C6A] font-light'>
          Studio Serena · Nail Design &amp; Care
        </div>
        <div className='text-[10px] text-[#A49391]'>
          by{' '}
          <a
            className='hover:underline font-medium text-[#7D6C6A]'
            target='_blank'
            rel='noopener noreferrer'
            href='https://asales.online/'
          >
            AS Gestão
          </a>
        </div>
      </footer>
    </div>
  )
}
