import cesta from '../assets/cesta.png'
import { useState } from 'react'

export default function Card({produto, open}) {
    if (!produto) return null;
    return (
        <article onClick={() => open(produto)} 
        className='ring-3 ring-[#D9A09E]/40 shrink-0 w-40 max-h-50 flex flex-col gap-3 items-center bg-gray-100 rounded-2xl p-5 border border-[#C08A89]/20 shadow-sm 
        transition-all duration-300 hover:shadow-md max-w-[360px] mx-auto'>
            <div 
            className='flex flex-col items-center justify-center border-4 border-[#D9A09E]/40 w-30 h-30 shadow-lg rounded-xl hover:scale-105 transition-all duration-100 cursor-pointer overflow-hidden'
            >
                {/* Imagem do Produto */}
                    <img className='w-full h-full object-cover' src={produto.img} alt={produto.nome} />
            </div>

                {/* Informações do Produto */}
                <div className='text-center mt-1 '>
                    
                    <h3 className='font-bold text-xs text-gray-600 line-clamp-1 '>
                        {produto.nome}
                    </h3>
                    <div className='flex justify-center'>
                        <div className='h-1 w-15 pt-2 border-b-1 border-gray-500'></div>
                    </div>
                </div>
        </article>
    )
}