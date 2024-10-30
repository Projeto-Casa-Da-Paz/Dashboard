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

// Define a interface do formulário
interface IPremios {
    id: number;
    nome: string;
    categoria: string;
    data_recebimento: string;
    imagem: File | null;
}

// Componentes estilizados
const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
}));

const FormTextField = styled(TextField)({
    marginBottom: '1rem',
});


export default function GerenciarPremios() {
    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<IPremios>({
        defaultValues: {
            id: 0,
            nome: '',
            categoria: '',
            data_recebimento: '',
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
    
    useEffect(() => {
        if (localStorage.length === 0 || verificaTokenExpirado()) {
            navigate("/");
            return;
        }

        const premioId = Number(id);
        if (!isNaN(premioId)) {
            setLoading(true);
            axios.get(`http://localhost:3001/premios?id=${premioId}`)
                .then((res) => {
                    const premioData = res.data[0];
                    setIsEdit(true);
                    setValue("id", premioData.id || 0);
                    setValue("nome", premioData.nome || '');
                    setValue("categoria", premioData.categoria || '');
                    setValue("data_recebimento", premioData.data_recebimento || '');
                    if (premioData.imagem) {
                        setPreviewUrl(`http://localhost:3001/uploads/${premioData.imagem}`);
                    }
                    setLoading(false)
                })
                .catch(console.error)}

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

    const submitForm: SubmitHandler<IPremios> = useCallback((data) => {
        setLoading(true);
    
        // Criar um novo FormData
        const formData = new FormData();
        
        // Adicionar todos os campos do formulário ao FormData, exceto a imagem
        Object.keys(data).forEach(key => {
            if (key !== 'imagem') {
                formData.append(key, (data as Record<string, any>)[key]); // Cast genérico para acessar as chaves dinamicamente
            }
        });
    
        // Verificar se o campo 'imagem' contém um arquivo e adicioná-lo ao FormData
        if (data.imagem instanceof FileList && data.imagem.length > 0) {
            formData.append('imagem', data.imagem[0]); // Adiciona apenas o primeiro arquivo
        }
    
        // Configurar headers específicos para FormData
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };
    
        // Decidir entre criar ou editar com base em isEdit
        const request = isEdit
            ? axios.put(`${import.meta.env.VITE_URL}/premios/${id}`, formData, config)
            : axios.post(`${import.meta.env.VITE_URL}/premios/`, formData, config);
    
        request
            .then(() => {
                handleShowSnackbar(
                    isEdit
                        ? 'Prêmio editado com sucesso!'
                        : 'Prêmio adicionado com sucesso!',
                    'success'
                );
                setTimeout(() => { navigate('/premios'); }, 1500);
            })
            .catch((error) => {
                const errorMessage = error.response?.data || 'Erro ao processar a requisição';
                handleShowSnackbar(errorMessage, 'error');
            })
            .finally(() => setLoading(false));
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
                            {isEdit ? "Editar Prêmio" : "Adicionar Prêmio"}
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
                                        label="Nome do Prêmio"
                                        error={!!errors.nome}
                                        helperText={errors.nome?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="categoria"
                                control={control}
                                rules={{ required: 'Categoria é obrigatória!' }}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.categoria} sx={{ mb: 2 }}>
                                        <InputLabel>Categoria</InputLabel>
                                        <Select {...field} label="Categoria">
                                            <MenuItem value="">Selecione a categoria</MenuItem>
                                            <MenuItem value="academico">Acadêmico</MenuItem>
                                            <MenuItem value="profissional">Profissional</MenuItem>
                                            <MenuItem value="honraria">Honraria</MenuItem>
                                        </Select>
                                        {errors.categoria && (
                                            <FormHelperText>{errors.categoria.message}</FormHelperText>
                                        )}
                                    </FormControl>
                                )}
                            />

                            <Controller
                                name="data_recebimento"
                                control={control}
                                rules={{ required: 'Data de recebimento é obrigatória!' }}
                                render={({ field }) => (
                                    <FormTextField
                                        {...field}
                                        fullWidth
                                        label="Data de Recebimento"
                                        type="date"
                                        error={!!errors.data_recebimento}
                                        helperText={errors.data_recebimento?.message}
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