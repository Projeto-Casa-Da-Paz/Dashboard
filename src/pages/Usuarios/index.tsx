import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { verificaTokenExpirado } from "../../services/token"
import { Loading } from "../../components/Loading"
import axios from "axios"
import {
    Container,
    Typography,
    Button,
    Box,
    IconButton
} from '@mui/material'
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams
} from '@mui/x-data-grid'
import { ptBR } from '@mui/x-data-grid/locales'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { LayoutDashboard } from "../../components/LayoutDashboard"


interface IUsers {
    id: number
    nome: string
    email: string
    permissoes: string
}

export default function Usuarios() {

    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [dadosUsers, setdadosUsers] = useState<Array<IUsers>>([])
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    })

    // Inicio, Update State, Destruir
    useEffect(() => {

        if (localStorage.length == 0 || verificaTokenExpirado()) {
            navigate("/")
        }

        setLoading(true)

        axios.get(import.meta.env.VITE_URL + '/users')
            .then((res) => {
                setdadosUsers(res.data)
                setLoading(false)
            })
            .catch((err) => {
                setLoading(false)
                setdadosUsers(err)
            })
    }, [])

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
            width: 250,
            filterable: true,
        },
        {
            field: 'email',
            headerName: 'E-mail',
            width: 200,
            filterable: true,
            headerAlign: 'center',
            align: 'center',
        },
        {
            field: 'permissao',
            headerName: 'Permissão',
            width: 200,
            filterable: true,
            headerAlign: 'center',
            align: 'center',
        },
        {
            field: 'acoes',
            headerName: 'Ações',
            flex: 2,
            minWidth: 100, // Define uma largura mínima
            filterable: false,
            sortable: false,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <Box >
                    <IconButton
                        color="primary"
                        onClick={() => navigate(`/usuarios/${params.row.id}`)}
                        size="large"
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        color="error"
                        size="large"
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            ),
        },
    ]

    return (
        <>
            <Loading visible={loading} />
            <LayoutDashboard>
                <Container maxWidth="xl" sx={{ mb: 4 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h4" component="h1">
                            Usuários
                        </Typography>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/usuarios/novo')}
                        >
                            Novo Usuário
                        </Button>
                    </Box>

                    <Box sx={{ width: '100%'}}>
                        <DataGrid
                            rows={dadosUsers}
                            columns={columns}
                            rowHeight={60}
                            density="standard"
                            paginationModel={paginationModel}
                            onPaginationModelChange={setPaginationModel}
                            pageSizeOptions={[10, 25, 50, { value: -1, label: 'Todos os Registros' }]}
                            localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                            disableColumnResize
                            disableRowSelectionOnClick
                            sx={{
                                height: 400,
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