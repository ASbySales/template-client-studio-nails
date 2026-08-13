import cesta from '../assets/cesta.png'
import { useState } from 'react'

export default function Card({nome, valor, descricao, img, id, open}) {
    const setActiveProduct = () => {}
    return (
        <article onClick={() => setActiveProduct(true)} className='ring-1 ring-[#D9A09E]/40 shrink-0 w-40 max-h-50 flex flex-col gap-3 items-center bg-gray-100 rounded-2xl p-5 border border-[#C08A89]/20 shadow-sm transition-all duration-300 hover:shadow-md max-w-[360px] mx-auto'>
            <div 
                onClick={open} 
                className='flex flex-col items-center w-35 h-30 shadow-lg p-2 rounded-3xl hover:scale-105 transition-all duration-100 bg-white cursor-pointer'
            >
                {/* Imagem do Produto */}
                <div className=''>
                    <img className='max-h-20' src={img} alt={nome} />
                </div>
                
                {/* Informações do Produto */}
                <div className='text-center mt-1'>
                    <h3 className='font-bold text-xs line-clamp-1'>
                        {nome}
                    </h3>
                </div>
            </div>
        </article>
    )
}