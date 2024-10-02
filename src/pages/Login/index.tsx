import { SyntheticEvent, useCallback, useRef, useState } from 'react'
import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import axios from 'axios'
import styles from './styles.module.css'
import { Loading } from '../../components/Loading'
import { Toast } from '../../components/Toast'
import { useNavigate } from 'react-router-dom'
import { IToast } from '../../interfaces/toast'

export default function Login() {

    // Hooks
    const navigate = useNavigate();

    const refForm = useRef<any>();

    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState(false)
    const [objToast, setobjToast] = useState<IToast>({ message: "Erro ! !", colors: "danger" })

    const submitForm = useCallback((event: SyntheticEvent) => {

        event.preventDefault();

        if (refForm.current.checkValidity()) {
            setLoading(true)
            const target = event.target as typeof event.target & {
                email: { value: string },
                senha: { value: string }
            }
            axios.post(import.meta.env.VITE_URL + '/login',
                {
                    email: target.email.value,
                    password: target.senha.value,
                }
            ).then((resposta) => {
                localStorage.setItem(
                    'casadapaz.token',
                    JSON.stringify(resposta.data)
                )
                setToast(true)
                setobjToast(
                    { message: "Login autenticado, você será direcionado !", colors: "success" }
                )
                setTimeout(() => { navigate('/dashboard') }, 1500)

            }).catch((erro) => {
                setLoading(false)
                setToast(true)
                setobjToast(
                    { message: "Dados inválidos, tente novamente !", colors: "danger" }
                )
            })
        } else {
            refForm.current.classList.add('was-validated')
        }

    }, [])

    return (
        <>
            <Loading
                visible={loading}
            />
            <Toast
                show={toast}
                message={objToast.message}
                colors={objToast.colors}
                onClose={() => { setToast(false) }}
            />
            <div></div>
            <Container fluid className={styles.main}>
                <Row>
                    {/* Coluna da Imagem */}
                    <Col xs={12} md={6} className="login-image">
                        {/* A imagem vai ocupar toda a área à esquerda */}
                    </Col>
                    {/* Coluna do Formulário */}
                    <Col xs={12} md={6} className={`${styles.border} d-flex align-items-center justify-content-center`}>
                        <div className="form-wrapper">
                            <h1>Login</h1>
                            <Form
                                className='needs-validation align-items-center' noValidate
                                onSubmit={submitForm}
                                ref={refForm}
                            >
                                <Form.Group controlId="formBasicEmail" className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control type="email" id='email' required placeholder="Digite seu email" />
                                    <div className='invalid-feedback'>
                                        Por favor digite seu email
                                    </div>
                                </Form.Group>

                                <Form.Group controlId="formBasicPassword" className="mb-3">
                                    <Form.Label>Senha</Form.Label>
                                    <Form.Control id='senha' required type="password" placeholder="Digite sua senha" />
                                    <div className='invalid-feedback' >
                                        Por favor digite sua senha
                                    </div>
                                </Form.Group>

                                <Button id='botao' variant="primary" type="submit" className="w-100">
                                    Entrar
                                </Button>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    )
}