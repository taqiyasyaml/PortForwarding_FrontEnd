import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Theme, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useState, useContext, useEffect } from 'react'
import { AuthContext } from "../../../AuthProvider"
import config from "../../../../config"
import { Replay } from "@mui/icons-material"
interface DeletePoolDialogProps {
    userPackageID?: string,
    onClose?: () => void,
    afterDelete?: () => void
}
const DeletePoolDialog = (props: DeletePoolDialogProps) => {
    const { t } = useTranslation(['dashboard_user_userpackages_deletepooldialog', 'exception'])
    const auth = useContext(AuthContext)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [serverError, setServerError] = useState<boolean>(false)

    const onDeleteButtonClick = async () => {
        if ((auth?.jwt ?? "").length === 0) {
            setServerError(true)
            return
        }
        setServerError(false)
        setIsLoading(true)
        try {
            const res = await fetch(config.BACKEND_URL + '/api/v1/user/user_package/' + encodeURI(props?.userPackageID ?? "") + '/set_pool', {
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
                if (props?.afterDelete !== undefined) props.afterDelete()
                else if (props?.onClose !== undefined) props.onClose()
            } else setServerError(true)
        } catch (error) {
            console.log(error)
            setServerError(true)
            setIsLoading(false)
        }
    }

    return (<Dialog open={typeof props?.userPackageID === 'string' && props.userPackageID.length > 0} onClose={isLoading === true ? undefined : props?.onClose}>
        <DialogTitle>{t('dashboard_user_userpackages_deletepooldialog:DeletePoolDialogTitle')}</DialogTitle>
        <DialogContent>
            <DialogContentText sx={{ display: 'inline' }}>
                {t('dashboard_user_userpackages_deletepooldialog:MessagePrefixDialogContentText') + ' '}
                <Typography fontWeight={(t: Theme) => t.typography.fontWeightMedium} display="inline">
                    {props?.userPackageID ?? ""}
                </Typography>
                {' ' + t('dashboard_user_userpackages_deletepooldialog:MessagePostfixDialogContentText')}
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={isLoading === true ? undefined : props?.onClose}>{t('dashboard_user_userpackages_deletepooldialog:CloseButtonDialogActions')}</Button>
            {isLoading === true ? (
                <Button disabled><CircularProgress size={15} /></Button>
            ) : (
                <Button
                    onClick={onDeleteButtonClick}
                    color={serverError === true ? "warning" : "primary"}
                    endIcon={serverError === true && (<Replay />)}
                >{t('dashboard_user_userpackages_deletepooldialog:SubmitButtonDialogActions')}</Button>
            )}
        </DialogActions>
    </Dialog >)
}
export default DeletePoolDialog