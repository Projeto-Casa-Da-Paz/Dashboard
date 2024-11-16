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
import { IToken } from "../../interfaces/token"

interface IParceiros {
    id: number
    nome: string
    classificacao: string
    descricao: string
    data_inicio: Date
    imagem: string
}

export default function Colaboradores() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [dadosColaboradores, setDadosColaboradores] = useState<Array<IParceiros>>([])
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    })

    const token = JSON.parse(localStorage.getItem('casadapaz.token') || '') as IToken

    useEffect(() => {
        if (localStorage.length == 0 || verificaTokenExpirado()) {
            navigate("/")
        }

        setLoading(true)


            axios.get(import.meta.env.VITE_URL + '/colaboradores',{
                headers: {
                "Authorization": 'Bearer' + token?.access_token
            }})
            .then((res) => {
                setDadosColaboradores(res.data)
                setLoading(false)
            })
            .catch((err) => {
                setDadosColaboradores(err)
                setLoading(false)
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
            field: 'foto',
            headerName: 'Imagem',
            width: 150,
            filterable: false,
            display: 'flex',
            sortable: false,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <Avatar
                    src={import.meta.env.VITE_URL + `/imagem/${params.value}`}
                    alt="Imagem do Parceiro"
                    sx={{ width: 75, height: 75 }}
                />
            ),
        },
        {
            field: 'nome',
            headerName: 'Nome',
            width: 250,
            filterable: true,
        },
        {
            field: 'classificacao',
            headerName: 'Classificação',
            width: 250,
            filterable: true,
            headerAlign: 'center',
            align: 'center',
        },
        {
            field: 'profissao',
            headerName: 'Profissão',
            width: 250,
            filterable: true,
            headerAlign: 'center',
            align: 'center',
        },
        {
            field: 'acoes',
            headerName: 'Ações',
            flex: 1,
            minWidth: 150, // Define uma largura mínima
            filterable: false,
            sortable: false,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <Box >
                    <IconButton
                        color="primary"
                        onClick={() => navigate(`/colaboradores/${params.row.id}`)}
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
                <Container maxWidth="xl" sx={{ mb: 4, mt: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h4" component="h1">
                            Colaboradores
                        </Typography>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/colaboradores/add')}
                        >
                            Adicionar
                        </Button>
                    </Box>

                    <Box sx={{ width: '100%' }}>
                        <DataGrid
                            rows={dadosColaboradores}
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
