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
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';
import { LayoutDashboard } from "../../../components/LayoutDashboard";
import { SnackbarMui } from "../../../components/Snackbar";
import DropZone from "../../../components/Dropzone";
import { Loading } from "../../../components/Loading";
import { IToken } from "../../../interfaces/token";

// Define a interface do formulário
interface IParceiros {
    id: number
    nome: string
    classificacao: string
    data_inicio: string
    imagem: File | null
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


export default function GerenciarParceiros() {
    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<IParceiros>({
        defaultValues: {
            id: 0,
            nome: '',
            classificacao: '',
            data_inicio: '',
            imagem: null
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
    const imagemField = watch("imagem");

    const token = JSON.parse(localStorage.getItem('casadapaz.token') || '') as IToken


    useEffect(() => {
        if (localStorage.length === 0 || verificaTokenExpirado()) {
            navigate("/");
            return;
        }

        const parceiroId = Number(id);
        if (!isNaN(parceiroId)) {
            setLoading(true);
            axios.get(`${import.meta.env.VITE_URL}/parceiros/${parceiroId}`, { headers: { Authorization: `Bearer ${token.access_token}` } })
                .then((res) => {
                    const parceiroData = res.data;
                    setIsEdit(true);
                    setValue("id", parceiroData.id || 0);
                    setValue("nome", parceiroData.nome || '');
                    setValue("classificacao", parceiroData.classificacao || '');
                    setValue("data_inicio", parceiroData.data_inicio || '');
                    if (parceiroData.imagem) {
                        setPreviewUrl(`${import.meta.env.VITE_URL}/imagem/${parceiroData.imagem}`);
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
            setValue("imagem", file);
        } else {
            handleShowSnackbar('Por favor, selecione um arquivo de imagem válido.', 'error');
        }
    }, [handleShowSnackbar, setValue]);

    const handleDeleteImage = useCallback(() => {
        setValue("imagem", null);
        setPreviewUrl('');
    }, [setValue]);

    const submitForm: SubmitHandler<IParceiros> = useCallback((data) => {
        setLoading(true);
    
        console.log('Dados enviados:', data);
        console.log('URL:', import.meta.env.VITE_URL);
        console.log('isEdit:', isEdit, 'id:', id);
    
        // Cria um FormData e adiciona os campos
        const formData = new FormData();
        formData.append('id', data.id?.toString() || '');
        formData.append('nome', data.nome);
        formData.append('classificacao', data.classificacao);
        formData.append('data_inicio', data.data_inicio);
    
        // Se data.imagem for um File, adiciona diretamente
        // Se for uma string (URL existente), adiciona como string
        if (data.imagem instanceof File) {
            formData.append('imagem', data.imagem);
        } else if (data.imagem) {
            formData.append('imagem', data.imagem);
        }
    
        // Para debug - mostra todos os valores do FormData
        for (const pair of formData.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`);
        }
    
        const config = {
            headers: {
                'authorization': `Bearer ${token.access_token}`,
                // Não definimos Content-Type aqui pois o axios vai configurar 
                // automaticamente com o boundary correto para multipart/form-data
            }
        };
    
        const url = isEdit
            ? `${import.meta.env.VITE_URL}/parceiros/${id}`
            : `${import.meta.env.VITE_URL}/parceiros/`;
    
        const request = isEdit
            ? axios.put(url, formData, config)
            : axios.post(url, formData, config);
    
        request
            .then((response) => {
                console.log('Resposta da API:', response);
                handleShowSnackbar(
                    isEdit
                        ? 'Parceiro editado com sucesso!'
                        : 'Parceiro adicionado com sucesso!',
                    'success'
                );
                setLoading(false);
                setTimeout(() => { navigate('/parceiros'); }, 1500);
            })
            .catch((error) => {
                console.error('Erro na requisição:', error.response);
                const errorMessage = error.response?.data || 'Erro ao processar a requisição';
                setLoading(false);
                handleShowSnackbar(errorMessage, 'error');
            });
    }, [isEdit, id, navigate, token]);


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
                            {isEdit ? "Editar Parceiro" : "Adicionar Parceiro"}
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
                                        label="Nome do Parceiro"
                                        error={!!errors.nome}
                                        helperText={errors.nome?.message}
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
                                            <MenuItem value="privada">Empresa Privada</MenuItem>
                                            <MenuItem value="comunidade">Comunitária</MenuItem>
                                            <MenuItem value="publica">Empresa Pública</MenuItem>
                                            <MenuItem value="outros">Outros</MenuItem>
                                        </Select>
                                        {errors.classificacao && (
                                            <FormHelperText>{errors.classificacao.message}</FormHelperText>
                                        )}
                                    </FormControl>
                                )}
                            />  

                            <Controller
                                name="data_inicio"
                                control={control}
                                rules={{ required: 'Data de Inicio de Atuação é obrigatória!' }}
                                render={({ field }) => (
                                    <FormTextField
                                        {...field}
                                        aria-label="Data de Inicio"
                                        fullWidth
                                        label="Data de Inicio"
                                        type="date"
                                        error={!!errors.data_inicio}
                                        helperText={errors.data_inicio?.message}
                                        InputLabelProps={{
                                            shrink: true
                                        }}
                                    />
                                )}
                            />

                            <Controller
                                name="imagem"
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
                                        error={!!errors.imagem}
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