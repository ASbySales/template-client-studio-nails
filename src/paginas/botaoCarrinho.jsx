import JKStudioNailsOnlyLogo from '../assets/JKStudioNailsOnlyLogo.png'
import { useState } from 'react'

export default function BotaoCarrinho ({carr}) {
    const [carrinho, setCarrinho] = useState(null);

    return (
        <section>
            <img onClick={carr} src={JKStudioNailsOnlyLogo} 
            className={`
                FORMA h-20 w-20 rounded-full
                POSIÇÃO fixed z-50 bottom-20 right-3
                PINTURA ring-1 ring-yellow-600
                ANIMAÇÃO active:scale-110 transition-all duration-200`}/>
        </section>
    )
}