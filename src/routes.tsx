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
            </Routes>

        </BrowserRouter>
    )

}