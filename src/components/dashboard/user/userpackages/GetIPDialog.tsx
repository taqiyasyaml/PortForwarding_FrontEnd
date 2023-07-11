import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Theme, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useState, useContext, useEffect } from 'react'
import { AuthContext } from "../../../AuthProvider"
import config from "../../../../config"
import { Replay } from "@mui/icons-material"
interface GetIPDialogProps {
    userPackageID?: string,
    onClose?: () => void,
    afterGet?: () => void
}
const GetIPDialog = (props: GetIPDialogProps) => {
    const { t } = useTranslation(['dashboard_user_userpackages_getipdialog', 'exception'])
    const auth = useContext(AuthContext)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [serverError, setServerError] = useState<boolean>(false)
    const [formError, setFormError] = useState<any>(undefined)

    useEffect(() => {
        setFormError(undefined)
    }, [props?.userPackageID])

    const onGetIPButtonClick = async () => {
        if ((auth?.jwt ?? "").length === 0) {
            setServerError(true)
            return
        }
        setServerError(false)
        setFormError(undefined)
        setIsLoading(true)
        try {
            const res = await fetch(config.BACKEND_URL + '/api/v1/user/user_package/' + encodeURI(props?.userPackageID ?? "") + '/get_ip', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${auth?.jwt ?? ""}`
                }
            })
            await auth.fetchResMiddleware(res)
            const res_js = await res.json()
            setIsLoading(false)
            if (res_js?.http_code === 202) {
                if (props?.afterGet !== undefined) props.afterGet()
                else if (props?.onClose !== undefined) props.onClose()
            } else if (res_js?.http_code === 400 && typeof res_js?.data === 'object')
                setFormError(res_js?.data)
            else setServerError(true)
        } catch (error) {
            console.log(error)
            setServerError(true)
            setIsLoading(false)
        }
    }

    return (<Dialog open={typeof props?.userPackageID === 'string' && props.userPackageID.length > 0} onClose={isLoading === true ? undefined : props?.onClose}>
        <DialogTitle>{t('dashboard_user_userpackages_getipdialog:GetIPDialogTitle')}</DialogTitle>
        <DialogContent>
            <DialogContentText sx={{ display: 'inline' }}>
                {t('dashboard_user_userpackages_getipdialog:MessagePrefixDialogContentText') + ' '}
                <Typography fontWeight={(t: Theme) => t.typography.fontWeightMedium} display="inline">
                    {props?.userPackageID ?? ""}
                </Typography>
                {' ' + t('dashboard_user_userpackages_getipdialog:MessagePostfixDialogContentText')}
            </DialogContentText>
            {typeof formError === 'object' && formError !== null &&
                <DialogContentText
                    sx={{ mt: 0.1, color: 'error.main', textAlign: 'center' }}
                >
                    {Object.entries(formError).filter(v => typeof v[1] === 'string').map(v => t([`exception:${v[1]}`, 'SomethingError'])).join(', ')}
                </DialogContentText>
            }
        </DialogContent>
        <DialogActions>
            <Button onClick={isLoading === true ? undefined : props?.onClose}>{t('dashboard_user_userpackages_getipdialog:CloseButtonDialogActions')}</Button>
            {isLoading === true ? (
                <Button disabled><CircularProgress size={15} /></Button>
            ) : (
                <Button
                    onClick={onGetIPButtonClick}
                    color={serverError === true ? "warning" : "primary"}
                    endIcon={serverError === true && (<Replay />)}
                >{t('dashboard_user_userpackages_getipdialog:SubmitButtonDialogActions')}</Button>
            )}
        </DialogActions>
    </Dialog >)
}
export default GetIPDialog