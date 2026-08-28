import { useState } from 'react'
import JKStudioNailsOnlyLogo from '../assets/JKStudioNailsOnlyLogo.png'

// --- SUB-COMPONENTE 1: DETALHES DO SERVIÇO ---
function DetalhesProduto({ produto, irPara, opcionais, onClose, onConfirm }) {
    return (
        <div>
            <div className='h-11 w-full flex justify-start items-end px-3 text-xl text-gray-200 font-bold'>
                <a onClick={onClose} className='h-8 w-8 hover:scale-110 active:scale-100 flex justify-center items-center pb-0.5 rounded-full bg-[#D9A09E]/20 text-[#C08A89] cursor-pointer'>
                ✕</a>
            </div>
            <div className='h-50 w-full flex justify-center mt-2'>
                <div className='w-50 h-full bg-white rounded-3xl shadow-lg flex items-center justify-center overflow-hidden'>
                    <img src={produto.img || JKStudioNailsOnlyLogo} alt={produto.nome} className="h-full object-cover" />
                </div>
            </div>
            <div className='min-h-35 w-full flex flex-row items-start justify-center py-3'>
                <div className='min-h-20 w-50 flex flex-col justify-between gap-1'>
                    <p className='text-black font-bold text-lg'>{produto.nome}</p>
                    <div className='text-sm text-gray-600'>{produto.descricao}</div>
                    <p className='text-lg text-[#C08A89] font-bold'>
                        R$ {produto.valor}</p>
                </div>
            </div>
            <div className='h-15 w-full flex justify-center items-start'>
                <button 
                    onClick={() => {
                        if (produto.aceita_adicionais === false) {
                            onConfirm({}) // adiciona sem opcionais
                            onClose()
                        } else {
                            irPara(() => OpcionaisProduto)
                        }
                    }}
                    className='h-10 w-50 font-bold text-md bg-[#C08A89] text-white rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer'
                >
                    {produto.aceita_adicionais === false ? 'Adicionar ao Carrinho' : 'Escolher'}
                </button>
            </div>
        </div>
    )
}

// --- SUB-COMPONENTE 2: OPCIONAIS (UNITÁRIOS) ---
function OpcionaisProduto({ produto, opcionais, irPara, onClose, onConfirm }) {
    const [quant, setQuant] = useState({})

    return (
        <div>
            <div className='h-11 w-full flex justify-start items-end px-3 text-xl text-gray-200 font-bold'>
                <a onClick={() => irPara(() => DetalhesProduto)} className='h-8 w-8 flex justify-center items-center bg-[#D9A09E]/20 text-[#C08A89] rounded-full cursor-pointer'>
                    ❮</a>
                <div className='w-full flex justify-center mr-8'>
                    <p className='font-bold text-gray-800'>
                        Unitários</p>
                </div>
            </div>
            
            <div className='flex flex-col max-h-85 overflow-auto no-scrollbar mt-2 px-2'>
                <div className='flex flex-col items-center pt-2'>
                    {opcionais.map((item) => (
                        <div key={item.id} className='w-60 h-20 bg-gray-200 rounded-3xl my-1 p-2 flex flex-row justify-between items-center'>
                            <div className='flex flex-row items-center gap-2'>
                                <img src={item.img || JKStudioNailsOnlyLogo} className='w-10 h-10 bg-gray-100 rounded-2xl shadow-md' />
                                <div className='flex flex-col text-left'>
                                    <span className='text-xs text-gray-600 font-bold'>{item.nome}</span>
                                    <span className='text-[10px] text-gray-500'>
                                        R$ {item.valor}</span>
                                </div>
                            </div>
                            <div className='flex items-center gap-2'>
                                <button 
                                    onClick={() => setQuant(prev => ({ ...prev, [item.id]: Math.max(0, (prev[item.id] || 0) - 1) }))}
                                    className='h-6 w-6 bg-gray-300 rounded-full flex justify-center items-center font-bold text-sm cursor-pointer'
                                >
                                    -
                                </button>
                                <span className='font-bold text-sm'>{quant[item.id] || 0}</span>
                                <button 
                                    onClick={() => setQuant(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }))}
                                    className='h-6 w-6 bg-gray-300 rounded-full flex justify-center items-center font-bold text-sm cursor-pointer'
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
                    onClick={() => {
                        onConfirm(quant)
                        onClose()
                    }}
                    className='h-10 w-50 font-bold text-md bg-[#C08A89] text-white rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer'
                >Escolher
                    
                </button>
            </div>
        </div>
    )
}

// --- COMPONENTE PRINCIPAL (EXPORTADO) ---
export default function ModalServico({ produto, opcionais, onClose, onConfirm }) {
    const [EtapaAtiva, setEtapaAtiva] = useState(() => DetalhesProduto)

    if (!produto) return null

    return (
        <section className="fixed inset-0 z-52 min-h-screen w-screen flex items-center justify-center bg-black/40 backdrop-blur-xs">
            <div className="min-h-100 min-w-70 rounded-3xl bg-white ring-1 ring-[#D9A09E]/50 shadow-2xl flex flex-col gap-2 p-2">
                {/* Renderização dinâmica do componente de Etapa */}
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
