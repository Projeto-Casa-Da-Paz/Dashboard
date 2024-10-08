import { useNavigate } from "react-router-dom"
import { LayoutDashboard } from "../../components/LayoutDashboard"
import { useEffect, useState } from "react"
import { verificaTokenExpirado } from "../../services/token"
import { Loading } from "../../components/Loading"
import axios from "axios"

interface IUsers {
    id: number
    nome: string
    email: string
    permissoes: string
}

export default function Usuarios() {

    const navigate = useNavigate() //
    const [loading, setLoading] = useState(false) //estado
    const [dadosUsers, setdadosUsers] = useState<Array<IUsers>>([]) //estado

    // Inicio, Update State, Destruir
    useEffect(() => {

        if (localStorage.length == 0 || verificaTokenExpirado()) {
            navigate("/")
        }

        setLoading(true)

        axios.get(import.meta.env.VITE_URL + '/users')
            .then((res) => {
                setdadosUsers(res.data)
                setLoading(false)
            })
            .catch((err) => {
                setLoading(false)
                setdadosUsers(err)
            })
    }, [])

    return (
        <>
            <Loading visible={loading} />
            <LayoutDashboard>
            <div
                    className="d-flex justify-content-between mt-3"
                >
                    <h1 className="h2">Usuários</h1>
                    <button
                        type="button"
                        className="btn btn-success"
                        onClick={() => {navigate('/usuarios/criar/')}}
                    >
                        Adicionar
                    </button>
                </div>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Nome</th>
                            <th scope="col">Email</th>
                            <th scope="col">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            dadosUsers.map((
                                usuario, index
                            ) => {
                                return (
                                    < tr key={index}>
                                        <th scope="row">{usuario.id}</th>
                                        <td>{usuario.nome}</td>
                                        <td>{usuario.email}</td>
                                        <td>
                                            <button
                                                className="btn btn-warning"
                                                type="submit"
                                                style={{
                                                    marginRight: 5
                                                }}
                                                onClick={() => {navigate(`/usuarios/${usuario.id}`)}}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className="btn btn-danger"
                                                type="submit"
                                                style={{
                                                    marginRight: 5
                                                }}
                                            >
                                                Excluir
                                            </button>
                                        </td>
                                    </tr>

                                )
                            })
                        }
                    </tbody>
                </table>
            </LayoutDashboard>
        </>
    )
}