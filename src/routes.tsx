import {
    Routes,
    Route,
    BrowserRouter

} from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Usuarios from "./pages/Usuarios"
import GerenciarUsuarios from "./pages/Usuarios/Gerenciar"
import Premios from "./pages/Premios"
import GerenciarPremios from "./pages/Premios/Gerenciar"
import Instituicao from "./pages/Instituicao"
import Historia from "./pages/Historia"
import Parceiros from "./pages/Parceiros"
import GerenciarParceiros from "./pages/Parceiros/Gerenciar"
import Galerias from "./pages/Galeria"
import GerenciarGalerias from "./pages/Galeria/Gerenciar"
import Fotos from "./pages/Fotos"
import Colaboradores from "./pages/Colaboradores"
import GerenciarColaboradores from "./pages/Colaboradores/Gerenciar"

export const Rotas = () => {

    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={
                        <Login />
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        <Dashboard />
                    }
                />
                <Route
                    path="/usuarios"
                    element={<Usuarios />}
                />
                <Route
                    path="/usuarios/:id"
                    element={<GerenciarUsuarios />}
                />
                <Route
                    path="/premios"
                    element={<Premios />}
                />
                <Route
                    path="/premios/:id"
                    element={<GerenciarPremios />}
                />
                <Route
                    path="/instituicao"
                    element={<Instituicao />}
                />
                <Route
                    path="/historia/:id"
                    element={<Historia />}
                />
                <Route
                    path="/parceiros"
                    element={<Parceiros />}
                />
                <Route
                    path="/parceiros/:id"
                    element={<GerenciarParceiros />}
                />
                <Route
                    path="/colaboradores"
                    element={<Colaboradores />}
                />
                <Route
                    path="/colaboradores/:id"
                    element={<GerenciarColaboradores />}
                />
                <Route
                    path="/galerias/"
                    element={<Galerias />}
                />
                <Route
                    path="/galerias/:id"
                    element={<GerenciarGalerias />}
                />
                <Route
                    path="/fotos/:id"
                    element={<Fotos />}
                />
            </Routes>

        </BrowserRouter>
    )

}