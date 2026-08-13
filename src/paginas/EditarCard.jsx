import { useNavigate, useParams } from 'react-router-dom'

export default function EditarCard() {
    const { id } = useParams()
    const navigate = useNavigate()

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white p-6">
            <h1 className="text-xl font-bold text-slate-800">Editar Serviço #{id}</h1>
            <p className="text-sm text-slate-500 mt-2">Formulário de edição do serviço.</p>
            <button 
                onClick={() => navigate(-1)} 
                className="mt-4 bg-[#D9A09E] text-white px-4 py-2 rounded-full text-xs font-bold cursor-pointer"
            >
                Voltar
            </button>
        </div>
    )
}
