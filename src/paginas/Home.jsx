import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { STUDIO_LOGO, WHATSAPP_NUMBER } from '../core'
import catalogo from '../assets/catalogo.png'
import whatsapp from '../assets/whatsapp.png'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className='w-full min-h-screen flex flex-col items-center justify-start bg-[#FBF9F5] text-[#2A2120] selection:bg-[#9F6664]/20'>
      {/* Cabeçalho curvo estilo JK / Flora Haste em paleta clean alabastro & rosé mauve */}
      <header className='w-full relative bg-white flex flex-col items-center pb-5 shadow-2xs border-b border-[#EDE3E0]'>
        <svg width="0" height="0" className="absolute">
          <defs>
            <clipPath id="serena-home-mask" clipPathUnits="objectBoundingBox">
              <path d="M 0,1 L 0,0 L 1,0 L 1,1 C .65 .8, .35 .8, 0 1 Z" />
            </clipPath>
          </defs>
        </svg>

        <div
          className='h-[175px] w-full relative bg-gradient-to-r from-[#F4E6E3] via-[#E8D0CC] to-[#F4E6E3]'
          style={{ clipPath: 'url(#serena-home-mask)' }}
        />

        <div className='absolute top-[86px] left-1/2 -translate-x-1/2 w-[124px] h-[124px] rounded-full border-4 border-white border-b-[#C49391] bg-[#FBF9F5] shadow-md overflow-hidden flex items-center justify-center ring-1 ring-[#E8DCD8]'>
          <img
            className='w-full h-full object-cover'
            src={STUDIO_LOGO}
            alt="Logo Studio Serena Nail Design"
          />
        </div>

        <div className='mt-[64px] text-center select-none tracking-wide px-4'>
          <h1 className='text-2xl sm:text-3xl text-[#2A2120] font-cinzel font-bold tracking-[0.12em]'>
            STUDIO SERENA
          </h1>
          <span className='text-[11px] block font-sans font-semibold text-[#9F6664] uppercase tracking-[0.22em] mt-1'>
            Nail Design &amp; Care
          </span>
        </div>
      </header>

      {/* Rede Social */}
      <section className='w-full max-w-[480px] flex justify-center items-center pt-4 pb-2'>
        <a
          className='p-2 text-[#9F6664] hover:opacity-75 active:scale-95 transition-all'
          href='https://www.instagram.com/'
          rel='noopener noreferrer'
          target='_blank'
          aria-label="Instagram Studio Serena"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M16.8503 0H7.14973C3.20735 0 0 3.20735 0 7.14973V16.8503C0 20.7926 3.20735 24 7.14973 24H16.8503C20.7926 24 24 20.7926 24 16.8503V7.14973C24 3.20735 20.7926 0 16.8503 0ZM21.5856 16.8503C21.5856 19.4655 19.4655 21.5856 16.8503 21.5856H7.14973C4.5345 21.5856 2.4144 19.4655 2.4144 16.8503V7.14973C2.4144 4.53446 4.5345 2.4144 7.14973 2.4144H16.8503C19.4655 2.4144 21.5856 4.53446 21.5856 7.14973V16.8503ZM12.0002 5.79297C8.57754 5.79297 5.79297 8.57754 5.79297 12.0002C5.79297 15.4228 8.57754 18.2074 12.0002 18.2074C15.4229 18.2074 18.2075 15.4229 18.2075 12.0002C18.2075 8.57749 15.4229 5.79297 12.0002 5.79297ZM12.0002 15.7931C9.90547 15.7931 8.20737 14.095 8.20737 12.0002C8.20737 9.90547 9.90551 8.20737 12.0002 8.20737C14.095 8.20737 15.7931 9.90547 15.7931 12.0002C15.7931 14.0949 14.0949 15.7931 12.0002 15.7931ZM19.7067 5.83895C19.7067 6.66041 19.0408 7.32633 18.2193 7.32633C17.3979 7.32633 16.7319 6.66041 16.7319 5.83895C16.7319 5.01749 17.3979 4.35156 18.2193 4.35156C19.0408 4.35156 19.7067 5.01749 19.7067 5.83895Z"
            />
          </svg>
        </a>
      </section>

      {/* Lista de links minimalista padrão JK / Flora Haste */}
      <main className='w-full max-w-[480px] flex-1 flex flex-col justify-center px-5 py-6'>
        <div className='w-full bg-white rounded-2xl border border-[#EDE3E0] shadow-2xs overflow-hidden divide-y divide-[#EDE3E0]'>
          <a
            className='group flex items-center justify-between px-5 py-4 hover:bg-[#FBF9F5] active:scale-[0.99] transition-all'
            target='_blank'
            rel='noopener noreferrer'
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20um%20hor%C3%A1rio%20no%20Studio%20Serena.`}
          >
            <div className='w-12 h-12 rounded-full bg-[#FBF9F5] border border-[#EDE3E0] p-1.5 flex items-center justify-center shrink-0'>
              <img
                className='w-full h-full rounded-full object-cover opacity-80'
                alt="Agendar pelo WhatsApp"
                src={whatsapp}
              />
            </div>

            <div className='flex-1 flex items-center justify-between ml-4 min-w-0'>
              <div>
                <span className='block text-[#2A2120] text-sm sm:text-base font-semibold'>
                  Fale comigo
                </span>
                <span className='block text-xs text-[#7D6C6A]'>
                  Dúvidas e horários pelo WhatsApp
                </span>
              </div>
              <ArrowRight className='w-4 h-4 text-[#9F6664] group-hover:translate-x-1 transition-transform shrink-0' />
            </div>
          </a>

          <button
            className='group w-full flex items-center justify-between px-5 py-4 hover:bg-[#FBF9F5] active:scale-[0.99] transition-all cursor-pointer text-left bg-transparent border-none'
            type='button'
            onClick={() => navigate('/Catalogo')}
          >
            <div className='w-12 h-12 rounded-full bg-[#FBF9F5] border border-[#EDE3E0] p-1.5 flex items-center justify-center shrink-0'>
              <img
                className='w-full h-full rounded-full object-cover opacity-75'
                alt="Nosso Catálogo"
                src={catalogo}
              />
            </div>

            <div className='flex-1 flex items-center justify-between ml-4 min-w-0'>
              <div>
                <span className='block text-[#2A2120] text-sm sm:text-base font-semibold'>
                  Nosso Catálogo
                </span>
                <span className='block text-xs text-[#7D6C6A]'>
                  Procedimentos, adicionais e agendamento
                </span>
              </div>
              <ArrowRight className='w-4 h-4 text-[#9F6664] group-hover:translate-x-1 transition-transform shrink-0' />
            </div>
          </button>
        </div>

        <p className='text-[11px] text-center text-[#7D6C6A] mt-5 tracking-wide'>
          Atendimento com hora marcada · Cuidado natural e biossegurança
        </p>
      </main>

      {/* Rodapé discreto */}
      <footer className='w-full max-w-[480px] py-7 flex flex-col items-center gap-1.5 text-center mt-auto'>
        <hr className='w-14 border-t border-[#D8BEBA]/60' />
        <div className='text-xs text-[#9F6664]/80 font-cinzel'>
          Studio Serena · Nail Design
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
