import { useNavigate } from "react-router-dom"
import { useCallback, useEffect, useState } from "react"
import { verificaTokenExpirado } from "../../services/token"
import { Loading } from "../../components/Loading"
import axios from "axios"
import {
    Container,
    Typography,
    Button,
    Box,
    IconButton,
    Avatar
} from '@mui/material'
import {
    DataGrid,
    GridColDef,
    GridValueGetter,
    GridRenderCellParams
} from '@mui/x-data-grid'
import { ptBR } from '@mui/x-data-grid/locales'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { LayoutDashboard } from "../../components/LayoutDashboard"
import { ConfirmationDialog } from "../../components/Dialog"
import { SnackbarMui } from "../../components/Snackbar"
import { IToken } from "../../interfaces/token"
import { GridInitialStateCommunity } from "@mui/x-data-grid/models/gridStateCommunity"

interface IReserva {
    id: number
    ambiente_id: number
    horario: string
    data: string
    usuario_id: number
    status: string
}

interface IAmbiente {
    id: number
    nome: string
}

export default function Reservas() {
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [dadosReservas, setDadosReservas] = useState<Array<IReserva>>([])
    const [ambientes, setAmbientes] = useState<Map<number, string>>(new Map())
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    })
    const [dialogState, setDialogState] = useState({
        open: false,
        id: null as number | null
    })

    const token = JSON.parse(localStorage.getItem('auth.token') || '') as IToken

    useEffect(() => {
        if (localStorage.length == 0 || verificaTokenExpirado()) {
            navigate("/")
        }

        setLoading(true)

        // Busca ambientes
        axios.get(import.meta.env.VITE_URL + '/ambientes', { headers: { Authorization: `Bearer ${token.accessToken}` } })
            .then((res) => {
                const ambienteMap = new Map<number, string>()
                res.data.forEach((ambiente: IAmbiente) => {
                    ambienteMap.set(ambiente.id, ambiente.nome)
                })
                setAmbientes(ambienteMap)
            })
            .catch(() => handleShowSnackbar("Erro ao buscar ambientes", "error"))

        axios.get(import.meta.env.VITE_URL + '/reservas?usuario_id=' + token.user.id, { headers: { Authorization: `Bearer ${token.accessToken}` } })
            .then((res) => {
                setDadosReservas(res.data)
                setLoading(false)
            })
            .catch((err) => {
                setDadosReservas(err)
                setLoading(false)
            })
    }, [])

    const handleShowSnackbar = useCallback((
        message: string,
        severity: 'success' | 'error' | 'warning' | 'info'
    ) => {
        setSnackbarVisible(true);
        setMessage(message);
        setSeverity(severity);
    }, [setSnackbarVisible, setMessage, setSeverity]);

    const columns: GridColDef[] = [
        {
            field: 'id',
            headerName: 'ID',
            width: 60,
            filterable: false,
            sortable: false,
            headerAlign: 'center',
            align: 'center'
        },
        {
            field: 'ambiente_id',
            headerName: 'Ambiente',
            width: 200,
            filterable: true,
            valueGetter: (params) => ambientes.get(params) || "Desconhecido",
        },
        {
            field: 'horario',
            headerName: 'Horário',
            width: 150,
            filterable: true,
            headerAlign: 'center',
            align: 'center',
        },
        {
            field: 'data',
            headerName: 'Data',
            width: 150,
            filterable: true,
            headerAlign: 'center',
            align: 'center',
            valueGetter: (params: GridValueGetter) => {
                return new Date(params + 'T00:00:00').toLocaleDateString("pt-BR")
            },
        },
        {
            field: 'status',
            headerName: 'Situação',
            width: 150,
            filterable: true,
            headerAlign: 'center',
            align: 'center',
        },
        {
            field: 'acoes',
            headerName: 'Ações',
            flex: 1,
            minWidth: 150,
            filterable: false,
            sortable: false,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <Box >
                    <IconButton
                        color="primary"
                        onClick={() => navigate(`/reservas/${params.row.id}`)}
                        size="large"
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        color="error"
                        size="large"
                        onClick={() => cancelaReserva(params.row.id)}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            ),
        },
    ]

    const cancelaReserva = useCallback((id: number) => {

        setDialogState({
            open: true,
            id: id
        });
    }, []);

    const handleConfirmedDelete = useCallback(() => {
        const id = dialogState.id;

        axios.delete(import.meta.env.VITE_URL + `/reservas/${id}`, { headers: { Authorization: `Bearer ${token.accessToken}` } })
            .then(() => {
                handleShowSnackbar("Reserva cancelada com sucesso", "success");
                setDadosReservas((prevRows) => prevRows.filter((row) => row.id !== id));
                setLoading(false)
            })
            .catch((error) => {
                const errorMessage = error.response?.data || "Erro ao cancelar Reserva";
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
                        message="Tem certeza que deseja cancelar esta Reserva ?"
                        onConfirm={handleConfirmedDelete}
                        onClose={() => setDialogState({ open: false, id: null })}
                    />
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h4" component="h1">
                            Reservas
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/reservas/add')}
                        >
                            Adicionar
                        </Button>
                    </Box>

                    <Box sx={{ width: '100%' }}>
                        <DataGrid
                            rows={dadosReservas}
                            columns={columns}
                            rowHeight={50}
                            density="standard"
                            initialState={{
                                sorting: {
                                    sortModel: [{ field: 'data', sort: 'asc' }], // Ordenação inicial
                                },
                            } as GridInitialStateCommunity}
                            paginationModel={paginationModel}
                            onPaginationModelChange={setPaginationModel}
                            pageSizeOptions={[10, 25, 50, { value: -1, label: 'Todos os Registros' }]}
                            disableColumnResize
                            disableRowSelectionOnClick
                            localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                            sx={{
                                height: 450,
                                boxShadow: 2,
                                border: 2,
                                borderColor: 'primary.light',
                                '& .MuiDataGrid-cell': {
                                    overflow: 'visible',
                                    textOverflow: 'clip',
                                },
                                '& .MuiDataGrid-cell:hover': {
                                    color: 'primary.main',
                                },
                                '& .MuiDataGrid-row': {
                                    borderBottom: '1px solid #e0e0e0',
                                },
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: '#f5f5f5',
                                    borderBottom: '2px solid #e0e0e0',
                                },
                                '& .MuiDataGrid-footerContainer': {
                                    borderTop: '2px solid #e0e0e0',
                                    backgroundColor: '#f5f5f5',
                                },
                                '& .MuiTablePagination-displayedRows, .MuiTablePagination-selectLabel': {
                                    margin: 0,
                                },
                                '& .MuiTablePagination-root': {
                                    overflow: 'hidden',
                                }
                            }}
                        />
                    </Box>
                </Container>
            </LayoutDashboard>
        </>
    )
}
