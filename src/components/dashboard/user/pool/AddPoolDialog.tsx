import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useState, useContext, useEffect } from 'react'
import { AuthContext } from "../../../AuthProvider"
import config from "../../../../config"
import JSONtoQueryRequest from "../../../../helper/jsonqueryrequest"
import { Replay } from "@mui/icons-material"
interface AddPoolDialogProps {
    open?: boolean,
    onClose?: () => void,
    afterAdd?: () => void
}
const AddPoolDialog = (props: AddPoolDialogProps) => {
    const { t } = useTranslation(['dashboard_user_pool_adddialog', 'exception'])
    const auth = useContext(AuthContext)
    const [poolName, setPoolName] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [serverError, setServerError] = useState<boolean>(false)

    useEffect(() => {
        setPoolName("")
    }, [props?.open])

    const onAddButtonClick = async () => {
        if ((auth?.jwt ?? "").length === 0) {
            setServerError(true)
            return
        }
        setServerError(false)
        setIsLoading(true)
        try {
            const res = await fetch(config.BACKEND_URL + '/api/v1/user/pool/create', {
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
            if (res_js?.http_code === 201) {
                if (props?.afterAdd !== undefined) props.afterAdd()
                else if (props?.onClose !== undefined) props.onClose()
            } else setServerError(true)
        } catch (error) {
            console.log(error)
            setServerError(true)
            setIsLoading(false)
        }
    }

    return (<Dialog open={props?.open === true} onClose={isLoading === true ? undefined : props?.onClose}>
        <DialogTitle>{t('dashboard_user_pool_adddialog:AddPoolDialogTitle')}</DialogTitle>
        <DialogContent>
            <TextField
                label={t('dashboard_user_pool_adddialog:PoolNameTextFieldLabel')}
                value={poolName}
                onChange={e => setPoolName(e.target.value)}
                fullWidth
                margin="dense"
                autoFocus
                autoComplete="off"
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={isLoading === true ? undefined : props?.onClose}>{t('dashboard_user_pool_adddialog:CloseButtonDialogActions')}</Button>
            {isLoading === true ? (
                <Button disabled><CircularProgress size={15} /></Button>
            ) : (
                <Button
                    onClick={onAddButtonClick}
                    color={serverError === true ? "warning" : "primary"}
                    endIcon={serverError === true && (<Replay />)}
                >{t('dashboard_user_pool_adddialog:SubmitButtonDialogActions')}</Button>
            )}
        </DialogActions>
    </Dialog >)
}
export default AddPoolDialog