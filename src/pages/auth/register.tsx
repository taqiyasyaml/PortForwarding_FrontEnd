import { useState, useEffect, Suspense } from 'react'
import { AccountCircleOutlined, Replay } from "@mui/icons-material"
import { Avatar, CardContent, TextField, Button, Typography, FormControlLabel, Checkbox, CircularProgress } from "@mui/material"
import { useTranslation } from 'react-i18next'
import { Link } from "react-router-dom"
import { StringErrCode } from '../../helper/exception'
import emailvalidator from '../../helper/emailvalidator'
import phonevalidator from '../../helper/phonevalidator'
import OTP from '../../components/auth/OTP'
import config from '../../config'
import JSONtoQueryRequest from '../../helper/jsonqueryrequest'

interface RegisterFormBody {
    name?: string,
    email?: string,
    phone?: string,
    password?: string,
    repassword?: string,
}
interface RegisterFormField {
    name?: string,
    email: string,
    phone?: string,
    password: string,
    repassword: string,
    risk: boolean
}
interface RegisterFormFieldError {
    name?: StringErrCode,
    email?: StringErrCode,
    phone?: StringErrCode,
    password?: StringErrCode,
    repassword?: StringErrCode,
    risk?: boolean
}

const validateFormField = (data: RegisterFormField): { isErr: boolean, err: RegisterFormFieldError, body: RegisterFormBody } => {
    let isErr: boolean = false
    let err: RegisterFormFieldError = {}
    const body: RegisterFormBody = {}
    if ((data?.name ?? "").length > 0)
        body.name = data.name
    if (data.email.length === 0) {
        isErr = true
        err.email = 'EmailEmpty'
    } else if (!emailvalidator(data.email)) {
        isErr = true
        err.email = 'EmailFormatInvalid'
    } else body.email = data.email.toLowerCase()
    if ((data?.phone ?? "").length > 0) {
        if (!phonevalidator(data.phone ?? "")) {
            isErr = true
            err.phone = 'PhoneFormatInvalid'
        } else body.phone = (data.phone ?? "").replace(/[ +\(\).-]/g, "")
    }
    if ((data.password ?? "").length === 0) {
        isErr = true
        err.password = 'EmptyPassword'
    } else body.password = data.password
    if (data.repassword !== undefined && data.repassword !== data.password) {
        isErr = true
        err.repassword = 'UnequalPassword'
    } else body.repassword = data.repassword
    err.risk = !data.risk
    isErr = isErr || err.risk
    return { isErr, err, body }
}

const Component = () => {
    const { t } = useTranslation(['translation', 'exception', 'auth_register'])
    const [formField, setFormField] = useState<RegisterFormField>({
        email: "",
        password: "",
        repassword: "",
        risk: false
    })
    const [formFieldError, setFormFieldErr] = useState<RegisterFormFieldError>({})
    const [isLoadingState, setLoadingState] = useState<boolean>(false)
    const [isServerError, setServerError] = useState<boolean>(false)
    const [jwtOTP, setJWTotp] = useState<string | undefined>()

    useEffect(() => {
        document.title = `${t('auth_register:PageTitle')} | ${config.APP_NAME}`
        return () => { document.title = config.APP_NAME }
    }, [])
    useEffect(() => {
        if (Object.keys(formFieldError).length > 0)
            setFormFieldErr({})
        if (isServerError === true)
            setServerError(false)
    }, [formField])

    const onSignUpButtonClick = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
        const valid = validateFormField(formField)
        if (valid.isErr === true) {
            setFormFieldErr(valid.err)
            return
        }
        setLoadingState(true)
        setServerError(false)
        try {
            const res = await (await fetch(`${config.BACKEND_URL}/api/v1/auth/register`, {
                method: 'post',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: JSONtoQueryRequest(valid.body)
            })).json()
            if (res?.http_code === 200 && res?.req === 'otp')
                setJWTotp(res?.jwt_new ?? "")
            else if (res?.http_code === 400 && typeof res?.data === 'object')
                setFormFieldErr((res?.data ?? {}) as RegisterFormFieldError)
            else setServerError(true)
        } catch (error) {
            console.log(error)
            setServerError(true)
        }
        setLoadingState(false)
    }

    return (<CardContent>
        <Avatar sx={{ mx: 'auto', my: 1 }}><AccountCircleOutlined /></Avatar>
        <TextField
            label={t('auth_register:NameTextFieldLabel')}
            value={formField.name ?? ""}
            onChange={e => setFormField(v => ({ ...v, name: e.target.value }))}
            error={typeof formFieldError?.name === 'string' && formFieldError.name.length > 0}
            helperText={typeof formFieldError?.name === 'string' && formFieldError.name.length > 0 && t([`exception:${formFieldError.name}`, 'SomethingError'])}
            autoComplete="name"
            margin="dense"
            variant="outlined"
            fullWidth
        />
        <TextField
            label={t('auth_register:EmailTextFieldLabel')}
            value={formField.email}
            onChange={e => setFormField(v => ({ ...v, email: e.target.value }))}
            error={typeof formFieldError?.email === 'string' && formFieldError.email.length > 0}
            helperText={typeof formFieldError?.email === 'string' && formFieldError.email.length > 0 && t([`exception:${formFieldError.email}`, 'SomethingError'])}
            autoComplete="email"
            margin="dense"
            variant="outlined"
            fullWidth
        />
        <TextField
            label={t('auth_register:PhoneTextFieldLabel')}
            value={formField.phone ?? ""}
            onChange={e => setFormField(v => ({ ...v, phone: e.target.value }))}
            error={typeof formFieldError?.phone === 'string' && formFieldError.phone.length > 0}
            helperText={typeof formFieldError?.phone === 'string' && formFieldError.phone.length > 0 && t([`exception:${formFieldError.phone}`, 'SomethingError'])}
            autoComplete="tel"
            margin="dense"
            variant="outlined"
            fullWidth
        />
        <TextField
            label={t('auth_register:PasswordTextFieldLabel')}
            value={formField.password}
            onChange={e => setFormField(v => ({ ...v, password: e.target.value }))}
            error={typeof formFieldError?.password === 'string' && formFieldError.password.length > 0}
            helperText={typeof formFieldError?.password === 'string' && formFieldError.password.length > 0 && t([`exception:${formFieldError.password}`, 'SomethingError'])}
            type="password"
            autoComplete="new-password"
            margin="dense"
            variant="outlined"
            fullWidth
        />
        <TextField
            label={t('auth_register:RePasswordTextFieldLabel')}
            value={formField.repassword}
            onChange={e => setFormField(v => ({ ...v, repassword: e.target.value }))}
            error={typeof formFieldError?.repassword === 'string' && formFieldError.repassword.length > 0}
            helperText={typeof formFieldError?.repassword === 'string' && formFieldError.repassword.length > 0 && t([`exception:${formFieldError.repassword}`, 'SomethingError'])}
            type="password"
            autoComplete="new-password"
            margin="dense"
            variant="outlined"
            fullWidth
        />
        <FormControlLabel
            control={<Checkbox color={formFieldError?.risk === true ? 'error' : undefined} checked={formField.risk} onChange={(e, c) => setFormField(v => ({ ...v, risk: c }))} />}
            label={<Typography color={formFieldError?.risk === true ? 'error' : undefined}>{t('auth_register:RiskCheckbox')}</Typography>}
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
                    onClick={onSignUpButtonClick}
                >{t('auth_register:SignUpButton')}</Button>
            )
        }
        <Link to='/auth/login' style={{ textDecoration: 'none' }}><Typography sx={{ textAlign: 'right' }} color='secondary.main'>{t('auth_register:SignInLink')}</Typography></Link>
        <Link to='/' style={{ textDecoration: 'none' }}><Typography sx={{ textAlign: 'center', mt: 1 }} color='primary.main'>{config.DOMAIN_MAIN}</Typography></Link>
        <Typography sx={{ textAlign: 'center', mt: 1 }}>{t('auth_register:Copyright')}</Typography>
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