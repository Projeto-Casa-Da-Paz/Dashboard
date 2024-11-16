import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { verificaTokenExpirado } from "../../../services/token";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";

// Material UI imports
import {
    Box,
    Button,
    Container,
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { LayoutDashboard } from "../../../components/LayoutDashboard";
import { SnackbarMui } from "../../../components/Snackbar";
import { Loading } from "../../../components/Loading";
import { CustomTextarea } from "../../../components/CustomTextArea";
import { IToken } from "../../../interfaces/token";

interface IGalerias {
    id: number
    nome: string
    local: string
    data: string
}

// Componentes estilizados
const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
}));

const FormTextField = styled(TextField)({
    marginBottom: '1rem',
});


export default function GerenciarGalerias() {
    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<IGalerias>({
        defaultValues: {
            id: 0,
            nome: "",
            local: "",
            data: ""
        }
    });

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
    const [previewUrl, setPreviewUrl] = useState<string>('');

    const handleShowSnackbar = (msg: string, sev: 'success' | 'error' | 'info' | 'warning') => {
        setMessage(msg);
        setSeverity(sev);
        setSnackbarVisible(true);
    };

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const [isEdit, setIsEdit] = useState<boolean>(false);

    const token = JSON.parse(localStorage.getItem('casadapaz.token') || '') as IToken

    useEffect(() => {
        if (localStorage.length === 0 || verificaTokenExpirado()) {
            navigate("/");
            return;
        }

        const galeriaId = Number(id);
        if (!isNaN(galeriaId)) {
            setLoading(true);
            axios.get(import.meta.env.VITE_URL + `/galerias/${galeriaId}`, { headers: { Authorization: `Bearer ${token.access_token}` } })
                .then((res) => {
                    const galeriaData = res.data;
                    setIsEdit(true);
                    setValue("id", galeriaData.id || 0);
                    setValue("nome", galeriaData.nome || '');
                    setValue("local", galeriaData.local || '');
                    setValue("data", galeriaData.data || '');
                    setLoading(false)
                })
                .catch((error) => {
                    console.error('Erro ao buscar galeria:', error);
                    setLoading(false);
                })
        }


    }, [id, navigate, setValue]);

    const submitForm: SubmitHandler<IGalerias> = useCallback((data) => {
        setLoading(true);

        console.log('Dados enviados:', data);
        console.log('URL:', import.meta.env.VITE_URL);
        console.log('isEdit:', isEdit, 'id:', id);

        // Cria um objeto simples com os dados
        const payload = {
            id: data.id,
            nome: data.nome,
            local: data.local,
            data: data.data
        };

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${token.access_token}`
            }
        };

        const request = isEdit
            ? axios.post(`${import.meta.env.VITE_URL}/galerias/${id}`, payload, config)
            : axios.post(`${import.meta.env.VITE_URL}/galerias/`, payload, config);

        request
            .then((response) => {
                console.log('Resposta da API:', response);
                handleShowSnackbar(
                    isEdit
                        ? 'Galeria editado com sucesso!'
                        : 'Galeria adicionada com sucesso!',
                    'success'
                );
                setLoading(false);
                setTimeout(() => {
                    isEdit
                        ? navigate(`/galerias`)
                        : navigate('/galerias', {
                            state: {
                                snackbarMessage: 'Galeria ' + data.nome + ' está sem fotos, clique no botão de "+" para adicionar fotos !',
                                snackbarSeverity: 'warning'
                            }
                        });

                }, 1500);
            })
            .catch((error) => {
                console.error('Erro na requisição:', error.response);
                const errorMessage = error.response?.data || 'Erro ao processar a requisição';
                setLoading(false);
                handleShowSnackbar(errorMessage, 'error');
            });
    }, [isEdit, id, navigate]);


    return (
        <>
            <Loading visible={loading} />
            <LayoutDashboard>
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
                <Container maxWidth="md">
                    <StyledPaper elevation={3}>
                        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
                            {isEdit ? "Editar Galeria" : "Adicionar Galeria"}
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit(submitForm)} noValidate>
                            <Controller
                                name="nome"
                                control={control}
                                rules={{
                                    required: 'Nome é obrigatório!'
                                }}
                                render={({ field }) => (
                                    <FormTextField
                                        {...field}
                                        fullWidth
                                        label="Nome da Galeria"
                                        error={!!errors.nome}
                                        helperText={errors.nome?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="local"
                                control={control}
                                rules={{
                                    required: 'Descrição é obrigatória!'
                                }}
                                render={({ field }) => (
                                    <CustomTextarea
                                        {...field}
                                        minRows={10}
                                        placeholder={"Exemplo:\nFotos tiradas na missão da Casa da Paz."}
                                        aria-label="Descrição"
                                        label="Descrição"
                                        error={!!errors.local}
                                        helperText={errors.local?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="data"
                                control={control}
                                rules={{ required: 'Data é obrigatória!' }}
                                render={({ field }) => (
                                    <FormTextField
                                        {...field}
                                        sx={{ mt: 5 }}
                                        aria-label="Data"
                                        fullWidth
                                        label="Data"
                                        type="date"
                                        error={!!errors.data}
                                        helperText={errors.data?.message}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                )}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                size="large"
                                sx={{ mt: 2 }}
                            >
                                Salvar
                            </Button>
                        </Box>
                    </StyledPaper>
                </Container>
            </LayoutDashboard>
        </>
    );
}