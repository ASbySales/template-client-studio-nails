import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import JKStudioNailsOnlyLogo from '../assets/JKStudioNailsOnlyLogo.png'

export default function Carrinho({ carr, itens, setItens, opcionaisData }) {
    const [mostrarFormulario, setMostrarFormulario] = useState(false)
    const [nome, setNome] = useState('')
    const [whatsapp, setWhatsapp] = useState('')
    const [honeypot, setHoneypot] = useState('')
    const [enviando, setEnviando] = useState(false)
    const [erroEnvio, setErroEnvio] = useState('')

    // Carrega dados salvos do localStorage na inicialização
    useEffect(() => {
        const nomeSalvo = localStorage.getItem('cliente_nome') || ''
        const whatsappSalvo = localStorage.getItem('cliente_whatsapp') || ''
        setNome(nomeSalvo)
        setWhatsapp(whatsappSalvo)
    }, [])

    // Função de cálculo de preço individual de cada serviço contratado
    const calcularPrecoItem = (item) => {
        let valorBase = parseFloat(item.produto.valor.replace(',', '.'));
        let total = valorBase;
        
        Object.entries(item.opcionais).forEach(([idStr, qtd]) => {
            const id = parseInt(idStr);
            const opc = opcionaisData.find(o => o.id === id);
            if (opc && qtd > 0) {
                let valorOpc = parseFloat(opc.valor.replace(',', '.'));
                if (opc.tipo === 'substitutivo') {
                    // Lógica Substitutiva: Unha decorada substitui unha simples (Serviço Base / 10)
                    let valorUnidadeSimples = valorBase / 10;
                    total += qtd * (valorOpc - valorUnidadeSimples);
                } else {
                    // Lógica Extra: O valor do opcional é somado de forma bruta
                    total += qtd * valorOpc;
                }
            }
        });
        return total;
    };

    // Calcula o valor total de todas as escolhas do carrinho
    const calcularTotalGeral = () => {
        return itens.reduce((soma, item) => soma + calcularPrecoItem(item), 0);
    };

    // Remove um serviço completo do carrinho
    const removerItem = (idEscolha) => {
        setItens(prev => prev.filter(item => item.idEscolha !== idEscolha));
    };

    // Altera a quantidade de um opcional dentro de um serviço no carrinho
    const alterarQtdOpcional = (idEscolha, idOpcional, direcao) => {
        setItens(prev => prev.map(item => {
            if (item.idEscolha !== idEscolha) return item;
            
            const novosOpcionais = { ...item.opcionais };
            const qtdAtual = novosOpcionais[idOpcional] || 0;
            const opc = opcionaisData.find(o => o.id === idOpcional);
            
            if (!opc) return item;
            
            if (direcao === 'mais') {
                if (opc.tipo === 'substitutivo') {
                    // Limite máximo de 10 unidades substituídas no mesmo serviço base
                    const totalSubstitutivos = Object.entries(novosOpcionais)
                        .reduce((soma, [idStr, qtd]) => {
                            const op = opcionaisData.find(o => o.id === parseInt(idStr));
                            return op && op.tipo === 'substitutivo' ? soma + qtd : soma;
                        }, 0);
                    
                    if (totalSubstitutivos >= 10) return item;
                }
                novosOpcionais[idOpcional] = qtdAtual + 1;
            } else if (direcao === 'menos') {
                const novaQtd = Math.max(0, qtdAtual - 1);
                if (novaQtd === 0) {
                    delete novosOpcionais[idOpcional];
                } else {
                    novosOpcionais[idOpcional] = novaQtd;
                }
            }
            
            return {
                ...item,
                opcionais: novosOpcionais
            };
        }));
    };

    // Aplica formatação automática no input do WhatsApp (83) 9 9999-9999
    const handleWhatsappChange = (e) => {
        let value = e.target.value.replace(/\D/g, '')
        if (value.length > 11) value = value.slice(0, 11)

        let formatted = ''
        if (value.length > 0) {
            formatted += `(${value.slice(0, 2)}`
        }
        if (value.length > 2) {
            formatted += `) ${value.slice(2, 3)}`
        }
        if (value.length > 3) {
            formatted += ` ${value.slice(3, 7)}`
        }
        if (value.length > 7) {
            formatted += `-${value.slice(7, 11)}`
        }
        setWhatsapp(formatted)
    }

    // Processa o agendamento enviando os dados para o Supabase
    const handleConfirmarAgendamento = async (e) => {
        e.preventDefault()
        setErroEnvio('')

        // 1. Honeypot check (Segurança contra Bots)
        if (honeypot !== '') {
            alert("Agendamento enviado para aprovação! Aguarde retorno.")
            setItens([])
            carr()
            return
        }

        // 2. Validações de Campos
        if (!nome.trim()) {
            setErroEnvio('Por favor, informe seu nome.')
            return
        }

        const numerosApenas = whatsapp.replace(/\D/g, '')
        if (numerosApenas.length < 11) {
            setErroEnvio('Por favor, insira seu WhatsApp completo com DDD.')
            return
        }

        // Bloqueio de números repetidos fakes (ex: 11111-1111)
        const todosIguais = /^(.)\1+$/.test(numerosApenas.slice(2))
        if (todosIguais || numerosApenas.slice(2) === '123456789') {
            setErroEnvio('Por favor, informe um número de celular válido.')
            return
        }

        // 3. Rate Limit check
        const ultimoEnvio = localStorage.getItem('ultimo_envio')
        const agora = Date.now()
        if (ultimoEnvio && agora - parseInt(ultimoEnvio) < 3 * 60 * 1000) {
            setErroEnvio('Você já enviou uma solicitação recente. Aguarde alguns minutos ou o retorno no WhatsApp.')
            return
        }

        setEnviando(true)

        try {
            const { data: solicitacao, error: errorSol } = await supabase
                .from('solicitacoes_agendamento')
                .insert({
                    nome_cliente: nome.trim(),
                    whatsapp_cliente: whatsapp,
                    status: 'pendente',
                    valor_total: calcularTotalGeral()
                })
                .select()
                .single();

            if (errorSol) throw errorSol;

            for (const item of itens) {
                const { data: itemPrincipal, error: errorItem } = await supabase
                    .from('itens_agendamento')
                    .insert({
                        solicitacao_id: solicitacao.id,
                        servico_id: item.produto.id,
                        parent_item_id: null,
                        quantidade: 1
                    })
                    .select()
                    .single();

                if (errorItem) throw errorItem;

                const opcionaisParaInserir = Object.entries(item.opcionais).map(([opcId, qtd]) => ({
                    solicitacao_id: solicitacao.id,
                    servico_id: parseInt(opcId),
                    parent_item_id: itemPrincipal.id,
                    quantidade: qtd
                }));

                if (opcionaisParaInserir.length > 0) {
                    const { error: errorOpc } = await supabase
                        .from('itens_agendamento')
                        .insert(opcionaisParaInserir);
                    
                    if (errorOpc) throw errorOpc;
                }
            }

            localStorage.setItem('cliente_nome', nome.trim())
            localStorage.setItem('cliente_whatsapp', whatsapp)
            localStorage.setItem('ultimo_envio', Date.now().toString())

            const historico = JSON.parse(localStorage.getItem('historico_agendamentos') || '[]')
            historico.push({
                id: solicitacao.id,
                codigo: solicitacao.codigo_pedido,
                data: new Date().toISOString(),
                valor: calcularTotalGeral(),
                itens: itens.map(i => ({ nome: i.produto.nome, opcionais: i.opcionais }))
            })
            localStorage.setItem('historico_agendamentos', JSON.stringify(historico))

            setItens([])
            carr()

            const codFormatado = String(solicitacao.codigo_pedido).padStart(2, '0');
            const mensagemWhatsApp = encodeURIComponent(`Olá! Solicitei um agendamento de número #0${codFormatado}`);
            window.open(`https://wa.me/5583982301526?text=${mensagemWhatsApp}`, '_blank');

        } catch (error) {
            console.error('Erro ao enviar agendamento para o Supabase:', error)
            setErroEnvio('Ocorreu um erro ao processar o seu agendamento no servidor. Tente novamente.')
        } finally {
            setEnviando(false)
        }
    }

    return (
        <section className='fixed inset-0 z-50 flex justify-center items-center bg-black/40 backdrop-blur-xs px-4'>
            <div className='w-full max-w-[420px] max-h-[85vh] rounded-3xl flex flex-col bg-white ring-1 ring-[#D9A09E]/50 shadow-2xl p-4 overflow-hidden relative'>
                
                {enviando && (
                    <div className='absolute inset-0 z-55 flex flex-col items-center justify-center bg-white/95 gap-3'>
                        <div className='w-10 h-10 border-4 border-[#C08A89]/20 border-t-[#C08A89] rounded-full animate-spin'></div>
                        <p className='text-sm text-gray-500 font-semibold font-cinzel'>Enviando agendamento...</p>
                    </div>
                )}

                <div className='w-full flex justify-between items-center pb-2 border-b border-gray-100'>
                    <button 
                        onClick={mostrarFormulario ? () => setMostrarFormulario(false) : carr}
                        className='h-8 w-8 hover:scale-110 active:scale-100 flex justify-center items-center pb-0.5 rounded-full bg-[#D9A09E]/20 text-[#C08A89] transition-all cursor-pointer'
                    >
                        {mostrarFormulario ? '❮' : '✕'}
                    </button>
                    <h2 className='text-lg font-cinzel font-bold text-gray-800 tracking-wide'>
                        {mostrarFormulario ? 'Identificação' : 'Seu Carrinho'}
                    </h2>
                    <div className='w-8 h-8'></div>
                </div>

                {!mostrarFormulario ? (
                    <>
                        <div className='flex-1 overflow-y-auto no-scrollbar py-3 flex flex-col gap-4'>
                            {itens.length === 0 ? (
                                <div className='flex flex-col items-center justify-center py-10 gap-3'>
                                    <img src={JKStudioNailsOnlyLogo} className='w-16 h-16 opacity-30' />
                                    <p className='text-sm text-gray-400 font-semibold'>Seu carrinho está vazio</p>
                                </div>
                            ) : (
                                itens.map((item) => (
                                    <div key={item.idEscolha} className='bg-gray-50 rounded-2xl p-3 border border-gray-100 flex flex-col gap-2 relative shadow-sm'>
                                        <button 
                                            onClick={() => removerItem(item.idEscolha)}
                                            className='absolute top-2 right-2 text-xs font-semibold text-red-400 hover:text-red-600 transition-colors cursor-pointer'
                                        >
                                            Excluir
                                        </button>

                                        <div className='flex items-center gap-3'>
                                            <img src={item.produto.img || JKStudioNailsOnlyLogo} className='w-12 h-12 bg-white rounded-xl shadow-sm object-cover' />
                                            <div className='flex flex-col text-left'>
                                                <span className='text-sm font-bold text-gray-800'>{item.produto.nome}</span>
                                                <span className='text-[10px] text-gray-400'>{item.produto.descricao}</span>
                                                <span className='text-xs font-bold text-[#C08A89] mt-0.5'>R$ {item.produto.valor}</span>
                                            </div>
                                        </div>

                                        {Object.keys(item.opcionais).length > 0 && (
                                            <div className='mt-2 pt-2 border-t border-gray-200/60 flex flex-col gap-1.5'>
                                                <span className='text-[10px] text-gray-400 font-bold uppercase tracking-wider text-left'>Opcionais Escolhidos</span>
                                                {Object.entries(item.opcionais).map(([idStr, qtd]) => {
                                                    const id = parseInt(idStr);
                                                    const opc = opcionaisData.find(o => o.id === id);
                                                    if (!opc) return null;

                                                    return (
                                                        <div key={id} className='flex justify-between items-center bg-white rounded-xl px-2 py-1.5 border border-gray-100'>
                                                            <div className='flex flex-col text-left'>
                                                                <span className='text-xs text-gray-700 font-bold'>{opc.nome}</span>
                                                                <span className='text-[10px] text-gray-400'>
                                                                    R$ {opc.valor}
                                                                </span>
                                                            </div>
                                                            <div className='flex items-center gap-2'>
                                                                <button 
                                                                    onClick={() => alterarQtdOpcional(item.idEscolha, opc.id, 'menos')}
                                                                    className='h-5 w-5 bg-gray-200 rounded-full flex justify-center items-center font-bold text-xs cursor-pointer hover:bg-gray-300'
                                                                >
                                                                    -
                                                                </button>
                                                                <span className='font-bold text-xs'>{qtd}</span>
                                                                <button 
                                                                    onClick={() => alterarQtdOpcional(item.idEscolha, opc.id, 'mais')}
                                                                    className='h-5 w-5 bg-gray-200 rounded-full flex justify-center items-center font-bold text-xs cursor-pointer hover:bg-gray-300'
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        <div className='mt-1 pt-1.5 flex justify-end text-xs font-bold text-gray-700'>
                                            <span>Subtotal: R$ {calcularPrecoItem(item).toFixed(2).replace('.', ',')}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {itens.length > 0 && (
                            <div className='pt-3 border-t border-gray-100 flex flex-col gap-3'>
                                <div className='flex justify-between items-center text-sm font-bold text-gray-800 px-1'>
                                    <span>Total Geral:</span>
                                    <span className='text-lg text-[#C08A89]'>R$ {calcularTotalGeral().toFixed(2).replace('.', ',')}</span>
                                </div>
                                <button 
                                    onClick={() => setMostrarFormulario(true)}
                                    className='w-full py-2.5 bg-[#C08A89] text-white font-bold text-sm rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer'
                                >
                                    Solicitar Agendamento
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <form onSubmit={handleConfirmarAgendamento} className='flex-1 flex flex-col justify-between py-4 gap-4'>
                        <div className='flex flex-col gap-4 text-left'>
                            <p className='text-xs text-gray-500 font-medium'>Informe seus dados para contato e para salvarmos o agendamento no histórico do seu navegador.</p>
                            
                            <div className='flex flex-col gap-1'>
                                <label className='text-xs font-bold text-gray-700'>Seu Nome</label>
                                <input 
                                    type='text' 
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    placeholder='Digite seu nome completo'
                                    className='w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#C08A89]'
                                    required
                                />
                            </div>

                            <div className='flex flex-col gap-1'>
                                <label className='text-xs font-bold text-gray-700'>WhatsApp</label>
                                <input 
                                    type='tel' 
                                    value={whatsapp}
                                    onChange={handleWhatsappChange}
                                    placeholder='(83) 9 9999-9999'
                                    className='w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#C08A89]'
                                    required
                                />
                            </div>

                            <input 
                                type='text'
                                value={honeypot}
                                onChange={(e) => setHoneypot(e.target.value)}
                                className='absolute opacity-0 pointer-events-none w-0 h-0'
                                tabIndex='-1'
                                autoComplete='off'
                            />

                            {erroEnvio && (
                                <p className='text-xs font-bold text-red-500 bg-red-50 p-2 rounded-lg border border-red-100 mt-1'>
                                    ⚠️ {erroEnvio}
                                </p>
                            )}
                        </div>

                        <div className='flex flex-col gap-2'>
                            <div className='flex justify-between items-center text-sm font-bold text-gray-800 px-1 border-t border-gray-100 pt-2'>
                                <span>Valor Final:</span>
                                <span className='text-lg text-[#C08A89]'>R$ {calcularTotalGeral().toFixed(2).replace('.', ',')}</span>
                            </div>
                            <button 
                                type='submit'
                                className='w-full py-2.5 bg-[#C08A89] text-white font-bold text-sm rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer'
                            >
                                Confirmar e Agendar
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </section>
    )
}
