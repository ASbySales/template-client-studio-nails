export default function BotaoCarrinho({ carr }) {
    return (
        <section>
            <button 
                onClick={carr} 
                className='fixed bottom-6 right-4 z-10 bg-white/95 
                hover:bg-white text-[#C5A059] border border-[#C5A059]/40 rounded-full 
                px-4 py-1.5 shadow-md text-sm font-semibold font-cinzel transition-all 
                hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5'
            >
                <span>Carrinho</span>
                <span>🛒</span>
            </button>
        </section>
    )
}