import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Controller, set, SubmitHandler, useForm } from "react-hook-form";
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
    Card,
    CardMedia,
    CardContent,
    Chip,
    CardActions,
    Badge,
} from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';
import Grid from "@mui/material/Grid2"; // Grid v2
import { styled } from "@mui/material/styles";
import CropOriginalIcon from '@mui/icons-material/CropOriginal';
import AddToPhotosIcon from '@mui/icons-material/AddToPhotos';
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from '@mui/icons-material/Edit'
import { verificaTokenExpirado } from "../../services/token";
import { SnackbarMui } from "../../components/Snackbar";
import { Loading } from "../../components/Loading";
import { LayoutDashboard } from "../../components/LayoutDashboard";
import { ConfirmationDialog } from "../../components/Dialog";
import { IToken } from "../../interfaces/token";

interface IGalerias {
    id: number
    nome: string
    local: string
    data: string
    qtd_fotos: number
}

export default function Galerias() {
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [dadosGalerias, setdadosGalerias] = useState<Array<IGalerias>>([])
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    })
    const location = useLocation();
    const [dialogState, setDialogState] = useState({
        open: false,
        id: null as number | null
    })

    const token = JSON.parse(localStorage.getItem('casadapaz.token') || '') as IToken

    useEffect(() => {
        if (localStorage.length == 0 || verificaTokenExpirado()) {
            navigate("/")
        }

        if (location.state?.snackbarMessage) {
            setMessage(location.state.snackbarMessage);
            setSeverity(location.state.snackbarSeverity);
            setSnackbarVisible(true);

        }

        setLoading(true)

        axios.get(import.meta.env.VITE_URL + '/galerias', { headers: { Authorization: `Bearer ${token.access_token}` } })
            .then((res) => {
                setdadosGalerias(res.data)
                setLoading(false)
            })
            .catch((err) => {
                setdadosGalerias(err)
                setLoading(false)
            })
    }, [location])

    const handleShowSnackbar = useCallback((
        message: string,
        severity: 'success' | 'error' | 'warning' | 'info'
    ) => {
        setSnackbarVisible(true);
        setMessage(message);
        setSeverity(severity);
    }, [setSnackbarVisible, setMessage, setSeverity]);

    const removeGaleria = useCallback((id: number) => {
        // Abre o dialog e guarda o ID para usar depois
        setDialogState({
            open: true,
            id: id
        });

    }, []);

    const handleConfirmedDelete = useCallback(() => {
        const id = dialogState.id;

        axios.delete(import.meta.env.VITE_URL + `/galerias/${id}`, { headers: { Authorization: `Bearer ${token.access_token}` } })
            .then(() => {
                handleShowSnackbar("Galeria removida com sucesso", "success");
                setdadosGalerias((prevRows) => prevRows.filter((row) => row.id !== id));
                setLoading(false)
            })
            .catch((error) => {
                const errorMessage = error.response?.data || "Erro ao remover Galeria";
                setLoading(false)
                handleShowSnackbar(errorMessage, "error");
            })
    }, [dialogState.id, setLoading]);

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
                <Container maxWidth="xl" sx={{ mb: 4, mt: 3 }}>
                    <ConfirmationDialog
                        open={dialogState.open}
                        title="Confirmar exclusão"
                        message="Tem certeza que deseja excluir esta Galeria ?"
                        onConfirm={handleConfirmedDelete}
                        onClose={() => setDialogState({ open: false, id: null })}
                    />
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h4" component="h1">
                            Galerias
                        </Typography>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/galerias/add')}
                        >
                            Adicionar
                        </Button>
                    </Box>

                    <Grid container spacing={3}>
                        {dadosGalerias.map((galeria) => (
                            <Grid size={{ md: 12, sm: 12, xs: 12 }} key={galeria.id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: '0.3s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 4,
                                        },
                                    }}
                                >

                                    <CardContent sx={{ p: '1rem !important' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Badge badgeContent={String(galeria.qtd_fotos)} color="primary">
                                                <CropOriginalIcon
                                                    sx={{
                                                        fontSize: { xs: '1.25rem', sm: '1.75rem', md: '3rem' } // Tamanho adaptativo do ícone
                                                    }}
                                                />
                                            </Badge>

                                            <Typography variant="h6" component="h2"
                                                sx={{
                                                    fontSize: { xs: '0.55rem', sm: '0.75rem', md: '1.10rem' } // Tamanho adaptativo do texto
                                                }}
                                            >
                                                {galeria.nome}
                                            </Typography>

                                            <Typography variant="h6" component="h6"
                                                sx={{
                                                    fontSize: { xs: '0.55rem', sm: '0.75rem', md: '1.10rem' } // Tamanho adaptativo da data
                                                }}
                                            >
                                                Data: {new Date(galeria.data).toLocaleDateString("pt-BR")}
                                            </Typography>

                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <IconButton color="secondary"
                                                    onClick={() => navigate(`/fotos/${galeria.id}`)}
                                                >
                                                    <AddToPhotosIcon
                                                        sx={{
                                                            fontSize: { xs: '1rem', sm: '1.40rem', md: '2.5rem' } // Tamanho adaptativo do ícone
                                                        }}
                                                    />
                                                </IconButton>
                                                <IconButton color="primary"
                                                    onClick={() => navigate(`/galerias/${galeria.id}`)}
                                                >
                                                    <EditIcon
                                                        sx={{
                                                            fontSize: { xs: '1rem', sm: '1.40rem', md: '2.5rem' } // Tamanho adaptativo do ícone
                                                        }}
                                                    />
                                                </IconButton>
                                                <IconButton color="error"
                                                    onClick={() => removeGaleria(galeria.id)}
                                                >
                                                    <DeleteIcon
                                                        sx={{
                                                            fontSize: { xs: '1rem', sm: '1.40rem', md: '2.5rem' } // Tamanho adaptativo do ícone
                                                        }}
                                                    />
                                                </IconButton>
                                            </Box>

                                        </Box>

                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </LayoutDashboard>
        </>
    )
}
