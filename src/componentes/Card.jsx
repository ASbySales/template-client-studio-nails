import { STUDIO_LOGO } from '../core'

function fallbackImagem(e) {
  if (e.currentTarget.dataset.fbDone) return
  e.currentTarget.dataset.fbDone = '1'
  e.currentTarget.src = STUDIO_LOGO
}

export default function Card({ produto, open }) {
  if (!produto) return null

  return (
    <article
      onClick={() => open(produto)}
      className='w-32 sm:w-36 flex flex-col items-center bg-white rounded-2xl p-2 ring-1 ring-[#EDE3E0] border border-[#F5EEEB] shadow-2xs hover:shadow-md hover:ring-[#C49391]/70 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95 text-center group'
    >
      <div className='w-full aspect-square rounded-xl overflow-hidden border border-[#F2E8E5] bg-[#FBF9F5] flex items-center justify-center relative'>
        <img
          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
          src={produto.img || STUDIO_LOGO}
          alt={produto.nome}
          loading="lazy"
          onError={fallbackImagem}
        />
      </div>

      <div className='w-full mt-2 px-0.5 text-left flex flex-col justify-between'>
        <h3 className='font-semibold text-xs text-[#2A2120] line-clamp-1 leading-tight'>
          {produto.nome}
        </h3>
        {produto.descricao && (
          <p className='text-[10px] text-[#8D7D7B] line-clamp-1 leading-snug mt-0.5'>
            {produto.descricao}
          </p>
        )}
        <span className='font-bold text-xs sm:text-sm text-[#9F6664] mt-1 tabular-nums'>
          R$ {produto.valor}
        </span>
      </div>
    </article>
  )
}
