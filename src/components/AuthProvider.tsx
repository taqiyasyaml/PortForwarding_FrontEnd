import React, { useContext, createContext, useState, useEffect } from 'react'
import jwt_decode from 'jwt-decode'
import config from '../config'
interface TokenJWT {
    jwt?: string,
    user_id?: string,
    name?: string,
    email?: string,
    phone?: string
    role?: "admin" | "user",
    ip_agent_md5?: string,
    session_id?: string,
    otp?: 'wa' | 'email' | false,
    exp?: number
}

interface IAuthContext extends TokenJWT {
    checkValidRole: (role?: TokenJWT['role']) => boolean,
    login: (newJWT: string) => boolean,
    logout: () => Promise<boolean>
    fetchResMiddleware: (res: Response, isLoader?: boolean) => Promise<void>,
}
const AuthContext = createContext<IAuthContext>({
    checkValidRole: () => false,
    login: () => false,
    logout: async () => false,
    fetchResMiddleware: async (res: Response, isLoader: boolean = false) => { }
})

interface AuthProviderProps {
    children: React.ReactNode
}
const AuthProvider = (p: AuthProviderProps) => {
    const [jwtToken, setJWTToken] = useState<TokenJWT>({})

    const checkJWTstorage = (): boolean => {
        const tmp_jwt = window.localStorage.getItem('jwt')
        if (typeof tmp_jwt !== 'string' || tmp_jwt.length === 0) {
            setJWTToken({})
            return false
        }
        try {
            setJWTToken({
                ...(jwt_decode(tmp_jwt) as TokenJWT), jwt: tmp_jwt
            })
            return true
        } catch (error) {
            console.log(error)
            window.localStorage.removeItem('jwt')
            return false
        }
    }

    const checkValidRole = (role?: TokenJWT['role']): boolean => {
        const validAllRole: boolean = (jwtToken?.user_id ?? "").length > 0 && (jwtToken?.session_id ?? "").length > 0 && jwtToken?.otp === false
        return role === undefined ? validAllRole : (validAllRole && jwtToken?.role === role)
    }
    const login = (newJWT: string): boolean => {
        window.localStorage.setItem('jwt', newJWT)
        return checkJWTstorage()
    }
    const private_logout = (): boolean => {
        window.localStorage.removeItem('jwt')
        return checkJWTstorage()
    }
    const logout = async (): Promise<boolean> => {
        if (checkValidRole()) {
            const res = await fetch(config.BACKEND_URL + '/api/v1/auth/logout', { method: 'post', headers: { 'Authorization': `Bearer ${jwtToken?.jwt ?? ""}` } })
            if ((res.status >= 200 && res.status < 300) || res.status === 401 || res.status === 403)
                return private_logout()
            else {
                const res_js = await res.json()
                if ((res_js?.http_code >= 200 && res_js?.http_code < 300) || res_js?.http_code === 401 || res_js?.http_code === 403)
                    return private_logout()
                else return false
            }
        } else return private_logout()
    }
    const fetchResMiddleware = async (res: Response, isLoader: boolean = false) => {
        try {
            if (res.status === 401 && typeof jwtToken?.jwt === 'string' && jwtToken.jwt.length > 0) {
                await logout()
                if (isLoader === true) throw new Response("", { status: 401, statusText: "Unauthorized" })
                return
            } else if (res.status === 403 && isLoader === true) throw new Response("", { status: 403, statusText: "Forbidden" })
            const res_js = await res.clone().json()
            if (res_js?.http_code === 401 && typeof jwtToken?.jwt === 'string' && jwtToken.jwt.length > 0) {
                await logout()
                if (isLoader === true) throw new Response("", { status: 401, statusText: "Unauthorized" })
                return
            } else if (res.status === 403 && isLoader === true) throw new Response("", { status: 403, statusText: "Forbidden" })
            else if (typeof res_js?.jwt_new === 'string' && res_js.jwt_new.length > 0) {
                login(res_js.jwt_new)
                return
            }
        } catch (error) {

        }
    }

    useEffect(() => {
        checkJWTstorage()
    }, [])

    return (<AuthContext.Provider value={{
        ...jwtToken, checkValidRole, login, logout, fetchResMiddleware
    }}>{p.children}</AuthContext.Provider>)
}
export default AuthProvider
export type { TokenJWT, IAuthContext }
export { AuthContext }