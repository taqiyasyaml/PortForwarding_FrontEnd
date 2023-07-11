import { Button, Card, CardActions, CardContent, CardHeader, CircularProgress, Grid, TextField } from "@mui/material"
import { CustomRouterLoaderProps } from "../../../Router"
import config from "../../../config"
import { StringErrCode } from "../../../helper/exception"
import { redirect, useLoaderData, useNavigate } from "react-router-dom"
import { useState, useContext, useEffect } from "react"
import { useTranslation } from "react-i18next"
import emailvalidator from "../../../helper/emailvalidator"
import { Replay } from "@mui/icons-material"
import { AuthContext } from "../../../components/AuthProvider"
import JSONtoQueryRequest from "../../../helper/jsonqueryrequest"
import phonevalidator from "../../../helper/phonevalidator"

interface ProfileFormBody {
    name?: string,
    email?: string,
    phone?: string,
    new_password?: string,
    password?: string,
    repassword?: string,
}
interface ProfileFormField {
    name?: string,
    email?: string,
    phone?: string,
    new_password?: string,
    repassword?: string,
    password?: string,
}
interface ProfileFormError {
    name?: StringErrCode,
    email?: StringErrCode,
    phone?: StringErrCode,
    new_password?: StringErrCode,
    password?: StringErrCode,
    repassword?: StringErrCode,
}

const validateFormField = (data: ProfileFormField, oldData?: ProfileFormField): { isErr: boolean, err: ProfileFormError, body: ProfileFormBody } => {
    let isErr: boolean = false
    let isNeedPassword: boolean = false
    let err: ProfileFormError = {}
    const body: ProfileFormBody = {}

    if (typeof data?.name === 'string')
        body.name = data.name

    if (typeof data?.email === 'string' && data.email.length > 0 && data.email !== oldData?.email) {
        isNeedPassword = true
        if (!emailvalidator(data.email)) {
            isErr = true
            err.email = "EmailFormatInvalid"
        }
    }

    if (typeof data?.phone === 'string') {
        isNeedPassword =
            isNeedPassword ||
            (data.phone.length === 0 &&
                (oldData?.phone !== null || (typeof oldData?.phone === 'string' && (oldData.phone as string).length > 0))
            ) ||
            (data.phone.length > 0 && data.phone !== oldData?.phone)
        if (data.phone.length > 0 && !phonevalidator(data.phone)) {
            isErr = true
            err.email = "EmailFormatInvalid"
        } else body.phone = data.phone
    }

    if (typeof data?.new_password === 'string' && data.new_password.length > 0) {
        isNeedPassword = true
        if (typeof data?.repassword !== 'string' || data.repassword !== data.new_password) {
            isErr = true
            err.repassword = "UnequalPassword"
        } else {
            body.new_password = data.new_password
            body.repassword = data.repassword
        }
    }

    if (isNeedPassword === true) {
        if (typeof data?.password !== 'string' || data.password.length === 0) {
            isErr = true
            err.password = "EmptyPassword"
        } else if (data.password === data.new_password) {
            isErr = true
            err.new_password = "EqualOldPassword"
        } else body.password = data.password
    }

    return { isErr, err, body }
}

const Component = () => {
    const data = useLoaderData() as ProfileFormField
    const auth = useContext(AuthContext)
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isServerError, setIsServerError] = useState<boolean>(false)
    const [formField, setFormField] = useState<ProfileFormField>(
        (data === null || typeof data !== 'object') ? {} : {
            name: typeof data?.name === 'string' ? data.name : "",
            email: typeof data?.email === 'string' ? data.email : "",
            phone: typeof data?.phone === 'string' ? data.phone : "",
        }
    )
    const [formError, setFormError] = useState<ProfileFormError | undefined>(undefined)
    const { t } = useTranslation(['dashboard_user_profile', 'exception'])

    useEffect(() => {
        document.title = `${t('dashboard_user_profile:ProfileCardTitle')} | ${config.APP_NAME}`
        return () => { document.title = config.APP_NAME }
    }, [])

    useEffect(() => {
        if (typeof formError === 'object' && Object.keys(formError).length > 0)
            setFormError({})
        if (isServerError === true) setIsServerError(false)
    }, [formField])

    const onSaveSubmitButtonOnClick = async () => {
        const valid = validateFormField(formField, data)
        if (valid.isErr === true) {
            setFormError(valid.err)
            return
        }
        if ((auth?.jwt ?? "").length === 0) {
            setIsServerError(true)
            return
        }
        setIsServerError(false)
        setIsLoading(true)
        try {
            const res = await fetch(config.BACKEND_URL + '/api/v1/user/profile', {
                method: 'post', body: JSONtoQueryRequest(valid.body), headers: {
                    'Authorization': `Bearer ${auth?.jwt ?? ""}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            await auth.fetchResMiddleware(res)
            const res_js = await res.json()
            if (res_js?.http_code === 202) {
                if (res_js?.req === 'logout') await auth.logout()
                else navigate('.', { replace: true })
            } else if (res_js?.http_code === 400 && typeof res_js?.data === 'object' && res_js.data !== null)
                setFormError((res_js?.data ?? {}) as ProfileFormError)
            else setIsServerError(true)
            setIsLoading(false)
        } catch (error) {
            console.log(error)
            setIsLoading(false)
            setIsServerError(true)
        }
    }

    return (<>
        <Grid container>
            <Grid item xs={12} sm={6}>
                <Card>
                    <CardHeader title={t('dashboard_user_profile:ProfileCardTitle')} />
                    <CardContent>
                        <TextField
                            label={t('dashboard_user_profile:NameTextFieldLabel')}
                            value={formField.name ?? ""}
                            onChange={e => setFormField(v => ({ ...v, name: e.target.value }))}
                            error={typeof formError?.name === 'string' && formError.name.length > 0}
                            helperText={typeof formError?.name === 'string' && formError.name.length > 0 && t([`exception:${formError.name}`, 'SomethingError'])}
                            autoComplete="name"
                            margin="dense"
                            variant="outlined"
                            fullWidth
                        />
                        <TextField
                            label={t('dashboard_user_profile:EmailTextFieldLabel')}
                            value={formField.email}
                            onChange={e => setFormField(v => ({ ...v, email: e.target.value }))}
                            error={typeof formError?.email === 'string' && formError.email.length > 0}
                            helperText={typeof formError?.email === 'string' && formError.email.length > 0 && t([`exception:${formError.email}`, 'SomethingError'])}
                            autoComplete="email"
                            margin="dense"
                            variant="outlined"
                            fullWidth
                        />
                        <TextField
                            label={t('dashboard_user_profile:PhoneTextFieldLabel')}
                            value={formField.phone ?? ""}
                            onChange={e => setFormField(v => ({ ...v, phone: e.target.value }))}
                            error={typeof formError?.phone === 'string' && formError.phone.length > 0}
                            helperText={typeof formError?.phone === 'string' && formError.phone.length > 0 && t([`exception:${formError.phone}`, 'SomethingError'])}
                            autoComplete="tel"
                            margin="dense"
                            variant="outlined"
                            fullWidth
                        />
                        <TextField
                            label={t('dashboard_user_profile:NewPasswordTextFieldLabel')}
                            value={formField.new_password}
                            onChange={e => setFormField(v => ({ ...v, new_password: e.target.value }))}
                            error={typeof formError?.new_password === 'string' && formError.new_password.length > 0}
                            helperText={typeof formError?.new_password === 'string' && formError.new_password.length > 0 && t([`exception:${formError.new_password}`, 'SomethingError'])}
                            type="password"
                            autoComplete="new-password"
                            margin="dense"
                            variant="outlined"
                            fullWidth
                        />
                        <TextField
                            label={t('dashboard_user_profile:RePasswordTextFieldLabel')}
                            value={formField.repassword}
                            onChange={e => setFormField(v => ({ ...v, repassword: e.target.value }))}
                            error={typeof formError?.repassword === 'string' && formError.repassword.length > 0}
                            helperText={typeof formError?.repassword === 'string' && formError.repassword.length > 0 && t([`exception:${formError.repassword}`, 'SomethingError'])}
                            type="password"
                            autoComplete="new-password"
                            margin="dense"
                            variant="outlined"
                            fullWidth
                        />
                        <TextField
                            label={t('dashboard_user_profile:OldPasswordTextFieldLabel')}
                            value={formField.password}
                            onChange={e => setFormField(v => ({ ...v, password: e.target.value }))}
                            error={typeof formError?.password === 'string' && formError.password.length > 0}
                            helperText={typeof formError?.password === 'string' && formError.password.length > 0 && t([`exception:${formError.password}`, 'SomethingError'])}
                            type="password"
                            autoComplete="current-password"
                            margin="dense"
                            variant="outlined"
                            fullWidth
                        />
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end' }}>
                        {isLoading === true ?
                            (<Button color="primary" variant="contained" disabled><CircularProgress color="inherit" size={20} /></Button>) :
                            (<Button
                                variant="contained"
                                endIcon={isServerError === true ? <Replay /> : null}
                                color={isServerError === true ? "warning" : "primary"}
                                onClick={onSaveSubmitButtonOnClick}
                            >
                                {t('dashboard_user_profile:SaveProfileButtonCardActions')}
                            </Button>)
                        }
                    </CardActions>
                </Card>
            </Grid>
        </Grid>
    </>)
}

const loader = async (props: CustomRouterLoaderProps) => {
    if (props?.auth === undefined) throw new Response("", { status: 404, statusText: "Not Found" })
    const res = await fetch(config.BACKEND_URL + '/api/v1/user/profile', { headers: { 'Authorization': `Bearer ${props.auth?.jwt ?? ""}` } })
    await props.auth.fetchResMiddleware(res, true)
    if (res.status === 401) return redirect('/auth')
    else if (res.status === 500) throw new Response("", { status: 500, statusText: "Internal Server Error" })
    const res_js = await res.json()
    if (res_js.http_code === 401) return redirect('/auth')
    else if (res_js?.http_code === 200 && res_js?.data !== null && typeof res_js?.data === 'object')
        return res_js.data
    else throw new Response("", { status: 500, statusText: "Internal Server Error" })
}

export { Component, loader }