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
import DropZone from "../../../components/Dropzone";
import { Loading } from "../../../components/Loading";
import { IToken } from "../../../interfaces/token";

// Define a interface do formulário
interface IColaboradores {
    id: number
    nome: string
    profissao: string
    classificacao: string
    foto: File | null
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


export default function GerenciarColaboradores() {
    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<IColaboradores>({
        defaultValues: {
            id: 0,
            nome: '',
            profissao: '',
            classificacao: '',
            foto: null
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
    const imagemField = watch("foto");

    const token = JSON.parse(localStorage.getItem('casadapaz.token') || '') as IToken


    useEffect(() => {
        if (localStorage.length === 0 || verificaTokenExpirado()) {
            navigate("/");
            return;
        }

        const parceiroId = Number(id);
        if (!isNaN(parceiroId)) {
            setLoading(true);
            axios.get(import.meta.env.VITE_URL + `/colaboradores/${parceiroId}`, {headers: {"Authorization": 'Bearer' + token?.access_token}})
                .then((res) => {
                    const colaboradorData = res.data;
                    setIsEdit(true);
                    setValue("id", colaboradorData.id || 0);
                    setValue("nome", colaboradorData.nome || '');
                    setValue("profissao", colaboradorData.profissao || '');
                    setValue("classificacao", colaboradorData.classificacao || '');
                    if (colaboradorData.foto) {
                        setPreviewUrl(import.meta.env.VITE_URL + `/imagem/${colaboradorData.foto}`);
                    }
                    setLoading(false)
                })
                .catch((err) => {
                    console.error(err)
                    setLoading(false)
                })
        }

        if (imagemField && imagemField instanceof File) {
            const fileReader = new FileReader();
            fileReader.onloadend = () => {
                setPreviewUrl(fileReader.result as string);
            };
            fileReader.readAsDataURL(imagemField);
        }

    }, [id, navigate, setValue, imagemField]);



    const handleFileChange = useCallback((file: File | null) => {
        if (file && file.type.startsWith('image/')) {
            setValue("foto", file);
        } else {
            handleShowSnackbar('Por favor, selecione um arquivo de imagem válido.', 'error');
        }
    }, [handleShowSnackbar, setValue]);

    const handleDeleteImage = useCallback(() => {
        setValue("foto", null);
        setPreviewUrl('');
    }, [setValue]);

    const submitForm: SubmitHandler<IColaboradores> = useCallback((data) => {
        setLoading(true);

        console.log('Dados enviados:', data);
        console.log('URL:', import.meta.env.VITE_URL);
        console.log('isEdit:', isEdit, 'id:', id);

        // Cria um objeto simples com os dados
        const payload = {
            id: data.id,
            nome: data.nome,
            profissao: data.profissao,
            classificacao: data.classificacao,
            foto: data.foto || '',
        };

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token.access_token}`
            }
        };

        const request = isEdit
            ? axios.put(`${import.meta.env.VITE_URL}/colaboradores/${id}`, payload, config)
            : axios.post(`${import.meta.env.VITE_URL}/colaboradores/`, payload, config);

        request
            .then((response) => {
                console.log('Resposta da API:', response);
                handleShowSnackbar(
                    isEdit
                        ? 'Colaborador(a) editado com sucesso!'
                        : 'Colaborador(a) adicionado com sucesso!',
                    'success'
                );
                setLoading(false);
                navigate('/colaboradores');
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
                            {isEdit ? "Editar Colaborador" : "Adicionar Colaborador"}
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
                                        label="Nome do Colaborador"
                                        error={!!errors.nome}
                                        helperText={errors.nome?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="profissao"
                                control={control}
                                rules={{ required: 'Profissão é obrigatória!' }}
                                render={({ field }) => (
                                    <FormTextField
                                        {...field}
                                        fullWidth
                                        label="Profissão do Colaborador"
                                        error={!!errors.profissao}
                                        helperText={errors.profissao?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="classificacao"
                                control={control}
                                rules={{ required: 'Classificação é obrigatória!' }}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.classificacao} sx={{ mb: 2 }}>
                                        <InputLabel>Categoria</InputLabel>
                                        <Select {...field} label="Categoria">
                                            <MenuItem value="">Selecione a categoria</MenuItem>
                                            <MenuItem value="presidente">Presidente</MenuItem>
                                            <MenuItem value="diretor">Diretor(a)</MenuItem>
                                            <MenuItem value="tesoureiro">Tesoureiro(a)</MenuItem>
                                            <MenuItem value="secretario">Secretário(a)</MenuItem>
                                            <MenuItem value="outros">Secretário(a)</MenuItem>
                                        </Select>
                                        {errors.classificacao && (
                                            <FormHelperText>{errors.classificacao.message}</FormHelperText>
                                        )}
                                    </FormControl>
                                )}
                            />

                            <Controller
                                name="foto"
                                control={control}
                                rules={{ required: 'Imagem é obrigatória!' }}
                                render={({ field: { value, onChange } }) => (
                                    <DropZone
                                        previewUrl={previewUrl}
                                        onFileChange={(file) => {
                                            handleFileChange(file);
                                            onChange(file); // Atualiza o valor no react-hook-form
                                        }}
                                        onDeleteImage={handleDeleteImage}
                                        error={!!errors.foto}
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