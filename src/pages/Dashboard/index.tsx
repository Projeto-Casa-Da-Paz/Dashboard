import { useEffect } from "react";
import { LayoutDashboard } from "../../components/LayoutDashboard";
import { verificaTokenExpirado } from "../../services/token";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    
    const navigate = useNavigate()

    // Inicio, Update State, Destruir
    useEffect(() => {
        
        if (localStorage.length == 0 || verificaTokenExpirado()) {
            navigate("/")
        }

    }, [])

    return(
        <LayoutDashboard>
            <h1>Graficos</h1>
        </LayoutDashboard>
    )
}
