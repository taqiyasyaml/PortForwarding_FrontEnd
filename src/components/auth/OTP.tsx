import { Box, Button, ButtonBase, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, ModalProps, Typography } from "@mui/material"
import { useContext, useEffect, useState } from 'react'
import OTPTextField from "./OTPTextField"
import { Replay } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { AuthContext, TokenJWT } from "../AuthProvider"
import jwt_decode from 'jwt-decode'
import { StringErrCode } from "../../helper/exception"
import config from "../../config"
import JSONtoQueryRequest from "../../helper/jsonqueryrequest"
interface OTPprops {
    otpJWT?: string,
    onClose?: () => void,
    onJWTerror?: (error?: any) => void
}
const OTP = (props: OTPprops) => {
    const { t } = useTranslation(['translation', 'exception', 'auth_otp'])
    const auth = useContext(AuthContext)
    const [leftExp, setLeftExp] = useState<number>(0)
    const [JWTprop, setJWTprop] = useState<string>(props?.otpJWT ?? "")
    const [JWTstr, setJWTstr] = useState<string>(props?.otpJWT ?? "")
    const [JWTdata, setJWTdata] = useState<TokenJWT | undefined>()
    const [OTPerr, setOTPerr] = useState<StringErrCode | undefined>()
    const [OTPVal, setOTPVal] = useState<string>("")

    const [isLoadingResendOTP, setLoadingResendOTP] = useState<boolean>(false)
    const [isErrorResendOTP, setErrorResendOTP] = useState<boolean>(false)
    const [isLoadingSubmitOTP, setLoadingSubmitOTP] = useState<boolean>(false)
    const [isErrorSubmitOTP, setErrorSubmitOTP] = useState<boolean>(false)

    useEffect(() => {
        const countdown_exp = setInterval(
            () => setLeftExp((JWTdata?.exp ?? 0) > 0 ? Math.max(((JWTdata?.exp ?? 0) * 1000) - new Date().getTime(), 0) : 0)
            , 1000
        )
        return () => clearInterval(countdown_exp)
    }, [JWTdata?.exp])
    useEffect(() => {
        if (JWTprop !== props?.otpJWT) {
            setOTPVal("")
            setJWTprop(props?.otpJWT ?? "")
            setJWTstr(props?.otpJWT ?? "")
        }
    }, [props?.otpJWT])
    useEffect(() => {
        if (JWTstr.length === 0) setJWTdata(undefined)
        else {
            try {
                setJWTdata({
                    ...(jwt_decode(JWTstr) as TokenJWT), jwt: JWTstr
                })
            } catch (error) {
                if (typeof props?.onJWTerror === 'function') props.onJWTerror(error)
                else console.log(error)
                setJWTdata(undefined)
            }
        }
    }, [JWTstr])

    const onResendOTPButtonClick = async () => {
        if ((JWTdata?.jwt ?? "").length === 0) return
        setErrorResendOTP(false)
        setLoadingResendOTP(true)
        try {
            const res = await (await fetch(`${config.BACKEND_URL}/api/v1/auth/otp/new`, {
                method: 'get',
                headers: { 'Authorization': `Bearer ${JWTdata?.jwt ?? ""}` }
            })).json()
            if (res?.http_code === 200 && res?.req === 'otp')
                setJWTstr(res?.jwt_new ?? "")
            else if (res?.http_code === 401 || res?.http_code === 403) {
                setJWTstr('')
                if (typeof props?.onJWTerror === 'function') props.onJWTerror()
            } else setErrorResendOTP(true)
        } catch (error) {
            console.log(error)
            setErrorResendOTP(true)
        }
        setLoadingResendOTP(false)
    }

    const submitOTP = async (otp: string) => {
        if (otp.length === 0) {
            setOTPerr("EmptyOTP")
            return
        } else setOTPerr(undefined)
        setLoadingSubmitOTP(true)
        setErrorSubmitOTP(false)
        try {
            const res = await (await fetch(`${config.BACKEND_URL}/api/v1/auth/otp/login`, {
                method: 'post',
                headers: {
                    'Authorization': `Bearer ${JWTdata?.jwt ?? ""}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: JSONtoQueryRequest({ otp })
            })).json()
            if (res?.http_code === 200 && res?.req === 'otp')
                setJWTstr(res?.jwt_new ?? "")
            else if (res?.http_code === 200 && res?.req === 'login') {
                auth.login(res?.jwt_new ?? "")
                if (typeof props?.onClose === 'function') props.onClose()
            } else if (res?.http_code === 400) {
                setOTPerr(res?.data?.otp as StringErrCode)
                setOTPVal("")
            } else if (res?.http_code === 401 || res?.http_code === 403) {
                setJWTstr('')
                if (typeof props?.onJWTerror === 'function') props.onJWTerror()
            } else setErrorSubmitOTP(true)
        } catch (error) {
            console.log(error)
            setErrorSubmitOTP(true)
        }
        setLoadingSubmitOTP(false)
        return
    }
    return (<Dialog
        open={
            typeof JWTdata?.user_id === 'string' && JWTdata.user_id.length > 0 &&
            (JWTdata?.otp === 'email' || JWTdata?.otp === 'wa')
        }
        sx={{ backdropFilter: 'blur(2px)' }}
        onClose={
            isLoadingSubmitOTP === true || isLoadingResendOTP === true ?
                undefined : props?.onClose
        }
    >
        <DialogTitle>{t('auth_otp:OTPTitle')}</DialogTitle>
        <DialogContent>
            {JWTdata?.otp === 'email' &&
                (<DialogContentText>{t('auth_otp:EmailFormat')} <strong>({JWTdata?.email ?? ""})</strong></DialogContentText>)
            }
            {JWTdata?.otp === 'wa' &&
                (<DialogContentText>{t('auth_otp:WAFormat')} <strong>({JWTdata?.phone ?? ""})</strong></DialogContentText>)
            }
            <OTPTextField
                length={6}
                onValueChange={v => setOTPVal(v)}
                onValueComplete={v => submitOTP(v)}
                value={OTPVal}
                errorTextField={typeof OTPerr === 'string' && OTPerr.length > 0}
                helperText={typeof OTPerr === 'string' && OTPerr.length > 0 && t([`exception:${OTPerr}`, 'SomethingError'])}
                numeric
                autofocusTextField
                marginTextField="normal"
            />
            <Typography align="center"><b>{Math.floor(leftExp / 60_000).toString().padStart(2, '0')}:{Math.floor((leftExp % 60_000) / 1000).toString().padStart(2, '0')}</b></Typography>
            {
                isLoadingResendOTP === true ? (
                    <Box sx={{ textAlign: 'center' }}>
                        <ButtonBase onClick={onResendOTPButtonClick}>
                            <Typography color={'primary.main'} align="center">{t('auth_otp:ResendOTPButton')}</Typography>
                            <CircularProgress size={15} sx={{ color: 'text.primary', ml: 1 }} />
                        </ButtonBase>
                    </Box>
                ) : (
                    <Box sx={{ textAlign: 'center' }}>
                        <ButtonBase onClick={onResendOTPButtonClick}>
                            <Typography color={isErrorResendOTP === true ? 'warning.main' : 'primary.main'} align="center">{t('auth_otp:ResendOTPButton')}</Typography>
                            {isErrorResendOTP && (<Replay sx={{ color: 'text.secondary', ml: 1 }} />)}
                        </ButtonBase>
                    </Box>
                )
            }
        </DialogContent>
        <DialogActions>
            <Button onClick={
                isLoadingSubmitOTP === true || isLoadingResendOTP === true ?
                    undefined : props?.onClose
            }>
                {t('auth_otp:CloseButton')}
            </Button>
            {
                isLoadingSubmitOTP === true ?
                    (<Button disabled><CircularProgress size={15} /></Button>) :
                    (<Button
                        onClick={isLoadingResendOTP === true ? undefined : () => submitOTP(OTPVal)}
                        color={isErrorSubmitOTP === true ? 'warning' : 'primary'}
                        endIcon={isErrorSubmitOTP === true && (<Replay />)}
                    >{t('auth_otp:SubmitButton')}</Button>)
            }
        </DialogActions>
    </Dialog>)
}
export default OTP