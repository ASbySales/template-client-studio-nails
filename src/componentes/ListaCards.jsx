import Card from './Card'
import { useRef } from 'react'

export default function ListaCards({produtos, opened}) {    
    const scrollContainerRef = useRef(null)

    const scroll = (scrollOffset) => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: scrollOffset,
                behavior: 'smooth'
            })
        }
    }

    return (
        <div className='w-full relative bg-white py-4 group'>
            {/* Seta para a Esquerda (Aparece apenas em computadores - md:) */}
            <button
                onClick={() => scroll(-250)}
                className='absolute left-1 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#52AFAA] border border-[#6DC2C4]/20 shadow-md hover:scale-110 active:scale-100 transition-all duration-100 cursor-pointer'
            >
                ❮
            </button>

            {/* O Trilho (Contêiner rolável) */}
            <div 
                ref={scrollContainerRef}
                className='flex flex-row transition-transform duration-500 ease-out w-full overflow-auto no-scrollbar p-3'
            > 
                {produtos.map((produto) => (
                    <div key={produto.id} className='w-full px-3 drop-shadow-md'>
                        <Card 
                            produto={produto}
                            open={opened}
                        />
                    </div>
                ))}
            </div>

            {/* Seta para a Direita (Aparece apenas em computadores - md:) */}
            <button
                onClick={() => scroll(250)}
                className='absolute right-1 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#52AFAA] border border-[#6DC2C4]/20 shadow-md hover:scale-110 active:scale-100 transition-all duration-100 cursor-pointer'
            >
                ❯
            </button>
        </div>
    )
}
