import { useNavigate } from "react-router-dom"
import { LayoutDashboard } from "../../components/LayoutDashboard"
import { useEffect, useState } from "react"
import { verificaTokenExpirado } from "../../services/token"
import { Loading } from "../../components/Loading"
import axios from "axios"

interface IPremios {
    id: number
    nome: string
    categoria: string
    data_recebimento: string
    imagem: string
}

export default function Premios() {

    const navigate = useNavigate()
    const [loading, setLoading] = useState(false) //estado
    const [dadosPremios, setdadosPremios] = useState<Array<IPremios>>([]) //estado
    let premio: any;

    // Inicio, Update State, Destruir
    useEffect(() => {

        if (localStorage.length == 0 || verificaTokenExpirado()) {
            navigate("/")
        }

        setLoading(true)

        axios.get(import.meta.env.VITE_URL + '/premios')
            .then((res) => {
                setdadosPremios(res.data)
                setLoading(false)
                console.log(res.data)
            })
            .catch((err) => {
                setdadosPremios(err)
                setLoading(false)
            })
        
    }, [])
    return (
        <>
            <Loading visible={loading} />
            <LayoutDashboard>
                <div
                    className="d-flex justify-content-between mt-3"
                >
                    <h1 className="h2">Prêmios</h1>
                    <button className="btn btn-success"
                        onClick={() => {
                            navigate('/premios/add')
                        }}
                    >
                        Add
                    </button>
                </div>

                <table className="table table-striped table-hover">
                    <thead>
                        <tr className="text-center">
                            <th scope="col">#</th>
                            <th scope="col">Imagem</th>
                            <th scope="col">Nome</th>
                            <th scope="col">Categoria</th>
                            <th scope="col">Data Recebimento</th>
                            <th scope="col">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="table-group-divider align-middle">
                        {
                            dadosPremios.map((
                                premio,
                                index
                            ) => {
                                return (
                                    <tr key={index} className="text-center">
                                        <th scope="col">{premio.id}</th>
                                        <th scope="col">
                                            <img
                                            className="img-thumbnail"
                                            style={{
                                                width: 100,
                                                height: 100,
                                                borderRadius: "50%"
                                            }}
                                            src={`images/${premio.imagem}`} alt="" />
                                        </th>
                                        <td>{premio.nome}</td>
                                        <td>{premio.categoria}</td>
                                        <td>{new Date(premio.data_recebimento + 'T00:00:00').toLocaleDateString("BR")}</td>
                                        <td>
                                            <button
                                                className="btn btn-warning"
                                                type="submit"
                                                style={{
                                                    marginRight: 5
                                                }}
                                            >
                                                Editar
                                            </button>
                                            <button

                                                className="btn btn-danger"
                                                type="submit"
                                            >
                                                Excluir
                                            </button>
                                        </td>
                                    </tr>

                                )
                            })}
                    </tbody>
                </table>

            </LayoutDashboard>
        </>
    )
}