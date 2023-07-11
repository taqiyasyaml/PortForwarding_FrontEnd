import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useState, useContext, useEffect } from 'react'
import { AuthContext } from "../../../AuthProvider"
import config from "../../../../config"
import JSONtoQueryRequest from "../../../../helper/jsonqueryrequest"
import { Replay } from "@mui/icons-material"
interface EditPoolDialogProps {
    poolID?: string,
    poolName?: string,
    onClose?: () => void,
    afterEdit?: () => void
}
const EditPoolDialog = (props: EditPoolDialogProps) => {
    const { t } = useTranslation(['dashboard_user_pool_editdialog', 'exception'])
    const auth = useContext(AuthContext)
    const [poolName, setPoolName] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [serverError, setServerError] = useState<boolean>(false)

    useEffect(
        () => setPoolName((typeof props?.poolName === 'string' && props.poolName.length > 0) ? props.poolName : (props?.poolID ?? ""))
        , [props?.poolName]
    )

    const onEditButtonClick = async () => {
        if ((auth?.jwt ?? "").length === 0) {
            setServerError(true)
            return
        }
        setServerError(false)
        setIsLoading(true)
        try {
            const res = await fetch(config.BACKEND_URL + '/api/v1/user/pool/' + encodeURI(props?.poolID ?? "") + '/edit', {
                method: 'post',
                body: JSONtoQueryRequest({ pool_name: poolName }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${auth?.jwt ?? ""}`
                }
            })
            await auth.fetchResMiddleware(res)
            const res_js = await res.json()
            setIsLoading(false)
            if (res_js?.http_code === 202) {
                if (props?.afterEdit !== undefined) props.afterEdit()
                else if (props?.onClose !== undefined) props.onClose()
            } else setServerError(true)
        } catch (error) {
            console.log(error)
            setServerError(true)
            setIsLoading(false)
        }
    }

    return (<Dialog open={typeof props?.poolID === 'string' && props.poolID.length > 0} onClose={isLoading === true ? undefined : props?.onClose}>
        <DialogTitle>{t('dashboard_user_pool_editdialog:EditPoolDialogTitle')}</DialogTitle>
        <DialogContent>
            <TextField
                label={t('dashboard_user_pool_editdialog:PoolNameTextFieldLabel')}
                value={poolName}
                onChange={e => setPoolName(e.target.value)}
                fullWidth
                margin="dense"
                autoFocus
                autoComplete="off"
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={isLoading === true ? undefined : props?.onClose}>{t('dashboard_user_pool_editdialog:CloseButtonDialogActions')}</Button>
            {isLoading === true ? (
                <Button disabled><CircularProgress size={15} /></Button>
            ) : (
                <Button
                    onClick={onEditButtonClick}
                    color={serverError === true ? "warning" : "primary"}
                    endIcon={serverError === true && (<Replay />)}
                >{t('dashboard_user_pool_editdialog:SubmitButtonDialogActions')}</Button>
            )}
        </DialogActions>
    </Dialog >)
}
export default EditPoolDialog