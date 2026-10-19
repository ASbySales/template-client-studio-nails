import AlbertSalesLogo from '../assets/AlbertSalesLogo.png'

export default function Card({produto, open}) {
    if (!produto) return null;
    return (
        <article 
            onClick={() => open(produto)} 
            className='w-28 sm:w-32 flex flex-col items-center bg-white rounded-xl p-1.5 ring-1 ring-[#C5A059]/40 border border-[#C5A059]/20 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95 text-center'
        >
            {/* Imagem do Produto */}
            <div className='w-full aspect-square rounded-lg overflow-hidden border border-[#C5A059]/20 bg-gray-50 flex items-center justify-center'>
                <img 
                    className='w-full h-full object-cover' 
                    src={produto.img || AlbertSalesLogo} 
                    alt={produto.nome} 
                    loading="lazy"
                />
            </div>

            {/* Informações do Produto */}
            <div className='w-full mt-1.5 px-0.5 text-left flex flex-col justify-between'>
                <h3 className='font-semibold text-[11px] sm:text-xs text-gray-800 line-clamp-1 leading-tight'>
                    {produto.nome}
                </h3>
                {produto.descricao && (
                    <p className='text-[9px] text-gray-400 line-clamp-1 leading-snug mt-0.5'>
                        {produto.descricao}
                    </p>
                )}
                <span className='font-bold text-[11px] sm:text-xs text-[#C5A059] mt-0.5'>
                    R$ {produto.valor}
                </span>
            </div>
        </article>
    )
}