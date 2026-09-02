import { useState } from 'react'
import JKStudioNailsOnlyLogo from '../assets/JKStudioNailsOnlyLogo.png'

// --- SUB-COMPONENTE 1: DETALHES DO SERVIÇO ---
function DetalhesProduto({ produto, irPara, opcionais, onClose, onConfirm }) {
    const isUnitario = produto.tipo === 'extra' || produto.tipo === 'substitutivo'
    const [quantidade, setQuantidade] = useState(1)

    return (
        <div>
            <div className='h-11 w-full flex justify-start items-end px-3 text-xl text-gray-200 font-bold'>
                <button 
                    type="button"
                    onClick={onClose} 
                    className='h-8 w-8 hover:scale-110 active:scale-100 flex justify-center items-center pb-0.5 rounded-full bg-[#D9A09E]/20 text-[#C08A89] cursor-pointer border-none'
                >
                    ✕
                </button>
            </div>
            <div className='h-50 w-full flex justify-center mt-2'>
                <div className='hover:scale-103 transition-all duration-300 w-50 h-full bg-white rounded-3xl shadow-lg flex items-center justify-center overflow-hidden ring-2 ring-[#D9A09E]/30 border-2 border-[#D9A09E]/60'>
                    <img src={produto.img || JKStudioNailsOnlyLogo} alt={produto.nome} className="h-full object-cover" />
                </div>
            </div>
            <div className='min-h-35 w-full flex flex-col items-center justify-center py-3 px-2'>
                <div className='w-full max-w-[240px] flex flex-col justify-between gap-1 text-left'>
                    <p className='text-black font-bold text-lg hover:scale-103 transition-all duration-300'>{produto.nome}</p>
                    <div className='text-xs text-gray-600 line-clamp-4 hover:scale-103 transition-all duration-300'>{produto.descricao}</div>
                    <p className='text-lg text-[#C08A89] font-bold hover:scale-103 transition-all duration-300'>
                        R$ {produto.valor}
                        {isUnitario && <span className='text-xs text-gray-400 font-normal ml-1'>/ unidade</span>}
                    </p>
                </div>

                {/* Seletor de Quantidade: EXIBIDO APENAS SE FOR SERVIÇO UNITÁRIO */}
                {isUnitario && (
                    <div className='w-full max-w-[240px] flex items-center justify-between px-3 py-2 bg-gray-50 rounded-2xl border border-gray-200/80 mt-2 shadow-xs'>
                        <span className='text-xs font-bold text-gray-700'>Unidades:</span>
                        <div className='flex items-center gap-3'>
                            <button 
                                type="button"
                                onClick={() => setQuantidade(prev => Math.max(1, prev - 1))}
                                className='h-7 w-7 bg-gray-200 rounded-full pb-1 flex justify-center items-center font-bold text-base cursor-pointer hover:bg-gray-300 active:scale-90 transition-all border-none'
                            >
                                -
                            </button>
                            <span className='font-bold text-sm text-gray-800 w-4 text-center'>{quantidade}</span>
                            <button 
                                type="button"
                                onClick={() => setQuantidade(prev => prev + 1)}
                                className='h-7 w-7 bg-gray-200 rounded-full pb-1 flex justify-center items-center font-bold text-base cursor-pointer hover:bg-gray-300 active:scale-90 transition-all border-none'
                            >
                                +
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className='h-15 w-full flex justify-center items-start'>
                <button 
                    type="button"
                    onClick={() => {
                        if (isUnitario) {
                            onConfirm({ quantidadePrincipal: quantidade, opcionais: {} })
                            onClose()
                        } else if (produto.aceita_adicionais === false) {
                            onConfirm({ quantidadePrincipal: 1, opcionais: {} })
                            onClose()
                        } else {
                            irPara(() => OpcionaisProduto)
                        }
                    }}
                    className='h-10 w-50 font-bold text-md bg-[#C08A89] text-white rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer border-none'
                >
                    {isUnitario || produto.aceita_adicionais === false ? 'Adicionar ao Carrinho' : 'Escolher'}
                </button>
            </div>
        </div>
    )
}

// --- SUB-COMPONENTE 2: OPCIONAIS (UNITÁRIOS SECUNDÁRIOS) ---
function OpcionaisProduto({ produto, opcionais, irPara, onClose, onConfirm }) {
    const [quant, setQuant] = useState({})

    return (
        <div>
            <div className='h-11 w-full flex justify-start items-end px-3 text-xl text-gray-200 font-bold'>
                <button 
                    type="button"
                    onClick={() => irPara(() => DetalhesProduto)} 
                    className='h-8 w-11 flex justify-center items-center bg-[#D9A09E]/20 text-[#C08A89] rounded-full cursor-pointer border-none'
                >
                    ❮
                </button>
                <div className='w-full flex justify-center mr-8'>
                    <p className='font-bold text-gray-800'>
                        Unitários Adicionais
                    </p>
                </div>
            </div>
            
            <div className='flex flex-col max-h-85 overflow-y-auto overscroll-contain no-scrollbar mt-2 px-2 permitir-scroll'>
                <div className='flex flex-col items-center pt-2'>
                    {opcionais.map((item) => (
                        <div key={item.id} className='w-60 h-20 bg-gray-200 rounded-3xl my-1 p-2 flex flex-row justify-between items-center'>
                            <div className='flex flex-row items-center gap-2'>
                                <img src={item.img || JKStudioNailsOnlyLogo} className='w-10 h-10 bg-gray-100 rounded-2xl shadow-md object-cover' />
                                <div className='flex flex-col text-left'>
                                    <span className='text-xs text-gray-600 font-bold'>{item.nome}</span>
                                    <span className='text-[10px] text-gray-500'>
                                        R$ {item.valor}
                                    </span>
                                </div>
                            </div>
                            <div className='flex items-center gap-2'>
                                <button 
                                    type="button"
                                    onClick={() => setQuant(prev => ({ ...prev, [item.id]: Math.max(0, (prev[item.id] || 0) - 1) }))}
                                    className='h-6 w-6 bg-gray-300 rounded-full flex justify-center items-center font-bold text-sm cursor-pointer border-none hover:bg-gray-400 active:scale-90 transition-all'
                                >
                                    -
                                </button>
                                <span className='font-bold text-sm'>{quant[item.id] || 0}</span>
                                <button 
                                    type="button"
                                    onClick={() => setQuant(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }))}
                                    className='h-6 w-6 bg-gray-300 rounded-full flex justify-center items-center font-bold text-sm cursor-pointer border-none hover:bg-gray-400 active:scale-90 transition-all'
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className='h-15 w-full flex justify-center items-center mt-3'>
                <button 
                    type="button"
                    onClick={() => {
                        onConfirm({ quantidadePrincipal: 1, opcionais: quant })
                        onClose()
                    }}
                    className='h-10 w-50 font-bold text-md bg-[#C08A89] text-white rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer border-none'
                >
                    Adicionar ao Carrinho
                </button>
            </div>
        </div>
    )
}

// --- COMPONENTE PRINCIPAL (EXPORTADO) ---
export default function ModalServico({ produto, opcionais, onClose, onConfirm }) {
    const [EtapaAtiva, setEtapaAtiva] = useState(() => DetalhesProduto)

    // Trava completamente a rolagem e o touch do fundo enquanto o modal estiver aberto
    useEffect(() => {
        if (!produto) return;

        const scrollY = window.scrollY;
        const body = document.body;
        const html = document.documentElement;

        const prevBodyPos = body.style.position;
        const prevBodyTop = body.style.top;
        const prevBodyWidth = body.style.width;
        const prevBodyOverflow = body.style.overflow;
        const prevHtmlOverflow = html.style.overflow;

        body.style.position = 'fixed';
        body.style.top = `-${scrollY}px`;
        body.style.width = '100%';
        body.style.overflow = 'hidden';
        html.style.overflow = 'hidden';

        const prevenirTouchFundo = (e) => {
            if (!e.target.closest('.permitir-scroll')) {
                e.preventDefault();
            }
        };

        document.addEventListener('touchmove', prevenirTouchFundo, { passive: false });

        return () => {
            body.style.position = prevBodyPos;
            body.style.top = prevBodyTop;
            body.style.width = prevBodyWidth;
            body.style.overflow = prevBodyOverflow;
            html.style.overflow = prevHtmlOverflow;
            document.removeEventListener('touchmove', prevenirTouchFundo);
            window.scrollTo(0, scrollY);
        };
    }, [produto]);

    if (!produto) return null

    return (
        <section className="fixed inset-0 z-52 min-h-screen w-screen flex items-center justify-center bg-black/40 backdrop-blur-xs overscroll-contain">
            <div className="min-h-100 min-w-70 rounded-3xl bg-white ring-1 ring-[#D9A09E]/50 shadow-2xl flex flex-col gap-2 p-2 overscroll-contain">
                <EtapaAtiva 
                    produto={produto} 
                    opcionais={opcionais} 
                    irPara={setEtapaAtiva} 
                    onClose={onClose} 
                    onConfirm={onConfirm}
                />
            </div>
        </section>
    )
}
