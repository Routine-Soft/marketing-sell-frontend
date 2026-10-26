import SimboloMarca from '@/components/Marca/SimboloMarca'

// Marca do sistema (símbolo sobre o degradê índigo) + nome da empresa logada.
export function Marca({ empresa }) {
    return (
        <div className="marca">
            <span className="marca__selo" aria-hidden="true">
                <SimboloMarca />
            </span>
            <span className="marca__textos">
                <strong>Marketing Sell</strong>
                {empresa && <span title={empresa}>{empresa}</span>}
            </span>
        </div>
    )
}

export default Marca
