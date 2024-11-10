import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

// Material UI imports
import {
    Box,
    Container,
    Typography,
    Paper,
    Card,
    CardMedia,
    CardContent,
    IconButton,
    Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Grid2"; // Grid v2
import DeleteIcon from "@mui/icons-material/Delete";
import AddToPhotosIcon from '@mui/icons-material/AddToPhotos';
import { verificaTokenExpirado } from "../../services/token";
import { SnackbarMui } from "../../components/Snackbar";
import { Loading } from "../../components/Loading";
import { LayoutDashboard } from "../../components/LayoutDashboard";
import { ConfirmationDialog } from "../../components/Dialog";
import MultiFileDropZone from "../../components/MultiFileDropZone";
import { IToken } from "../../interfaces/token";

interface IFoto {
    id: number;
    id_galeria: number;
    imagem: string;
}

// Componentes estilizados
const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
}));

const NoPhotosCard = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4),
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.shape.borderRadius,
    minHeight: 200,
    '& .MuiSvgIcon-root': {
        fontSize: 48,
        color: theme.palette.text.secondary,
        marginBottom: theme.spacing(2),
    },
}));

export default function Fotos() {
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [nomeGaleria, setNomeGaleria] = useState<string>("");
    const [dadosFotos, setDadosFotos] = useState<Array<IFoto>>([]);
    const [isUploading, setIsUploading] = useState(false);

    const [dialogState, setDialogState] = useState({
        open: false,
        id: null as number | null
    });

    const { id } = useParams();

    const handleShowSnackbar = useCallback((
        message: string,
        severity: 'success' | 'error' | 'warning' | 'info'
    ) => {
        setSnackbarVisible(true);
        setMessage(message);
        setSeverity(severity);
    }, []);

    const token = JSON.parse(localStorage.getItem('casadapaz.token') || '') as IToken

    useEffect(() => {
        if (localStorage.length === 0 || verificaTokenExpirado()) {
            navigate("/");
            return;
        }

        setLoading(true);

        // Fetch galeria details
        axios.get(import.meta.env.VITE_URL + `/galerias/${id}`, { headers: { Authorization: `Bearer ${token.access_token}` } })
            .then((res) => {
                setNomeGaleria(res.data.nome);

                // Fetch fotos after confirming galeria exists
                return axios.get(import.meta.env.VITE_URL + '/fotos/' + id, { headers: { Authorization: `Bearer ${token.access_token}` } });
            })
            .then((res) => {
                setDadosFotos(res.data);
                setLoading(false);
            })
            .catch((err) => {
                handleShowSnackbar("Galeria não encontrada", "error");
                setTimeout(() => {
                    setLoading(false);
                    navigate('/galerias');
                }, 1500);

            });
    }, [id, navigate]);

    const handleConfirmedDelete = useCallback((deleteId: number) => {
        setLoading(true);
        axios.delete(import.meta.env.VITE_URL + `/fotos/${deleteId}`)
            .then(() => {
                handleShowSnackbar("Foto removida com sucesso", "success");
                setDadosFotos((prevRows) => prevRows.filter((row) => row.id !== deleteId));
                setLoading(false);
            })
            .catch((error) => {
                const errorMessage = error.response?.data || "Erro ao remover foto";
                setLoading(false);
                handleShowSnackbar(errorMessage, "error");
            });
    }, []);

    const handleFileChange = async (files: File[]) => {
        setIsUploading(true);
        const formData = new FormData();

        // Append each file to formData
        files.forEach((file, index) => {
            formData.append(`files[${index}]`, file);
        });
        formData.append('id_galeria', id!);

        try {
            const response = await axios.post(import.meta.env.VITE_URL + '/fotos/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setDadosFotos(prev => [...prev, ...response.data]);
            handleShowSnackbar("Fotos enviadas com sucesso", "success");
            navigate('/galerias', { state: {} });
        } catch (error) {
            handleShowSnackbar("Erro ao enviar as fotos", "error");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteAllPhotos = () => {
        if (dadosFotos.length === 0) return;

        setDialogState({
            open: true,
            id: null // Trigger to delete all photos
        });
    };

    const confirmDeleteAllPhotos = async () => {
        setLoading(true);
        try {
            await axios.delete(import.meta.env.VITE_URL + `/fotos/deleteAll?id_galeria=${id}`);
            setDadosFotos([]);
            handleShowSnackbar("Todas as fotos foram excluídas com sucesso", "success");
        } catch (error) {
            handleShowSnackbar("Erro ao excluir todas as fotos", "error");
        } finally {
            setLoading(false);
            setDialogState({ open: false, id: null });
        }
    };

    return (
        <>
            <Loading visible={loading || isUploading} />
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
                        message={dialogState.id === null ? "Tem certeza que deseja excluir todas as fotos?" : "Tem certeza que deseja excluir esta Foto?"}
                        onConfirm={dialogState.id === null ? confirmDeleteAllPhotos : () => dialogState.id && handleConfirmedDelete(dialogState.id)}
                        onClose={() => setDialogState({ open: false, id: null })}
                    />

                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h5" component="h1">
                            Fotos da Galeria - {nomeGaleria}
                        </Typography>
                    </Box>

                    <StyledPaper>
                        {/* Upload Section */}
                        <Box textAlign="center">
                            <Typography variant="h6" gutterBottom>
                                Adicionar novas fotos
                            </Typography>
                            <MultiFileDropZone

                                maxFiles={15}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                sx={{ mt: 2 }}
                                onClick={() => handleFileChange([])}
                            >
                                Enviar Fotos
                            </Button>
                        </Box>
                    </StyledPaper>

                    <StyledPaper>
                        <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">
                                <strong>Fotos salvas: {dadosFotos.length}</strong>
                            </Typography>
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={handleDeleteAllPhotos}
                            >
                                Excluir Todas as Fotos
                            </Button>
                        </Box>

                        {/* Existing Photos Section */}
                        {dadosFotos.length > 0 ? (
                            <Grid container spacing={2} sx={{ mb: 4 }}>
                                {dadosFotos.map((foto) => (
                                    <Grid key={foto.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                        <Card>
                                            <CardMedia
                                                component="img"
                                                height="200"
                                                image={'/public/' + foto.imagem}
                                                alt="Foto da galeria"
                                                sx={{ objectFit: 'cover' }}
                                            />
                                            <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                                                <Box display="flex" justifyContent="flex-end">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => setDialogState({
                                                            open: true,
                                                            id: foto.id
                                                        })}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <NoPhotosCard>
                                <AddToPhotosIcon />
                                <Typography variant="h6" color="text.secondary">
                                    Sem Fotos adicionadas
                                </Typography>
                            </NoPhotosCard>
                        )}
                    </StyledPaper>
                </Container>
            </LayoutDashboard>
        </>
    );
}
