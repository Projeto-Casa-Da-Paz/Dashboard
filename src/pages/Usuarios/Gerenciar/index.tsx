import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { verificaTokenExpirado } from "../../../services/token"
import { LayoutDashboard } from "../../../components/LayoutDashboard"
import { useForm } from "react-hook-form"

interface IForm {
    nome: string
    email: string
    permissao: string
    senha: string
}

export default function GerenciarUsuarios() {

    const {
        register,
        handleSubmit,
        formState: { errors }

    } = useForm<IForm>()
    
    const navigate = useNavigate()

    // Inicio, Update State, Destruir
    useEffect(() => {

        if (localStorage.length == 0 || verificaTokenExpirado()) {
            navigate("/")
        }
    
    }, [])


    return (
        <>
            <LayoutDashboard>
                <h2>Usuários</h2>

                <form
                    className="row g-3 needs-validation mb-3"
                    noValidate
                    style={{
                        alignItems: 'center'
                    }}
                >
                    <div className="col-md-12" >
                        <label
                            htmlFor="nome"
                            className="form-label"
                        >
                            Nome
                        </label>

                        <input
                            type="text"
                            className="form-control"
                            placeholder="DeadPool é o Jesus Da Marvel"
                            id="nome"
                            required
                            {...register('nome', {
                                required: 'Campo nome é Obrigatório'
                            })}
                        />
                        <div className="invalid-feedback">

                            {errors.nome && errors.nome.message}

                        </div>
                    </div>

                    <div className="col-md-12">
                        <button
                            type="submit"
                            className="btn btn-success"
                        >
                            Salvar
                        </button>
                    </div>
                </form>
            </LayoutDashboard>
        </>
    )
}