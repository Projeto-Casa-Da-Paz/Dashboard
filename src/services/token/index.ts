import { jwtDecode } from "jwt-decode"
import { IToken } from "../../interfaces/token"

export const verificaTokenExpirado = () => {
    let lsStorage = localStorage.getItem('casadapaz.token')

    let token: IToken | null = null

    if (typeof lsStorage === 'string') {
        token = JSON.parse(lsStorage)
    }

    if (token) {
        console.log("deu bom")
        //console.log(token.access_token)
        let decodedToken = jwtDecode(token.accessToken)
        console.log("aqui foi")

        if (
            !decodedToken.exp
            ||
            decodedToken.exp < new Date().getTime() / 1000
        ) {

            return true

        }
        return false
    }

}