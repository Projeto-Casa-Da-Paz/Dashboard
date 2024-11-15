import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
    Box,
    Container,
    Typography,
    Paper,
    Card,
    CardMedia,
    Button,
    CardActions,
    IconButton,
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
import { set, SubmitHandler, useForm } from "react-hook-form";

// Interface atualizada para aceitar um array de imagens
interface IFotos {
    id: number;
    nome: string;
    id_galeria: number;
    imagens: File[]; // Array de imagens
}

interface IGalerias {
    id: number
    nome: string
    local: string
    data: string
    qtd_fotos: number
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
    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<IFotos>({
        defaultValues: {
            id: 0,
            id_galeria: 0,
            imagens: [] // Array de imagens inicializado vazio
        }
    });

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [dadosGaleria, setDadosGaleria] = useState<IGalerias>();
    const [dadosFotos, setDadosFotos] = useState<Array<IFotos>>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [limparFotos, setLimparFotos] = useState(false);
    const [files, setFiles] = useState<File[]>([]); // Estado para armazenar os arquivos selecionados
    const [dialogState, setDialogState] = useState({
        open: false,
        id: null as number | null
    });

    const { id } = useParams();
    const token = JSON.parse(localStorage.getItem('casadapaz.token') || '') as IToken;

    const handleShowSnackbar = useCallback((message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
        setSnackbarVisible(true);
        setMessage(message);
        setSeverity(severity);
    }, []);

    useEffect(() => {
        if (localStorage.length === 0 || verificaTokenExpirado()) {
            navigate("/");
            return;
        }

        setLoading(true);

        // Fetch galeria details
        axios.get(import.meta.env.VITE_URL + `/galerias/${id}`, { headers: { Authorization: `Bearer ${token.access_token}` } })
            .then((res) => {
                setDadosGaleria(res.data);
                axios.get(import.meta.env.VITE_URL + `/galerias/${id}/fotos`, { headers: { Authorization: `Bearer ${token.access_token}` } })
                    .then((res) => {
                        setDadosFotos(res.data);
                        setLoading(false);
                    })
                    .catch((err) => {
                        handleShowSnackbar("Erro ao carregar fotos", "error");
                        setLoading(false);
                    });
            })
            .catch((err) => {
                handleShowSnackbar("Galeria não encontrada", "error");
                setTimeout(() => {
                    setLoading(false);
                    navigate('/galerias');
                }, 1500);
            });
    }, [id, navigate]);

    const updateGalleryCoverCount = useCallback(async (dadosGaleria: any) => {
        try {
            await axios.put(
                `${import.meta.env.VITE_URL}/galerias/${id}`,
                dadosGaleria,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token.access_token}`
                    }
                }
            );
            handleShowSnackbar("Quantidade de fotos atualizada com sucesso", "success");
        } catch (error) {
            handleShowSnackbar("Erro ao atualizar a quantidade de fotos da galeria", "error");
        }
    }, [id, token, dadosGaleria, handleShowSnackbar]);

    const submitForm: SubmitHandler<IFotos> = useCallback(() => {
        setIsUploading(true);
        const uploadedPhotos: any[] = [];

        const uploadPhoto = (file: File, index: number) => {
            const formData = new FormData();
            formData.append('imagens[0]', file);
            formData.append('id_galeria', String(id));

            return axios.post(
                `${import.meta.env.VITE_URL}/galerias/${id}/fotos`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token.access_token}`
                    }
                }
            )
                .then((response) => {
                    uploadedPhotos.push(response.data.fotos[0]);
                    handleShowSnackbar(`Foto ${index + 1} enviada com sucesso`, "success");
                })
                .catch(() => {
                    handleShowSnackbar(`Erro no upload da foto ${index + 1}`, "error");
                });
        };

        // Upload de cada foto em sequência
        const uploadAllPhotos = files.reduce((promise, file, index) => {
            return promise.then(() => uploadPhoto(file, index));
        }, Promise.resolve());

        // Após o upload de todas as fotos, atualizar o estado e a galeria
        uploadAllPhotos
            .then(() => {
                setDadosFotos((prevRows) => [...prevRows, ...uploadedPhotos]);
                // Atualizar dados da galeria
                setDadosGaleria({
                    ...dadosGaleria!,
                    qtd_fotos: dadosGaleria?.qtd_fotos! + uploadedPhotos.length,
                });
                updateGalleryCoverCount(dadosGaleria);
            })
            .catch(() => {
                handleShowSnackbar("Erro ao atualizar dados da galeria", "error");
            })
            .finally(() => {
                setIsUploading(false);
            });

        setLimparFotos(true);
    }, [id, token, files, handleShowSnackbar, navigate, setDadosFotos, dadosGaleria, setFiles, setValue, setLimparFotos, updateGalleryCoverCount]);

    const handleFilesChange = useCallback((newFiles: File[]) => {
        setFiles(newFiles);
    }, [setFiles]);

    const handleDeletePhoto = useCallback((id: number) => {
        if (dadosFotos.length === 0) return;
        setDialogState({ open: true, id: id });
    }, [dadosFotos]);

    const handleConfirmedDelete = useCallback(async (fotoId: number) => {
        setLoading(true);
        try {
            // Chamada de API para excluir uma única foto com base no `id`
            await axios.delete(`${import.meta.env.VITE_URL}/fotos/${fotoId}`, {
                headers: {
                    Authorization: `Bearer ${token.access_token}`
                }
            });

            // Atualiza o estado `dadosFotos` removendo a foto excluída
            setDadosFotos((prevFotos) => prevFotos.filter((foto) => foto.id !== fotoId));
            setDadosGaleria(dadosGaleria ? { ...dadosGaleria, qtd_fotos: dadosGaleria.qtd_fotos - 1 } : undefined);
            updateGalleryCoverCount({ ...dadosGaleria, qtd_fotos: dadosGaleria?.qtd_fotos! - 1 });
            handleShowSnackbar("Foto excluída com sucesso", "success");
        } catch (error) {
            handleShowSnackbar("Erro ao excluir a foto", "error");
        } finally {
            setLoading(false);
            setDialogState({ open: false, id: null });
        }
    }, [token, handleShowSnackbar, setDialogState, setLoading, setDadosFotos, dadosGaleria, setDadosGaleria]);
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
                        onConfirm={() => dialogState.id && handleConfirmedDelete(dialogState.id)}
                        onClose={() => setDialogState({ open: false, id: null })}
                    />

                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h5" component="h1">
                            Fotos da Galeria - {dadosGaleria?.nome}
                        </Typography>
                    </Box>

                    <StyledPaper>
                        <Box component="form" onSubmit={handleSubmit(submitForm)} textAlign="center">
                            <Typography variant="h6" gutterBottom>
                                Adicionar novas fotos
                            </Typography>
                            <MultiFileDropZone
                                files={files}
                                onChange={handleFilesChange} // Atualiza os arquivos selecionados
                                maxFiles={15}
                                clearFilesTrigger={limparFotos}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                sx={{ mt: 2 }}
                            >
                                Enviar Fotos
                            </Button>
                        </Box>
                    </StyledPaper>

                    <StyledPaper>
                        <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">Quantidade de Fotos: {dadosGaleria?.qtd_fotos}</Typography>
                        </Box>
                        {dadosFotos.length > 0 ? (
                            <Grid container spacing={3}>
                                {dadosFotos.map(((foto, index) => (
                                    <Grid key={`${foto.id}-${index}`} size={{ md: 4, xs: 12, sm: 6 }}>
                                        <Card>
                                            <CardMedia
                                                component="img"
                                                height="200"
                                                image={`${import.meta.env.VITE_URL}/imagem/${foto.nome}`}
                                                alt="Imagem da galeria"
                                            />
                                            <CardActions
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <IconButton
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleDeletePhoto(foto.id)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </CardActions>

                                        </Card>
                                    </Grid>
                                )))}
                            </Grid>
                        ) : (
                            <NoPhotosCard>
                                <AddToPhotosIcon />
                                <Typography variant="body1" color="textSecondary">
                                    Nenhuma foto adicionada ainda.
                                </Typography>
                            </NoPhotosCard>
                        )}
                    </StyledPaper>
                </Container>
            </LayoutDashboard>
        </>
    );
}
