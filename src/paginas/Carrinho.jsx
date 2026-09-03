import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import JKStudioNailsOnlyLogo from '../assets/JKStudioNailsOnlyLogo.png'

export default function Carrinho({ carr, itens, setItens, opcionaisData }) {
    const [mostrarFormulario, setMostrarFormulario] = useState(false)
    const [verHistorico, setVerHistorico] = useState(false)
    const [historico, setHistorico] = useState([])
    const [nome, setNome] = useState('')
    const [whatsapp, setWhatsapp] = useState('')
    const [honeypot, setHoneypot] = useState('')
    const [enviando, setEnviando] = useState(false)
    const [erroEnvio, setErroEnvio] = useState('')

    // Carrega dados salvos e histórico do localStorage na inicialização
    useEffect(() => {
        const nomeSalvo = localStorage.getItem('cliente_nome') || ''
        const whatsappSalvo = localStorage.getItem('cliente_whatsapp') || ''
        setNome(nomeSalvo)
        setWhatsapp(whatsappSalvo)

        try {
            const histSalvo = JSON.parse(localStorage.getItem('historico_agendamentos') || '[]')
            setHistorico(histSalvo)
        } catch {
            setHistorico([])
        }
    }, [])

    // Função de cálculo de preço individual de cada serviço contratado
    const calcularPrecoItem = (item) => {
        let valorBase = parseFloat(item.produto.valor.replace(',', '.'));
        let qtdPrincipal = item.quantidade || 1;
        let total = valorBase * qtdPrincipal;
        
        Object.entries(item.opcionais || {}).forEach(([idStr, qtd]) => {
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

    // Altera a quantidade de um serviço unitário principal no carrinho
    const alterarQtdPrincipal = (idEscolha, direcao) => {
        setItens(prev => prev.map(item => {
            if (item.idEscolha !== idEscolha) return item;
            const qtdAtual = item.quantidade || 1;
            const novaQtd = direcao === 'mais' ? qtdAtual + 1 : Math.max(1, qtdAtual - 1);
            return {
                ...item,
                quantidade: novaQtd
            };
        }));
    };

    // Altera a quantidade de um opcional dentro de um serviço no carrinho
    const alterarQtdOpcional = (idEscolha, idOpcional, direcao) => {
        setItens(prev => prev.map(item => {
            if (item.idEscolha !== idEscolha) return item;

            const qtdAtual = item.opcionais[idOpcional] || 0;
            const novaQtd = direcao === 'mais' ? qtdAtual + 1 : Math.max(0, qtdAtual - 1);

            const novosOpcionais = { ...item.opcionais };
            if (novaQtd > 0) {
                novosOpcionais[idOpcional] = novaQtd;
            } else {
                delete novosOpcionais[idOpcional];
            }

            return {
                ...item,
                opcionais: novosOpcionais
            };
        }));
    };

    // Reaproveita um agendamento anterior do histórico carregando-o de volta para o carrinho
    const reaproveitarAgendamento = (agendamentoAnterior) => {
        if (!agendamentoAnterior.itensCompletos || agendamentoAnterior.itensCompletos.length === 0) return;

        const itensClonados = agendamentoAnterior.itensCompletos.map((it, idx) => ({
            ...it,
            idEscolha: Date.now() + idx
        }));

        setItens(itensClonados);
        setVerHistorico(false);
    };

    // Máscara dinâmica de telefone brasileiro (DDD + 9 dígitos)
    const handleWhatsappChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);

        if (value.length > 6) {
            value = `(${value.slice(0, 2)}) ${value.slice(2, 3)} ${value.slice(3, 7)}-${value.slice(7)}`;
        } else if (value.length > 2) {
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        } else if (value.length > 0) {
            value = `(${value}`;
        }
        setWhatsapp(value);
    };

    // Confirmação e gravação do agendamento
    const handleConfirmarAgendamento = async (e) => {
        e.preventDefault();
        setErroEnvio('');

        // 1. Defesa Anti-Bot (Honeypot)
        if (honeypot) {
            console.warn('Bot detectado via honeypot.');
            return;
        }

        // 2. Validações do formulário
        if (!nome.trim()) {
            setErroEnvio('Por favor, informe seu nome completo.');
            return;
        }

        const apenasNumeros = whatsapp.replace(/\D/g, '');
        if (apenasNumeros.length < 10 || apenasNumeros.length > 11) {
            setErroEnvio('Informe um número de WhatsApp válido com DDD (10 ou 11 dígitos).');
            return;
        }

        // 3. Validação de Carrinho Vazio
        if (itens.length === 0) {
            setErroEnvio('Seu carrinho está vazio.');
            return;
        }

        try {
            setEnviando(true);

            // Inserção da Solicitação Principal no Supabase
            const { data: solicitacao, error: errorSol } = await supabase
                .from('solicitacoes_agendamento')
                .insert([{
                    nome_cliente: nome.trim(),
                    whatsapp_cliente: whatsapp,
                    status: 'pendente'
                }])
                .select()
                .single();

            if (errorSol) throw errorSol;

            // Inserção dos Itens e Opcionais vinculados
            for (const item of itens) {
                const { data: itemPrincipal, error: errorItem } = await supabase
                    .from('itens_agendamento')
                    .insert([{
                        solicitacao_id: solicitacao.id,
                        servico_id: item.produto.id,
                        parent_item_id: null,
                        quantidade: item.quantidade || 1
                    }])
                    .select()
                    .single();

                if (errorItem) throw errorItem;

                const opcionaisParaInserir = Object.entries(item.opcionais || {}).map(([opcId, qtd]) => ({
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

            // Salva dados no cache local
            localStorage.setItem('cliente_nome', nome.trim());
            localStorage.setItem('cliente_whatsapp', whatsapp);
            localStorage.setItem('ultimo_envio', Date.now().toString());

            // Atualiza histórico com itens completos para reaproveitamento
            const novoItemHist = {
                id: solicitacao.id,
                codigo: solicitacao.codigo_pedido,
                data: new Date().toISOString(),
                valor: calcularTotalGeral(),
                itensCompletos: itens
            };
            const historicoAtualizado = [novoItemHist, ...historico.filter(h => h.id !== solicitacao.id)].slice(0, 5);
            setHistorico(historicoAtualizado);
            localStorage.setItem('historico_agendamentos', JSON.stringify(historicoAtualizado));

            // Limpa o carrinho e fecha
            setItens([]);
            try {
                localStorage.removeItem('carrinho_itens');
            } catch (e) {
                console.error(e);
            }
            carr();

            // Redireciona para o WhatsApp oficial com o código do agendamento
            const codFormatado = String(solicitacao.codigo_pedido).padStart(2, '0');
            const mensagemWhatsApp = encodeURIComponent(`Olá! Solicitei um agendamento de número #0${codFormatado}`);
            window.open(`https://wa.me/5583982301526?text=${mensagemWhatsApp}`, '_blank');

        } catch (error) {
            console.error('Erro ao enviar agendamento para o Supabase:', error);
            setErroEnvio('Ocorreu um erro ao processar o seu agendamento no servidor. Tente novamente.');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <section className='fixed inset-0 z-50 flex justify-center items-center bg-black/40 backdrop-blur-xs px-4 overscroll-contain'>
            <div className='w-full max-w-[420px] max-h-[85vh] rounded-3xl flex flex-col bg-white ring-1 ring-[#D9A09E]/50 shadow-2xl p-4 overflow-hidden relative overscroll-contain'>
                
                {enviando && (
                    <div className='absolute inset-0 z-55 flex flex-col items-center justify-center bg-white/95 gap-3'>
                        <div className='w-10 h-10 border-4 border-[#C08A89]/20 border-t-[#C08A89] rounded-full animate-spin'></div>
                        <p className='text-sm text-gray-500 font-semibold font-cinzel'>Enviando agendamento...</p>
                    </div>
                )}

                {/* Cabeçalho do Modal */}
                <div className='w-full flex justify-between items-center pb-2 border-b border-gray-100'>
                    <button 
                        onClick={() => {
                            if (mostrarFormulario) {
                                setMostrarFormulario(false);
                            } else if (verHistorico) {
                                setVerHistorico(false);
                            } else {
                                carr();
                            }
                        }}
                        className='h-8 w-8 hover:scale-110 active:scale-100 flex justify-center items-center pb-0.5 rounded-full bg-[#D9A09E]/20 text-[#C08A89] transition-all cursor-pointer'
                    >
                        {mostrarFormulario || verHistorico ? '❮' : '✕'}
                    </button>
                    <p className='text-lg font-cinzel font-bold text-gray-800 tracking-wide'>
                        {mostrarFormulario ? 'Identificação' : verHistorico ? 'Seu Histórico' : 'Seu Carrinho'}
                    </p>
                    
                    {/* Botão para alternar entre Histórico e Carrinho */}
                    {!mostrarFormulario && historico.length > 0 ? (
                        <button 
                            type="button"
                            onClick={() => setVerHistorico(!verHistorico)}
                            className='text-[10px] font-bold text-[#C08A89] hover:underline cursor-pointer bg-[#D9A09E]/10 rounded-full px-2 py-1'
                            title="Ver histórico de agendamentos"
                        >
                            {verHistorico ? 'Carrinho' : 'Histórico'}
                        </button>
                    ) : (
                        <div className='w-8 h-8'></div>
                    )}
                </div>

                {/* ABA 1: HISTÓRICO DE AGENDAMENTOS */}
                {verHistorico ? (
                    <div className='flex-1 overflow-y-auto overscroll-contain no-scrollbar py-3 flex flex-col gap-3 permitir-scroll text-left'>
                        <p className='text-xs text-gray-500 font-medium px-1'>
                            Reaproveite facilmente serviços agendados anteriormente:
                        </p>
                        
                        {historico.map((hist) => (
                            <div key={hist.id} className='bg-gray-50 rounded-2xl p-3.5 border border-gray-200/70 flex flex-col gap-2.5 shadow-2xs'>
                                <div className='flex justify-between items-center border-b border-gray-200/50 pb-1.5'>
                                    <span className='text-xs font-bold text-gray-800 font-mono'>#0{String(hist.codigo).padStart(2, '0')}</span>
                                    <span className='text-[10px] text-gray-400 font-medium'>
                                        {new Date(hist.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                    </span>
                                </div>

                                <div className='flex flex-col gap-1'>
                                    {(hist.itensCompletos || []).map((item, idx) => (
                                        <div key={idx} className='text-xs text-gray-700 font-medium flex items-center justify-between'>
                                            <span>• {item.produto?.nome} {item.quantidade > 1 ? `(${item.quantidade}x)` : ''}</span>
                                            <span className='text-[11px] font-bold text-[#C08A89]'>R$ {item.produto?.valor}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className='flex justify-between items-center pt-2 border-t border-gray-200/50'>
                                    <span className='text-xs font-bold text-gray-800'>Total: R$ {parseFloat(hist.valor || 0).toFixed(2).replace('.', ',')}</span>
                                    <button 
                                        type="button"
                                        onClick={() => reaproveitarAgendamento(hist)}
                                        className='px-3 py-1.5 bg-[#C08A89] hover:bg-[#b07978] text-white text-xs font-bold rounded-xl shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1'
                                    >
                                        <span>🔄 Repetir Pedido</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : !mostrarFormulario ? (
                    <>
                        {/* ABA 2: LISTA DO CARRINHO ATUAL */}
                        <div className='flex-1 overflow-y-auto overscroll-contain no-scrollbar py-3 flex flex-col gap-4 permitir-scroll'>
                            {itens.length === 0 ? (
                                <div className='flex flex-col items-center justify-center py-6 gap-3'>
                                    <img src={JKStudioNailsOnlyLogo} className='w-16 h-16' />
                                    <p className='text-sm text-gray-400 font-semibold'>Seu carrinho está vazio</p>
                                    
                                    {/* Atalho para repetir último agendamento se houver histórico */}
                                    {historico.length > 0 && (
                                        <div className='mt-2 w-full pt-4 border-t border-gray-100 flex flex-col gap-2'>
                                            <span className='text-xs font-bold text-gray-600'>Deseja repetir seu último agendamento?</span>
                                            <button 
                                                type="button"
                                                onClick={() => reaproveitarAgendamento(historico[0])}
                                                className='w-full py-2 bg-gray-50 hover:bg-gray-100 text-[#C08A89] border border-[#D9A09E]/40 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5'
                                            >
                                                <span>🔄 Repetir Agendamento #0{String(historico[0].codigo).padStart(2, '0')}</span>
                                            </button>
                                        </div>
                                    )}
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
                                                <span className='text-xs font-bold text-[#C08A89] mt-0.5'>
                                                    R$ {item.produto.valor}
                                                    {(item.produto.tipo === 'extra' || item.produto.tipo === 'substitutivo') && (
                                                        <span className='text-[10px] text-gray-400 font-normal ml-1'>/ unid</span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Seletor de Quantidade do Serviço: EXIBIDO APENAS SE FOR UNITÁRIO */}
                                        {(item.produto.tipo === 'extra' || item.produto.tipo === 'substitutivo') && (
                                            <div className='mt-2 pt-2 border-t border-gray-200/60 flex justify-between items-center bg-white rounded-xl px-2.5 py-1.5 border border-gray-100'>
                                                <span className='text-xs text-gray-700 font-bold'>Quantidade:</span>
                                                <div className='flex items-center gap-2'>
                                                    <button 
                                                        type="button"
                                                        onClick={() => alterarQtdPrincipal(item.idEscolha, 'menos')}
                                                        className='h-6 w-6 bg-gray-200 rounded-full flex justify-center items-center font-bold text-xs cursor-pointer hover:bg-gray-300 active:scale-90 transition-all border-none'
                                                    >
                                                        -
                                                    </button>
                                                    <span className='font-bold text-xs w-4 text-center'>{item.quantidade || 1}</span>
                                                    <button 
                                                        type="button"
                                                        onClick={() => alterarQtdPrincipal(item.idEscolha, 'mais')}
                                                        className='h-6 w-6 bg-gray-200 rounded-full flex justify-center items-center font-bold text-xs cursor-pointer hover:bg-gray-300 active:scale-90 transition-all border-none'
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {Object.keys(item.opcionais || {}).length > 0 && (
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
                    /* ABA 3: FORMULÁRIO DE IDENTIFICAÇÃO */
                    <form onSubmit={handleConfirmarAgendamento} className='flex-1 flex flex-col justify-between py-4 gap-4'>
                        <div className='flex flex-col gap-4 text-left'>
                            <p className='text-xs text-gray-500 font-medium'>Informe seus dados para contato e para salvarmos o agendamento no seu histórico.</p>
                            
                            <div className='flex flex-col gap-1'>
                                <label className='text-xs font-bold text-gray-700'>Seu Nome</label>
                                <input 
                                    type='text' 
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    placeholder='Ex: Joyce Silva'
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
