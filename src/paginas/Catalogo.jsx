import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import hero from '../assets/hero.png'
import heroImg from '../assets/image.png'
import ListaCards from '../componentes/ListaCards'

export default function Catalogo() {
    const navigate = useNavigate()
    const [activeProduct, setActiveProduct] = useState(null)
    const [activeEncapsulamento, setActiveEncapsulamento] = useState(null)
    const [activeBigCard, setActiveBigCard] = useState(null)

    const servicosFicticios = [
        { id: 1, nome: 'Manicure Simples', descricao: 'Limpeza, cuticulagem e esmaltação tradicional nas mãos.', valor: '35,00', img: hero },
        { id: 2, nome: 'Alongamento em Gel', descricao: 'Extensão das unhas com técnica de gel moldado.', valor: '120,00', img: hero },
        { id: 3, nome: 'Banho em Gel', descricao: 'Camada de gel sobre a unha natural para força e brilho.', valor: '70,00', img: hero }
    ]

    return (
        <div className='w-full min-h-screen flex flex-col items-center bg-white'>
            
            {/* O Cabeçalho */}
            <header className='w-full relative bg-white flex flex-col items-center pb-4'>
                <svg width="0" height="0" className="absolute">
                    <defs>
                        <clipPath id="minimal-01-mask" clipPathUnits="objectBoundingBox">
                            <path d="M 0,1 L 0,0 L 1,0 L 1,1 C .65 .8, .35 .8, 0 1 Z" />
                        </clipPath>
                    </defs>
                </svg>
                
                {/* Imagem de Capa Recortada com Gradiente Rose Gold chique */}
                <div className='h-[180px] w-full relative bg-gradient-to-tr from-[#E6C2C1] via-[#D9A09E] to-[#C08A89]' style={{ clipPath: 'url(#minimal-01-mask)' }} />
                
                {/* Botão Voltar Flutuante */}
                <button 
                    onClick={() => navigate('/')} 
                    className='fixed top-4 left-4 z-10 bg-white/80 hover:bg-white text-[#D9A09E] border border-[#C08A89]/30 rounded-full px-4 py-1.5 shadow-sm text-xs font-semibold font-cinzel transition-all hover:scale-105 active:scale-95 cursor-pointer'
                >
                    ❮ Voltar
                </button>

                {/* Foto do Perfil */}
                <div className='absolute top-[90px] left-1/2 -translate-x-1/2 w-[130px] h-[130px] rounded-full border-4 border-white bg-white shadow-md overflow-hidden'>
                    <img className='w-full h-full object-cover' src={heroImg} alt="logo JK Studio Nails" />
                </div>
                
                {/* Título Oficial */}
                <a className='mt-[70px] text-3xl text-[#C08A89] font-cinzel font-normal text-center select-none tracking-wide p-2'>
                    Catálogo
                </a>
            </header>

            {/* Seção Principal: Lista/Carrossel de Serviços */}
            <main className='w-full max-w-[480px] flex flex-col bg-white px-4 my-6'>
                <p className='text-sm font-bold bg-white text-[#D9A09E] mb-2 px-3'>
                    Serviços em Destaque</p>
                <ListaCards 
                    produtos={servicosFicticios} 
                    opened={() => {setActiveBigCard(true); setActiveProduct(true); }} 
                />
            </main>
            
            {activeBigCard &&
            <section className="absolute inset-0 z-52 flex min-h-screen w-screen items-center justify-center bg-black/40 backdrop-blur-xs">
                    <div className="min-h-100 min-w-70 rounded-3xl bg-gray-200 ring-1 ring-[#D9A09E]/50 shadow-2xl flex flex-col gap-2">
                        {activeProduct &&
                            <div>
                                <div>
                                    <div className='h-11 w-full flex justify-start items-end px-3 text-xl text-gray-200 font-bold'>
                                        <a onClick={() => {setActiveProduct(activeProduct); setActiveBigCard(false); }} className='h-8 w-8 hover:scale-110 active:scale-100 flex justify-center items-center rounded-full bg-[#D9A09E]/20 text-[#C08A89] transition-all duration-100 shadow-gray-400 shadow-sm cursor-pointer'>X</a>
                                    </div>
                                    <div className='h-50 w-full flex justify-center'>
                                        <div src='' className='w-50 h-full bg-gray-300 rounded-3xl shadow-lg flex items-center justify-center overflow-hidden'>
                                            <img src={activeProduct.img || hero} alt={activeProduct.nome} className="h-full object-cover" />
                                        </div>
                                    </div>
                                </div>
                                <div className='min-h-35 w-full flex flex-row items-start justify-center py-3'>
                                    <div className='min-h-20 w-50 flex flex-col justify-between gap-1'>
                                        <p className='min-h-6 text-black font-bold text-lg hover:text-black/70'>{activeProduct.nome}</p>
                                        <div className='min-h-6 text-sm text-gray-600 hover:text-black/50'> 
                                            {activeProduct.descricao}
                                        </div>
                                        <p className='h-6 text-lg text-[#C08A89] font-bold'>R$ {activeProduct.valor}</p>
                                    </div>
                                </div>
                                <div className='h-15 w-full flex justify-center items-start'>
                                    <div className='h-10 w-50 text-md transition-all duration-100 font-bold hover:scale-105 active:scale-100 flex justify-center items-center bg-[#C08A89] text-white rounded-lg shadow-md hover:shadow-lg cursor-pointer' onClick={() => {setActiveProduct(false); setActiveEncapsulamento(true); }}>
                                    Escolher
                                    </div>
                                </div>
                            </div>
                        }
                        {activeEncapsulamento &&
                        <div>
                            <div>
                                <div className='h-11 w-full flex justify-start items-end px-3 text-xl text-gray-200 font-bold'>
                                    <a onClick={() => {setActiveEncapsulamento(false); setActiveProduct(true)} } className='transition-all duration-100 h-8 w-8 flex justify-center items-center hover:scale-110 active:scale-100 rounded-full bg-[#D9A09E]/20 text-[#C08A89] shadow-gray-400 shadow-sm cursor-pointer'>❮</a>
                                </div>
                                <div className='h-50 w-full flex justify-center'>
                                    <div src='' className='w-50 h-full bg-gray-300 rounded-3xl shadow-lg'  ></div>
                                </div>
                            </div>
                        </div>
                        }
                    </div>
                </section>
            }



            {/* Rodapé */}
            <footer className='w-full max-w-[480px] py-8 flex flex-col items-center justify-end bg-white gap-2'>
                <hr className='w-16 border-t border-[#C08A89]/20'></hr>
                <div className='text-xs text-[#C08A89]/70 font-light'>
                    by <a className='hover:underline font-normal' target='_blank' rel='noopener noreferrer' href='https://asnamanga.vercel.app/'> As </a>
                </div>
            </footer>
        </div>
    )
}