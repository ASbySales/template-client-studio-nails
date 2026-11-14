import { ShoppingBag } from 'lucide-react'

export default function BotaoCarrinho({ carr, totalItens = 0 }) {
  return (
    <button
      type="button"
      onClick={carr}
      className='fixed bottom-6 right-5 z-40 bg-[#9F6664] hover:bg-[#8A5553] text-white p-3.5 rounded-full shadow-lg shadow-[#9F6664]/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-2 border-[#FBF9F5] cursor-pointer'
      aria-label="Abrir Sacola de Agendamento"
    >
      <ShoppingBag className='w-6 h-6' />
      {totalItens > 0 && (
        <span className='absolute -top-1.5 -right-1.5 bg-[#2A2120] text-white text-[11px] font-bold h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center border-2 border-[#FBF9F5] shadow-sm tabular-nums'>
          {totalItens}
        </span>
      )}
    </button>
  )
}
