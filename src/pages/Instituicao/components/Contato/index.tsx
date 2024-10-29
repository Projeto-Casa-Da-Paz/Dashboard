import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";

// Material UI imports
import {
    Box,
    Button,
    Container,
    FormControl,
    MenuItem,
    Select,
    TextField,
    Typography,
    Paper,
    IconButton,
    InputLabel,
} from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';
import Grid from "@mui/material/Grid2"; // Grid v2
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { verificaTokenExpirado } from "../../../../services/token";
import { SnackbarMui } from "../../../../components/Snackbar";
import { Loading } from "../../../../components/Loading";


interface IContato {
    id: number;
    nome: string;
    cnpj: string;
    email: string;
    telefone: string;
}

// Componentes estilizados mantidos como estavam...
const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
}));

const FormTextField = styled(TextField)({
    marginBottom: '1rem',
});

const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export const Contato = () => {
    const [loading, setLoading] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");
    const navigate = useNavigate();

    const {
        control: contatoControl,
        handleSubmit: handleContatoSubmit,
        setValue: setContatoValue,
        formState: { errors: contatoErrors },
    } = useForm<IContato>({
        defaultValues: {
            id: 0,
            nome: "",
            cnpj: "",
            email: "",
            telefone: "",
        }
    });

    const handleShowSnackbar = useCallback((
        message: string,
        severity: 'success' | 'error' | 'warning' | 'info'
    ) => {
        setSnackbarVisible(true);
        setMessage(message);
        setSeverity(severity);
    }, [setSnackbarVisible, setMessage, setSeverity]);

    useEffect(() => {
        if (localStorage.length === 0 || verificaTokenExpirado()) {
            navigate("/");
        }

        
        setLoading(true);
        axios.get(import.meta.env.VITE_URL + '/instituicoes')
            .then((res) => {
                const instituicaoData = res.data[0];
                setContatoValue("id", instituicaoData.id || 0);
                setContatoValue("nome", instituicaoData.nome || '');
                setContatoValue("cnpj", instituicaoData.cnpj || '');
                setContatoValue("email", instituicaoData.email || '');
                setContatoValue("telefone", instituicaoData.telefone || '');
                setLoading(false);
            })
            .catch(() => {
                handleShowSnackbar("Erro ao carregar dados da instituição", "error");
                setLoading(false);
            });


    }, [navigate, setContatoValue]);

    const submitContato: SubmitHandler<IContato> = useCallback((data) => {
        setLoading(true);
        axios.put(import.meta.env.VITE_URL + `/instituicoes`+`/${data.id}`, data)
            .then(() => {
                handleShowSnackbar("Informações da instituição editadas com sucesso", "success");
                setLoading(false)
            })
            .catch((error) => {
                handleShowSnackbar(error.response.data, 'error')
                setLoading(false)
            });
    }, [handleShowSnackbar]);

    return (
        <>
            <Loading visible={loading} />
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
            <StyledPaper elevation={3}>
                <Typography variant="h4" gutterBottom sx={{ textAlign: "center" }}>
                    Instituição - Casa da Paz
                </Typography>

                <Box component="form" onSubmit={handleContatoSubmit(submitContato)} noValidate>

                    <Controller
                        name="nome"
                        control={contatoControl}
                        rules={{
                            required: "O nome da instituição é obrigatório",
                            pattern: {
                                value: nameRegex,
                                message: 'O nome não pode conter números'
                            }
                        }}
                        render={({ field }) => (
                            <FormTextField
                                {...field}
                                fullWidth
                                label="Nome"
                                error={!!contatoErrors.nome}
                                helperText={contatoErrors.nome?.message}
                            />
                        )}
                    />

                    <Controller
                        name="cnpj"
                        control={contatoControl}
                        rules={{ required: "O CNPJ da instituição é obrigatório" }}
                        render={({ field }) => (
                            <FormTextField
                                {...field}
                                fullWidth
                                label="CNPJ"
                                error={!!contatoErrors.cnpj}
                                helperText={contatoErrors.cnpj?.message}
                            />
                        )}
                    />

                    <Controller
                        name="email"
                        control={contatoControl}
                        rules={{
                            required: "O email da instituição é obrigatório",
                            pattern: {
                                value: emailRegex,
                                message: 'Email inválido'
                            }
                        }}
                        render={({ field }) => (
                            <FormTextField
                                {...field}
                                fullWidth
                                label="Email"
                                error={!!contatoErrors.email}
                                helperText={contatoErrors.email?.message}
                            />
                        )}
                    />

                    <Controller
                        name="telefone"
                        control={contatoControl}
                        rules={{ required: "O telefone da instituição é obrigatório" }}
                        render={({ field }) => (
                            <FormTextField
                                {...field}
                                fullWidth
                                label="Telefone"
                                error={!!contatoErrors.telefone}
                                helperText={contatoErrors.telefone?.message}
                            />
                        )}
                    />

                    <LoadingButton
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                        loading={loading}
                    >
                        Salvar Informações
                    </LoadingButton>

                </Box>
            </StyledPaper>
        </>
    )
}
