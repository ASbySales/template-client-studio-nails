import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import hero from '../assets/hero.png'
import heroImg from '../assets/image.png'
import JKStudioNailsOnlyLogo from '../assets/JKStudioNailsOnlyLogo.png'
import ListaCards from '../componentes/ListaCards'
import BotaoCarrinho from './botaoCarrinho'
import Carrinho from './Carrinho'
import ModalServico from '../componentes/ModalServico'

export default function Catalogo() {
    const navigate = useNavigate()
    const [activeProduct, setActiveProduct] = useState(null)
    const [itensCarrinho, setItensCarrinho] = useState([])
    const [categorias, setCategorias] = useState([])
    const [loading, setLoading] = useState(true)

    const [botao, setBotao] = useState(true)
    const [carrinho, setCarrinho] = useState(null)

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

                // Formata o valor dos serviços de numeric (ex: 120.00) para string com vírgula (ex: 120,00)
                // para manter total compatibilidade com os componentes filhos existentes.
                const categoriasFormatadas = (data || []).map(cat => ({
                    ...cat,
                    servicos: (cat.servicos || []).map(serv => ({
                        ...serv,
                        valor: parseFloat(serv.valor).toFixed(2).replace('.', ',')
                    }))
                }))

                setCategorias(categoriasFormatadas)
            } catch (error) {
                console.error('Erro ao carregar catálogo do Supabase:', error)
            } finally {
                setLoading(false)
            }
        }

        carregarCatalogo()
    }, [])

    let i = 0

    const adicionarAoCarrinho = (opcionaisSelecionados) => {
        const opcionaisFiltrados = {};
        Object.entries(opcionaisSelecionados).forEach(([id, qtd]) => {
            if (qtd > 0) {
                opcionaisFiltrados[id] = qtd;
            }
        });

        const novoItem = {
            idEscolha: Date.now(),
            produto: activeProduct,
            opcionais: opcionaisFiltrados
        };

        setItensCarrinho(prev => [...prev, novoItem]);
    };


    const [quant, setQuant] = useState({})

    const car = () => setCarrinho(true)
    const nocar = () => setCarrinho(false)

    // Congela a tela de fundo (body) ao abrir o modal, destravando ao fechar
    useEffect(() => {
        if (activeProduct) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [activeProduct]);


    if (loading) {
        return (
            <div className='w-full min-h-screen flex flex-col items-center justify-center bg-white gap-3'>
                <div className='w-10 h-10 border-4 border-[#C08A89]/20 border-t-[#C08A89] rounded-full animate-spin'></div>
                <p className='text-sm text-gray-400 font-semibold font-cinzel'>Carregando serviços...</p>
            </div>
        )
    }

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
                
                {/* Imagem de Capa Recortada com Gradiente Rose Gold chique */}
                <div className='h-[120px] w-full relative bg-gradient-to-tr from-[#E6C2C1]/70 via-[#D9A09E] to-[#E6C2C1]/90' 
                style={{ clipPath: 'url(#minimal-01-mask)' }} />
                
                {/* Botão Voltar Flutuante */}
                <button 
                    onClick={() => navigate('/')} 
                    className='fixed top-4 left-4 z-10 bg-white/80 hover:bg-white text-[#D9A09E] border border-[#C08A89]/30 rounded-full px-4 py-1.5 shadow-sm text-xs font-semibold font-cinzel transition-all hover:scale-105 active:scale-95 cursor-pointer'
                >
                    ❮ Voltar
                </button>

                {/* Foto do Perfil */}
                <div className='absolute top-10 left-1/2 -translate-x-1/2 w-[130px] h-[130px] rounded-full border-b-4 border-[#D9A09E]  bg-white shadow-md overflow-hidden'>
                    <img className='w-full h-full object-cover' src={JKStudioNailsOnlyLogo} alt="logo Joyce Kayane Studio Nails" />
                </div>
                
                <a className='mt-[70px] text-3xl text-[#C08A89] font-cinzel font text-center select-none tracking-wide p-2 transition-all'>
                    JOYCE KAYANE
                    <a className='text-sm block font-sans font-normal'>
                        STUDIO NAILS</a>
                </a>
            </header>

            {/* Seção Principal: Lista/Carrossel de Serviços */}
            <main className='w-full max-w-[480px] flex flex-col items-center bg-white px-4 gap-6'>
                <div className='border-t-1 border-[#FF8C00] w-60'></div>
                
                {categorias.filter(cat => cat.escolha).map((cat) => (
                    <div key={cat.id} className='w-full flex flex-col bg-white pb-2 my-2 ring-1 ring-[#D9A09E]/70 rounded-xl overflow-hidden shadow-sm'>
                        <a className='text-3xl text-white bg-[#D9A09E] font-cinzel font-normal text-center select-none tracking-wide p-2 border-b border-[#D9A09E]'>
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
                    opcionais={categorias.find(cat => !cat.escolha)?.servicos || []}
                    onClose={() => setActiveProduct(null)}
                    onConfirm={adicionarAoCarrinho}
                />
            )}

            {itensCarrinho.length > 0 && !carrinho && botao &&
                <BotaoCarrinho carr={car}/>
            }
            {carrinho &&
                <Carrinho 
                    carr={nocar} 
                    itens={itensCarrinho} 
                    setItens={setItensCarrinho}
                    opcionaisData={categorias.find(cat => !cat.escolha)?.servicos || []}
                />
            }


            {/* Rodapé */}
            <footer className='w-full max-w-[480px] py-8 flex flex-col items-center justify-end bg-white gap-2'>
                <hr className='w-16 border-t border-[#C08A89]/20'></hr>
                <div className='text-xs text-[#C08A89]/70 font-light'>
                    by <a className='hover:underline font-normal' target='_blank' rel='noopener noreferrer' href='https://asnamanga.vercel.app/'> As </a>
                </div>
            </footer>
        </div>
)}
