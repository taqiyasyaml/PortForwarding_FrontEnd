import { useEffect, useState, lazy, Suspense, useContext } from "react"
import { LockOutlined, Replay } from "@mui/icons-material"
import { Avatar, CardContent, TextField, Button, Typography, CircularProgress } from "@mui/material"
import { useTranslation } from 'react-i18next'
import { Link } from "react-router-dom"
import { StringErrCode } from "../../helper/exception"
import emailvalidator from "../../helper/emailvalidator"
import phonevalidator from "../../helper/phonevalidator"
import { AuthContext } from "../../components/AuthProvider"
import config from "../../config"
import JSONtoQueryRequest from "../../helper/jsonqueryrequest"

const OTP = lazy(() => import('./../../components/auth/OTP'))

interface LoginFormBody {
    user?: string,
    password?: string
}
interface LoginFormField {
    user: string,
    password: string
}
interface LoginFormFieldError {
    user?: StringErrCode,
    password?: StringErrCode
}

const validateFormField = (data: LoginFormField): { isErr: boolean, err: LoginFormFieldError, body: LoginFormBody } => {
    let isErr: boolean = false
    let err: LoginFormFieldError = {}
    const body: LoginFormBody = {}
    if (data.user.length === 0) {
        isErr = true
        err.user = 'EmptyUser'
    } else if (!emailvalidator(data.user) && !phonevalidator(data.user)) {
        isErr = true
        err.user = 'InvalidUser'
    } else body.user = data.user
    if ((data.password ?? "").length === 0) {
        isErr = true
        err.password = 'EmptyPassword'
    } else body.password = data.password
    return { isErr, err, body }
}

const Component = () => {
    const auth = useContext(AuthContext)
    const { t } = useTranslation(['translation', 'exception', 'auth_login'])
    const [formField, setFormField] = useState<LoginFormField>({
        user: "",
        password: ""
    })
    const [formFieldError, setFormFieldErr] = useState<LoginFormFieldError>({})
    const [isLoadingState, setLoadingState] = useState<boolean>(false)
    const [isServerError, setServerError] = useState<boolean>(false)
    const [jwtOTP, setJWTotp] = useState<string | undefined>()

    useEffect(() => {
        document.title = `${t('auth_login:PageTitle')} | ${config.APP_NAME}`
        return () => { document.title = config.APP_NAME }
    }, [])
    useEffect(() => {
        if (Object.keys(formFieldError).length > 0)
            setFormFieldErr({})
        if (isServerError === true)
            setServerError(false)
    }, [formField])

    const onSignInButtonClick = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
        const valid = validateFormField(formField)
        if (valid.isErr === true) {
            setFormFieldErr(valid.err)
            return
        }
        setLoadingState(true)
        try {
            const res = await (await fetch(`${config.BACKEND_URL}/api/v1/auth/login`, {
                method: 'post',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: JSONtoQueryRequest(valid.body)
            })).json()
            setServerError(false)
            if (res?.http_code === 200 && res?.req === 'otp')
                setJWTotp(res?.jwt_new)
            else if (res?.http_code === 200 && res?.req === 'login') {
                auth.login(res?.jwt_new ?? "")
            } else if (res?.http_code === 400 && typeof res?.data === 'object')
                setFormFieldErr((res?.data ?? {}) as LoginFormFieldError)
            else setServerError(true)
        } catch (error) {
            console.log(error)
            setServerError(true)
        }
        setLoadingState(false)
    }


    return (<CardContent>
        <Avatar sx={{ mx: 'auto', my: 1 }}><LockOutlined /></Avatar>
        <TextField
            label={t('auth_login:UserTextFieldLabel')}
            value={formField.user}
            onChange={e => setFormField(v => ({ ...v, user: e.target.value }))}
            error={typeof formFieldError?.user === 'string' && formFieldError.user.length > 0}
            helperText={typeof formFieldError?.user === 'string' && formFieldError.user.length > 0 && t([`exception:${formFieldError.user}`, 'SomethingError'])}
            autoComplete="email"
            margin="normal"
            variant="outlined"
            fullWidth
        />
        <TextField
            label={t('auth_login:PasswordTextFieldLabel')}
            value={formField.password}
            onChange={e => setFormField(v => ({ ...v, password: e.target.value }))}
            error={typeof formFieldError?.password === 'string' && formFieldError.password.length > 0}
            helperText={typeof formFieldError?.password === 'string' && formFieldError.password.length > 0 && t([`exception:${formFieldError.password}`, 'SomethingError'])}
            type="password"
            autoComplete="current-password"
            margin="normal"
            variant="outlined"
            fullWidth
        />
        {
            isLoadingState === true ? (
                <Button
                    sx={{ mt: 3, mb: 2 }}
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled
                ><CircularProgress /></Button>
            ) : (
                <Button
                    sx={{ mt: 3, mb: 2 }}
                    fullWidth
                    variant="contained"
                    color={isServerError === true ? "warning" : "primary"}
                    endIcon={isServerError === true ? <Replay /> : null}
                    onClick={onSignInButtonClick}
                >{t('auth_login:SignInButton')}</Button>
            )
        }
        <Link to='/auth/register' style={{ textDecoration: 'none' }}><Typography sx={{ textAlign: 'right' }} color='secondary.main'>{t('auth_login:SignUpLink')}</Typography></Link>
        <Link to='/' style={{ textDecoration: 'none' }}><Typography sx={{ textAlign: 'center', mt: 1 }} color='primary.main'>{config.DOMAIN_MAIN}</Typography></Link>
        <Typography sx={{ textAlign: 'center' }}>{t('auth_login:Copyright')}</Typography>
        {
            typeof jwtOTP === 'string' && jwtOTP.length > 0 &&
            (<Suspense>
                <OTP
                    otpJWT={jwtOTP}
                    onClose={() => setJWTotp(undefined)}
                    onJWTerror={() => {
                        setServerError(true)
                        setJWTotp(undefined)
                    }}
                />
            </Suspense>)
        }
    </CardContent>)
}

export { Component }