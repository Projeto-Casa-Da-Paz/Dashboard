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

interface IEndereco {
    id: number;
    local: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    isNew?: boolean;
}

// Componentes estilizados mantidos como estavam...
const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
}));

const FormTextField = styled(TextField)({
    marginBottom: '1rem',
});

export const Endereco = () => {
    const [loading, setLoading] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");
    const navigate = useNavigate();

    const {
        control: locaisControl,
        handleSubmit: handleLocaisSubmit,
        setValue: setLocaisValue,
        formState: { errors: locaisErrors },
    } = useForm<{ locais: IEndereco[] }>({
        defaultValues: {
            locais: [{
                id: 0,
                local: "",
                logradouro: "",
                numero: "",
                complemento: "",
                bairro: "",
                cidade: "",
                estado: "",
                cep: "",
                isNew: true
            }]
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

        axios.get(import.meta.env.VITE_URL + '/enderecos')
            .then((res) => {
                setLocaisValue("locais", res.data);
            })
            .catch(() => {
                handleShowSnackbar("Erro ao carregar endereços", "error");
            });


    }, [navigate, setLocaisValue]);

    const submitLocais = useCallback(async (data: { locais: IEndereco[] }) => {
        setLoading(true);

        const newLocais = data.locais
            .filter(local => local.isNew)  // Filtra apenas os novos
            .map(({ id, isNew, ...rest }) => rest); // Remove os campos 'id' e 'isNew'

        const existingLocais = data.locais
            .filter(local => !local.isNew) // Filtra os já existentes
            .map(({ isNew, ...rest }) => rest); // Remove o campo 'isNew'

        try {
            if (newLocais.length > 0) {
                await Promise.all(newLocais.map(local =>
                    axios.post(import.meta.env.VITE_URL + `/enderecos`, local)
                ));
            }

            if (existingLocais.length > 0) {
                await Promise.all(existingLocais.map(local =>
                    axios.put(import.meta.env.VITE_URL + `/enderecos/${local.id}`, local)
                ));
            }

            handleShowSnackbar("Endereços atualizados com sucesso", "success");
        } catch (error: any) {
            handleShowSnackbar(error.response?.data || "Erro ao salvar endereços", "error");
        } finally {
            setLoading(false);
        }
    }, [handleShowSnackbar, setLoading]);

    const onCepBlur = useCallback(async (cep: string, id: number) => {
        if (cep.length === 8) {
            try {
                const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
                const { logradouro, complemento, bairro, localidade, uf } = response.data;

                // Preenche os campos automaticamente
                setLocaisValue(`locais.${id}.logradouro`, logradouro);
                setLocaisValue(`locais.${id}.complemento`, complemento);
                setLocaisValue(`locais.${id}.bairro`, bairro);
                setLocaisValue(`locais.${id}.cidade`, localidade);
                setLocaisValue(`locais.${id}.estado`, uf);
                setLocaisValue(`locais.${id}.cep`, cep);
            } catch (error) {
                console.error("Erro ao buscar o CEP:", error);
                // Você pode adicionar um tratamento de erro aqui se desejar
            }
        }
    }, [setLocaisValue]);

    return (
        <>
            <StyledPaper elevation={3}>
                <ConfirmationDialog
                    open={dialogState.open}
                    title="Confirmar exclusão"
                    message="Tem certeza que deseja excluir esta rede social?"
                    onConfirm={handleConfirmedDeleteSocial}
                    onClose={() => setDialogState({ open: false, id: null })}
                />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Typography variant="h5">Endereços</Typography>
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={addLocal}
                        size="small"
                    >
                        Adicionar
                    </Button>
                </Box>

                <Box component="form" onSubmit={handleLocaisSubmit(submitLocais)} noValidate>
                    {locais?.map((local, index) => (
                        <SocialMediaCard key={local.id} sx={{ p: 1.5 }}>
                            <Typography variant="body1" sx={{ mb: 1.5, pl: 0.5 }}>
                                <strong>{local.isNew ? "Novo" : "ID: " + local.id}</strong>
                                <DeleteButton
                                    color="error"
                                    onClick={() => removeLocal(local.id)}
                                    size="small"
                                >
                                    <DeleteIcon />
                                </DeleteButton>

                            </Typography>


                            <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 4, md: 12 }} >
                                <Grid size={{ md: 4, sm: 12, xs: 4 }}>
                                    <Controller
                                        name={`locais.${index}.local`}
                                        control={locaisControl}
                                        rules={{ required: "O nome do local é obrigatório" }}
                                        render={({ field }) => (
                                            <FormTextField
                                                {...field}
                                                fullWidth
                                                sx={{ mb: 0 }}
                                                size="small"
                                                label="Nome do Local"
                                                placeholder="Ex: Sede, Bazar"
                                                error={!!locaisErrors.locais?.[index]?.local}
                                                helperText={locaisErrors?.locais?.[index]?.message}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{ md: 4, sm: 12, xs: 4 }}>
                                    <Controller
                                        name={`locais.${index}.cep`}
                                        control={locaisControl}
                                        rules={{ required: "O CEP é obrigatório" }}
                                        render={({ field }) => (
                                            <FormTextField
                                                {...field}
                                                onBlur={() => onCepBlur(field.value, index)}
                                                fullWidth
                                                sx={{ mb: 0 }}
                                                size="small"
                                                label="CEP"
                                                placeholder="00000-000"
                                                error={!!locaisErrors.locais?.[index]?.cep}
                                                helperText={locaisErrors?.locais?.[index]?.message}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{ md: 4, sm: 12, xs: 4 }}>
                                    <Controller
                                        name={`locais.${index}.logradouro`}
                                        control={locaisControl}
                                        rules={{ required: "O Lograduro é obrigatório" }}
                                        render={({ field }) => (
                                            <FormTextField
                                                {...field}
                                                fullWidth
                                                sx={{ mb: 0 }}
                                                size="small"
                                                label="Logradouro"
                                                placeholder="Rua, Av. ou outros"
                                                error={!!locaisErrors.locais?.[index]?.logradouro}
                                                helperText={locaisErrors?.locais?.[index]?.message}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{ md: 4, sm: 12, xs: 4 }}>
                                    <Controller
                                        name={`locais.${index}.numero`}
                                        control={locaisControl}
                                        rules={{ required: "O número é obrigatório" }}
                                        render={({ field }) => (
                                            <FormTextField
                                                {...field}
                                                fullWidth
                                                sx={{ mb: 0 }}
                                                size="small"
                                                label="Nº"
                                                placeholder="Ex: 123 ou 0 em caso de sem nº"
                                                error={!!locaisErrors.locais?.[index]?.numero}
                                                helperText={locaisErrors?.locais?.[index]?.message}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{ md: 4, sm: 12, xs: 4 }}>
                                    <Controller
                                        name={`locais.${index}.complemento`}
                                        control={locaisControl}
                                        rules={{ required: "O complemento é obrigatório" }}
                                        render={({ field }) => (
                                            <FormTextField
                                                {...field}
                                                fullWidth
                                                sx={{ mb: 0 }}
                                                size="small"
                                                label="Complemento"
                                                placeholder="Ex: Casa, Prédio Comercial"
                                                error={!!locaisErrors.locais?.[index]?.complemento}
                                                helperText={locaisErrors?.locais?.[index]?.message}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{ md: 4, sm: 12, xs: 4 }}>
                                    <Controller
                                        name={`locais.${index}.bairro`}
                                        control={locaisControl}
                                        rules={{ required: "O bairro é obrigatório" }}
                                        render={({ field }) => (
                                            <FormTextField
                                                {...field}
                                                fullWidth
                                                sx={{ mb: 0 }}
                                                size="small"
                                                label="Bairro"
                                                placeholder="Nome do bairro"
                                                error={!!locaisErrors.locais?.[index]?.bairro}
                                                helperText={locaisErrors?.locais?.[index]?.message}
                                            />
                                        )}
                                    />
                                </Grid>


                                <Grid size={{ md: 4, sm: 12, xs: 4 }}>
                                    <Controller
                                        name={`locais.${index}.cidade`}
                                        control={locaisControl}
                                        rules={{ required: "A cidade é obrigatório" }}
                                        render={({ field }) => (
                                            <FormTextField
                                                {...field}
                                                fullWidth
                                                sx={{ mb: 0 }}
                                                size="small"
                                                label="Cidade"
                                                placeholder="Cidade"
                                                error={!!locaisErrors.locais?.[index]?.cidade}
                                                helperText={locaisErrors?.locais?.[index]?.message}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{ md: 4, sm: 12, xs: 4 }}>
                                    <Controller
                                        name={`locais.${index}.estado`}
                                        control={locaisControl}
                                        rules={{ required: "O Estado é obrigatório" }}
                                        render={({ field }) => (
                                            <FormTextField
                                                {...field}
                                                fullWidth
                                                sx={{ mb: 0 }}
                                                size="small"
                                                label="Estado"
                                                placeholder="UF Ex: SP"
                                                error={!!locaisErrors.locais?.[index]?.estado}
                                                helperText={locaisErrors?.locais?.[index]?.message}
                                            />
                                        )}
                                    />
                                </Grid>

                            </Grid>
                        </SocialMediaCard>
                    ))}

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                        sx={{ mt: 2 }}
                    >
                        Salvar Endereços
                    </Button>
                </Box>
            </StyledPaper>
        </>
    )
}
