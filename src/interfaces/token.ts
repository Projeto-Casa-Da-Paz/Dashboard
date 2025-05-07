export interface IToken {
    access_token: string
    user: {
        id: number
        nome: string
        email: string
        isAdmin: boolean,
        isUser: boolean
    }
}