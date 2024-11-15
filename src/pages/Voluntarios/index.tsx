import { useCallback, useEffect, useState } from "react";
import { LayoutDashboard } from "../../components/LayoutDashboard";
import { verificaTokenExpirado } from "../../services/token";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IToken } from "../../interfaces/token";
import { DataGrid, GridColDef, GridRenderCellParams, GridValueGetter } from "@mui/x-data-grid";
import { Box, Container, IconButton, Typography } from "@mui/material";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Loading } from "../../components/Loading";
import { SnackbarMui } from "../../components/Snackbar";
import { ptBR } from '@mui/x-data-grid/locales'
interface IVoluntarios {
    id: number
    nome: string
    idade: number
    telefone: string
    areaAtuacao: string
    endereco: string
    created_at: string
}

export default function Voluntarios() {

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [dadosVoluntarios, setdadosVoluntarios] = useState<Array<IVoluntarios>>([])
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    })

    const token = JSON.parse(localStorage.getItem('casadapaz.token') || '') as IToken

    // Inicio, Update State, Destruir
    useEffect(() => {

        if (localStorage.length == 0 || verificaTokenExpirado()) {
            navigate("/")
        }

        setLoading(true)

        axios.get(import.meta.env.VITE_URL + '/voluntarios', { headers: { Authorization: `Bearer ${token.access_token}` } })
            .then((res) => {
                setdadosVoluntarios(res.data)
                setLoading(false)
            })
            .catch((err) => {
                setdadosVoluntarios(err)
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
            field: 'nome',
            headerName: 'Nome',
            width: 200,
            filterable: true,
        },
        {
            field: 'idade',
            headerName: 'Idade',
            headerAlign: 'center',
            align: 'center',
            width: 75,
            filterable: true,
        },
        {
            field: 'telefone',
            headerName: 'Telefone',
            headerAlign: 'center',
            align: 'center',
            width: 175,
            filterable: true,
            renderCell: (params: GridRenderCellParams) => {
                const rawValue = params.value || ''; // Valor bruto do telefone
                const numericValue = rawValue.replace(/\D/g, ''); // Remove caracteres não numéricos

                // Aplica a máscara de telefone
                const maskedValue =
                    numericValue.length === 11
                        ? `(${numericValue.slice(0, 2)}) ${numericValue.slice(2, 7)}-${numericValue.slice(7)}`
                        : numericValue.length === 10
                            ? `(${numericValue.slice(0, 2)}) ${numericValue.slice(2, 6)}-${numericValue.slice(6)}`
                            : rawValue; // Retorna o valor original caso não seja 10 ou 11 dígitos

                return (
                    <Box>
                        {maskedValue}
                        <IconButton
                            sx={{ ml: 1 }}
                            color="success"
                            onClick={() => {
                                const waLink = `https://wa.me/55${numericValue}`;
                                window.open(waLink, '_blank');
                            }}
                            size="small"
                        >
                            <WhatsAppIcon />
                        </IconButton>
                    </Box>
                );
            },
        },
        {
            field: 'areaAtuacao',
            headerName: 'Área de Atuação',
            width: 175,
            filterable: true,
            headerAlign: 'center',
            align: 'center',
        },
        {
            field: 'created_at',
            headerName: 'Data Inscrição',
            width: 175,
            filterable: true,
            headerAlign: 'center',
            align: 'center',
            valueGetter: (params: GridValueGetter) => {
                return new Date(String(params)).toLocaleDateString("pt-BR")
            },
        },
        {
            field: 'endereco',
            headerName: 'Endereço',
            width: 200,
            filterable: true,
            headerAlign: 'center',
            align: 'center',
        },
    ]

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
                    <Box display="flex" justifyContent="center" alignItems="center" mb={3}>
                        <Typography variant="h4" component="h1">
                            Voluntários
                        </Typography>
                    </Box>

                    <Box sx={{ width: '100%' }}>
                        <DataGrid
                            rows={dadosVoluntarios}
                            columns={columns}
                            rowHeight={90}
                            density="standard"
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
                                    overflow: 'visible', // Permite que o conteúdo da célula apareça
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
