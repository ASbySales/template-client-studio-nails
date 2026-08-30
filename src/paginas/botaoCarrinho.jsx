import JKStudioNailsOnlyLogo from '../assets/JKStudioNailsOnlyLogo.png'
import { useState } from 'react'

export default function BotaoCarrinho ({carr}) {
    const [carrinho, setCarrinho] = useState(null);

    return (
        <section>
            <button 
            onClick={carr} 
            className='fixed bottom-6 right-4 z-10 bg-white/80 hover:bg-white text-[#D9A09E] border border-[#C08A89]/30 rounded-full px-4 py-1.5 shadow-sm text-sm font-semibold font-cinzel transition-all hover:scale-105 active:scale-95 cursor-pointer'>
                    Cesta 𐬽
            </button>
        </section>
    )
}