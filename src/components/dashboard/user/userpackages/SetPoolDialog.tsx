import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from "@mui/material"
import { useState, useContext, useEffect } from 'react'
import { AuthContext } from "../../../AuthProvider"
import JSONtoQueryRequest from "../../../../helper/jsonqueryrequest"
import config from "../../../../config"
import Select2Like from "../../../Select2Like"
import { Replay } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
interface SetPoolDialogProps {
    userPackageID?: string,
    poolID?: string,
    onClose?: () => void,
    afterSet?: () => void
}

const SetPoolDialog = (props: SetPoolDialogProps) => {
    const auth = useContext(AuthContext)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isServerError, setServerError] = useState<boolean>(false)
    const [poolID, setPoolID] = useState<string>("")
    const [poolIDError, setPoolIDError] = useState<string | undefined>()
    const { t } = useTranslation(['dashboard_user_userpackage_setpooldialog', 'exception'])
    useEffect(() => {
        setPoolID(props?.poolID ?? "")
    }, [props?.userPackageID, props?.poolID])

    const onSetClick = async () => {
        if ((auth?.jwt ?? "").length === 0) {
            setServerError(true)
            return
        }
        setIsLoading(true)
        setServerError(false)
        try {
            const res = await fetch(config.BACKEND_URL + '/api/v1/user/user_package/' + encodeURI(props?.userPackageID ?? "") + '/set_pool', {
                method: 'post',
                body: JSONtoQueryRequest({ pool_uuid: poolID.length === 0 ? undefined : poolID }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${auth?.jwt ?? ""}`
                }
            })
            await auth.fetchResMiddleware(res)
            const res_js = await res.json()
            setIsLoading(false)
            if (res_js?.http_code === 202) {
                if (props?.afterSet !== undefined) props.afterSet()
                else if (props?.onClose !== undefined) props.onClose()
            } else if (res_js?.http_code === 400 && typeof res_js?.data?.pool_uuid === 'string')
                setPoolIDError(res_js?.data?.pool_uuid)
            else setServerError(true)
        } catch (error) {
            console.log(error)
            setServerError(true)
            setIsLoading(false)
        }
    }

    return (<Dialog
        open={typeof props?.userPackageID === 'string' && props.userPackageID.length > 0}
        onClose={isLoading === true ? undefined : props?.onClose}
    >
        <DialogTitle>{t('dashboard_user_userpackage_setpooldialog:SetPoolDialogTitle')}</DialogTitle>
        <DialogContent>
            <Grid container>
                <Grid item xs={12}>
                    <TextField
                        label={t('dashboard_user_userpackage_setpooldialog:UserPackageIDTextFieldLabel')}
                        value={props?.userPackageID ?? ""}
                        fullWidth
                        margin="dense"
                        disabled
                    />
                </Grid>
                <Grid item xs={12}>
                    <Select2Like
                        renderInput={(props) => <TextField
                            {...props}
                            label={t('dashboard_user_userpackage_setpooldialog:PoolUUIDTextFieldLabel')}
                            margin="dense"
                            autoComplete="off"
                            error={typeof poolIDError === 'string' && poolIDError.length > 0}
                            helperText={typeof poolIDError === 'string' && poolIDError.length > 0 && t([`exception:${poolIDError}`, 'SomethingError'])}
                        />}
                        fetchInfo={config.BACKEND_URL + '/api/v1/user/pool/select2'}
                        fetchInit={{ headers: { 'Authorization': `Bearer ${auth?.jwt ?? ""}` } }}
                        fetchMiddleware={async res => {
                            if ((auth?.jwt ?? "").length > 0) {
                                await auth.fetchResMiddleware(res)
                                return await res.json()
                            } else return {}
                        }}
                        value={poolID.length > 0 ? poolID : null}
                        onChange={s => setPoolID(v => typeof s === 'string' ? s : "")}
                        fullWidth
                    />
                </Grid>
            </Grid>
        </DialogContent>
        <DialogActions>
            <Button onClick={isLoading === true ? undefined : props?.onClose}>{t('dashboard_user_userpackage_setpooldialog:CloseButtonLabel')}</Button>
            {isLoading === true ? (
                <Button disabled><CircularProgress size={15} /></Button>
            ) : (
                <Button
                    color={isServerError === true ? "warning" : "primary"}
                    endIcon={isServerError === true && (<Replay />)}
                    onClick={onSetClick}
                >{t('dashboard_user_userpackage_setpooldialog:SubmitButtonLabel')}</Button>
            )}
        </DialogActions>
    </Dialog>)
}

export default SetPoolDialog