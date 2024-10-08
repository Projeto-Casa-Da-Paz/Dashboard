import { SyntheticEvent, useCallback, useRef, useState } from 'react'
import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import axios from 'axios'
import styles from './styles.module.css'
import { Loading } from '../../components/Loading'
import { useNavigate } from 'react-router-dom'
import { SnackbarMui } from '../../components/Snackbar'

export default function Login() {

    // Hooks
    const navigate = useNavigate();

    const refForm = useRef<any>();

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');

    const handleShowSnackbar = (msg: string, sev: 'success' | 'error' | 'info' | 'warning') => {
        setMessage(msg);
        setSeverity(sev);
        setSnackbarVisible(true);
    };
    const [loading, setLoading] = useState(false)
    

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
                handleShowSnackbar("Login efetuado com sucesso !", 'success')
                setTimeout(() => { navigate('/dashboard') }, 1500)

            }).catch((erro) => {
                setLoading(false)
                handleShowSnackbar("Login ou senha inválidos !", 'error')
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
             <SnackbarMui
                open={snackbarVisible}
                message={message}
                severity={severity}
                onClose={() => setSnackbarVisible(false)}
                position={{
                    vertical: 'top',
                    horizontal: 'center'
                  }}
            />
            <Container fluid className={styles['login-container']}>
                <Row className="w-100 justify-content-center">
                    {/* Coluna da Imagem */}
                    <Col xs={12} md={9} className={styles['login-image']}>
                        {/* A imagem vai ocupar toda a área à esquerda */}
                    </Col>
                    {/* Coluna do Formulário */}
                    <Col xs={12} md={3} className={`${styles['login-form']} d-flex align-items-center justify-content-center`}>
                        <div className={styles['form-wrapper']}>
                            <h1 style={{textAlign: 'center'}}>Login</h1>
                            <Form
                                className='needs-validation align-items-center' noValidate
                                onSubmit={submitForm}
                                ref={refForm}
                            >
                                <Form.Group controlId="email" className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control type="email" id='email' required placeholder="Digite seu email" />
                                    <div className='invalid-feedback'>
                                        Por favor digite seu email
                                    </div>
                                </Form.Group>

                                <Form.Group controlId="senha" className="mb-3">
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