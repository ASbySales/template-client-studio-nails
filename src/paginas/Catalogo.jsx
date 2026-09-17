import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AlbertSalesLogo from '../assets/AlbertSalesLogo.png'
import ListaCards from '../componentes/ListaCards'
import BotaoCarrinho from './botaoCarrinho'
import Carrinho from './Carrinho'
import ModalServico from '../componentes/ModalServico'

export default function Catalogo() {
    const navigate = useNavigate()
    const [activeProduct, setActiveProduct] = useState(null)
    const [itensCarrinho, setItensCarrinho] = useState(() => {
        try {
            const salvo = localStorage.getItem('carrinho_itens');
            return salvo ? JSON.parse(salvo) : [];
        } catch {
            return [];
        }
    })
    const [categorias, setCategorias] = useState([])
    const [loading, setLoading] = useState(true)
    const [carrinho, setCarrinho] = useState(false)

    // Sincroniza o carrinho com o localStorage sempre que for alterado
    useEffect(() => {
        try {
            localStorage.setItem('carrinho_itens', JSON.stringify(itensCarrinho));
        } catch (e) {
            console.error('Erro ao sincronizar carrinho no cache:', e);
        }
    }, [itensCarrinho]);

    // Busca dados do Supabase na inicialização
    useEffect(() => {
        async function carregarCatalogo() {
            try {
                const { data, error } = await supabase
                    .from('categorias')
                    .select(`
                        id,
                        nome,
                        escolha,
                        servicos (
                            id,
                            nome,
                            descricao,
                            valor,
                            img,
                            tipo,
                            aceita_adicionais
                        )
                    `)
                
                if (error) throw error

                // Formata o valor dos serviços para string com vírgula (ex: 120,00)
                const categoriasFormatadas = (data || []).map(cat => ({
                    ...cat,
                    servicos: (cat.servicos || []).map(serv => ({
                        ...serv,
                        valor: parseFloat(serv.valor).toFixed(2).replace('.', ',')
                    }))
                }))

                setCategorias(categoriasFormatadas)
            } catch (error) {
                console.error('Erro ao buscar dados do catálogo:', error)
            } finally {
                setLoading(false)
            }
        }

        carregarCatalogo()
    }, [])

    const car = () => {
        setCarrinho(true)
    }

    const nocar = () => {
        setCarrinho(false)
    }

    const adicionarAoCarrinho = (itemComOpcionais) => {
    const itemComId = {
        produto: activeProduct,
        quantidade: itemComOpcionais.quantidadePrincipal || itemComOpcionais.quantidade || 1,
        opcionais: itemComOpcionais.opcionais || {},
        idEscolha: Date.now()
    };
    setItensCarrinho(prev => [...prev, itemComId]);
}


    // Scroll Lock Inteligente: Trava o fundo mantendo a posição exata da tela ao abrir qualquer modal ou carrinho
    useEffect(() => {
        const modalAberto = activeProduct !== null || carrinho;

        if (modalAberto) {
            // Salva a posição atual do scroll se ainda não estiver salvo
            if (!document.body.dataset.scrollY) {
                const scrollY = window.scrollY;
                document.body.dataset.scrollY = scrollY.toString();
                document.body.style.position = 'fixed';
                document.body.style.top = `-${scrollY}px`;
                document.body.style.left = '0';
                document.body.style.right = '0';
                document.body.style.width = '100%';
                document.body.style.overflow = 'hidden';
            }
        } else {
            // Restaura o scroll para a posição onde o usuário estava
            const scrollY = document.body.dataset.scrollY;
            if (scrollY !== undefined) {
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.left = '';
                document.body.style.right = '';
                document.body.style.width = '';
                document.body.style.overflow = '';
                delete document.body.dataset.scrollY;
                window.scrollTo(0, parseInt(scrollY || '0', 10));
            }
        }

        return () => {
            if (!activeProduct && !carrinho) {
                const scrollY = document.body.dataset.scrollY;
                if (scrollY !== undefined) {
                    document.body.style.position = '';
                    document.body.style.top = '';
                    document.body.style.left = '';
                    document.body.style.right = '';
                    document.body.style.width = '';
                    document.body.style.overflow = '';
                    delete document.body.dataset.scrollY;
                    window.scrollTo(0, parseInt(scrollY || '0', 10));
                }
            }
        };
    }, [activeProduct, carrinho]);

    if (loading) {
        return (
            <div className='w-full min-h-screen flex flex-col items-center justify-center bg-white gap-3'>
                <div className='w-10 h-10 border-4 border-[#C5A059]/20 border-t-[#C5A059] rounded-full animate-spin'></div>
                <p className='text-sm text-gray-400 font-semibold font-cinzel'>Carregando serviços...</p>
            </div>
        )
    }
    
    const opcionaisLista = categorias
    .flatMap(cat => cat.servicos || [])
    .filter(serv => serv.tipo === 'adicional' || serv.tipo === 'substitutivo' || serv.tipo === 'extra');

    return (
        <div className='w-full min-h-screen flex flex-col items-center bg-white animation-1s'>
            
            {/* O Cabeçalho */}
            <header className='w-full relative bg-white flex flex-col items-center pb-4'>
                <svg width="0" height="0" className="absolute">
                    <defs>
                        <clipPath id="minimal-01-mask" clipPathUnits="objectBoundingBox">
                            <path d="M 0,1 L 0,0 L 1,0 L 1,1 C .65 .8, .35 .8, 0 1 Z" />
                        </clipPath>
                    </defs>
                </svg>
                
                {/* Imagem de Capa Recortada com Gradiente Navy & Gold */}
                <div className='h-[120px] w-full relative bg-gradient-to-tr from-[#0B1233] via-[#0F172A] to-[#1E293B]' 
                style={{ clipPath: 'url(#minimal-01-mask)' }} />
                
                {/* Botão Voltar Flutuante */}
                <button 
                    onClick={() => navigate('/')} 
                    className='fixed bottom-6 left-4 z-10 bg-white/90 hover:bg-white text-[#C5A059] border border-[#C5A059]/40 rounded-full px-4 py-1.5 shadow-md text-sm font-semibold font-cinzel transition-all hover:scale-105 active:scale-95 cursor-pointer'
                >
                    ❮ Voltar
                </button>

                {/* Foto do Perfil */}
                <div className='absolute top-10 left-1/2 -translate-x-1/2 w-[130px] h-[130px] rounded-full border-b-4 border-[#C5A059] bg-[#0F172A] shadow-md overflow-hidden flex items-center justify-center'>
                    <img className='w-full h-full object-cover' src={AlbertSalesLogo} alt="Logo A'S Studio Nails" />
                </div>
                
                <a className='mt-[70px] text-3xl text-[#C5A059] font-cinzel font text-center select-none tracking-wide p-2 transition-all'>
                    A'S
                    <span className='text-sm block font-sans font-normal text-gray-500'>
                        STUDIO NAILS
                    </span>
                </a>
            </header>

            {/* Seção Principal: Lista/Carrossel de Serviços */}
            <main className='w-full max-w-[480px] flex flex-col items-center bg-white px-4 gap-6'>
                <div className='border-t border-[#C5A059]/40 w-60'></div>
                
                {categorias.filter(cat => cat.escolha).map((cat) => (
                    <div key={cat.id} className='w-full flex flex-col bg-white pb-2 my-2 ring-1 ring-[#C5A059]/50 rounded-xl overflow-hidden shadow-sm'>
                        <a className='text-2xl text-white bg-[#0B1233] font-cinzel font-semibold text-center select-none tracking-wide p-2.5 border-b border-[#C5A059]/40'>
                            {cat.nome}
                        </a>
                        <ListaCards 
                            produtos={cat.servicos} 
                            opened={(produtoSelecionado) => { setActiveProduct(produtoSelecionado); }} 
                        />
                    </div>
                ))}
            </main>
            
            {activeProduct && (
                <ModalServico 
                    produto={activeProduct}
                    opcionais={opcionaisLista}
                    onClose={() => setActiveProduct(null)}
                    onConfirm={adicionarAoCarrinho}
                />
            )}

            {!carrinho && (
                <BotaoCarrinho carr={car}/>
            )}

            {carrinho && (
                <Carrinho 
                    carr={nocar} 
                    itens={itensCarrinho} 
                    setItens={setItensCarrinho}
                    opcionaisData={opcionaisLista}
                />
            )}

            {/* Rodapé */}
            <footer className='w-full max-w-[480px] py-8 flex flex-col items-center justify-end bg-white gap-2'>
                <hr className='w-16 border-t border-[#C5A059]/20'></hr>
                <div className='text-xs text-[#C5A059]/80 font-light'>
                    by <a className='hover:underline font-normal text-[#C5A059]' target='_blank' rel='noopener noreferrer' href='https://asnamanga.vercel.app/'> As </a>
                </div>
            </footer>
        </div>
    )
}
