import AlbertSalesLogo from '../assets/AlbertSalesLogo.png'

export default function Card({produto, open}) {
    if (!produto) return null;
    return (
        <article onClick={() => open(produto)} 
        className='ring-1 ring-[#C5A059]/40 
        shrink-0 w-40 min-h-60 flex flex-col gap-2 items-center 
        bg-gray-100/90 rounded-xl p-2.5 border-2 border-[#C5A059]/20 shadow-xs 
        transition-all duration-300 hover:shadow-md max-w-[360px] mx-auto
        cursor-pointer hover:scale-103 
        active:scale-106'>
            <div 
            className='flex flex-col items-center justify-center 
            ring-1 ring-[#C5A059]/20 border-2 border-[#C5A059]/40 
            w-35 h-35 min-h-30 rounded-lg 
            overflow-hidden bg-white'>
                {/* Imagem do Produto */}
                <img className='w-full h-full object-cover' src={produto.img || AlbertSalesLogo} alt={produto.nome} />
            </div>

            {/* Informações do Produto */}
            <div className='text-start w-full max-h-15'>
                <h3 className='font-bold text-xs text-gray-700 line-clamp-3'>
                    {produto.nome}
                </h3>
                <h4 className='font-normal text-[8px] text-gray-400 line-clamp-3 leading-[12px]'>
                    {produto.descricao}
                </h4>
            </div>
        </article>
    )
}