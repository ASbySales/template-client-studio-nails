import { useRef } from 'react'
import Card from './Card'

export default function ListaCards({ produtos, opened }) {
  const scrollContainerRef = useRef(null)

  const scroll = (scrollOffset) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: scrollOffset,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className='w-full relative bg-white py-1.5 group'>
      <button
        type="button"
        onClick={() => scroll(-220)}
        className='absolute left-1.5 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white/95 hover:bg-white text-[#9F6664] border border-[#E8DCD8] shadow-sm hover:scale-110 active:scale-95 transition-all cursor-pointer text-xs'
        aria-label="Rolar para esquerda"
      >
        ❮
      </button>

      <div
        ref={scrollContainerRef}
        className='flex flex-row gap-2.5 transition-transform duration-300 ease-out w-full overflow-x-auto no-scrollbar px-2.5 py-1'
      >
        {produtos.map((produto) => (
          <div key={produto.id} className='shrink-0'>
            <Card produto={produto} open={opened} />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scroll(220)}
        className='absolute right-1.5 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white/95 hover:bg-white text-[#9F6664] border border-[#E8DCD8] shadow-sm hover:scale-110 active:scale-95 transition-all cursor-pointer text-xs'
        aria-label="Rolar para direita"
      >
        ❯
      </button>
    </div>
  )
}
