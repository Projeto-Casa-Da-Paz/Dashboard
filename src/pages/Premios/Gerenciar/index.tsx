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
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [id, navigate, setValue]);

    const imagemField = watch("imagem");
    useEffect(() => {
        if (imagemField && imagemField instanceof File) {
            const fileReader = new FileReader();
            fileReader.onloadend = () => {
                setPreviewUrl(fileReader.result as string);
            };
            fileReader.readAsDataURL(imagemField);
        }
    }, [imagemField]);

    const handleFileChange = (file: File | null) => {
        if (file && file.type.startsWith('image/')) {
            setValue("imagem", file);
        } else {
            handleShowSnackbar('Por favor, selecione um arquivo de imagem válido.', 'error');
        }
    };

    const handleDeleteImage = () => {
        setValue("imagem", null);
        setPreviewUrl('');
    };

    const submitForm: SubmitHandler<IPremios> = useCallback((data) => {
        setLoading(true);

        const request = isEdit
            ? axios.put(`http://localhost:3001/premios/${id}`, data)
            : axios.post('http://localhost:3001/premios/', data);

        request
            .then(() => {
                handleShowSnackbar(
                    isEdit
                        ? 'Prêmio editado com sucesso!'
                        : 'Prêmio adicionado com sucesso!',
                    'success'
                );
                setTimeout(() => { navigate('/premios') }, 1500);
            })
            .catch((error) => handleShowSnackbar(error.response.data, 'error'))
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
                                        InputLabelProps={{ shrink: true }}
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