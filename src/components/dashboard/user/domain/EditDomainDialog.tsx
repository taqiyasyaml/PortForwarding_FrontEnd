import { Replay } from "@mui/icons-material"
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, TextField } from "@mui/material"
import { useState, useContext, useEffect } from "react"
import Select2Like from "../../../Select2Like"
import config from "../../../../config"
import { AuthContext } from "../../../AuthProvider"
import { StringErrCode } from "../../../../helper/exception"
import { useTranslation } from "react-i18next"
import JSONtoQueryRequest from "../../../../helper/jsonqueryrequest"

interface EditDomainFormField {
    name?: string,
    pool_uuid: string,
    http_port?: number,
    https_port?: number
}
interface EditDomainFormBody {
    pool_uuid?: string,
    http_port?: number,
    https_port?: number
}
interface EditDomainFormError {
    pool_uuid?: StringErrCode,
    http_port?: StringErrCode,
    https_port?: StringErrCode,
}
const validateFormField = (data: EditDomainFormField, domain_count?: number): { isErr: boolean, err: EditDomainFormError, body: EditDomainFormBody } => {
    domain_count = Math.max(0, domain_count ?? 0)
    let isErr: boolean = false
    let err: EditDomainFormError = {}
    const body: EditDomainFormBody = {}

    if (data.pool_uuid.length === 0) {
        isErr = true
        err.pool_uuid = "EmptyPoolID"
    } else if (domain_count >= config.DOMAIN_MAX_CLIENT) {
        isErr = true
        err.pool_uuid = "ExceededDomainCount"
    } else body.pool_uuid = data.pool_uuid

    if (data.http_port !== undefined && data.http_port < 0) {
        isErr = true
        err.http_port = "InvalidHTTPPort"
    } else body.http_port = data.http_port
    if (data.https_port !== undefined && data.https_port < 0) {
        isErr = true
        err.https_port = "InvalidHTTPSPort"
    } else body.https_port = data.https_port
    if (body.http_port === 0 && body.https_port === 0) {
        isErr = true
        err.http_port = "ZeroHTTPsPort"
        err.https_port = "ZeroHTTPsPort"
    }
    return { isErr, err, body }
}

interface EditDomainDialogProps {
    domain?: EditDomainFormField,
    onClose?: () => void,
    afterEdit?: () => void
}
const EditDomainDialog = (props: EditDomainDialogProps) => {
    const { t } = useTranslation(['exception', 'dashboard_user_domain_editdialog'])
    const [isLoading, setLoading] = useState<boolean>(false)
    const [isServerError, setIsServerError] = useState<boolean>(false)
    const [formField, setFormField] = useState<EditDomainFormField | undefined>(undefined)
    const [formError, setFormError] = useState<EditDomainFormError>({})
    const [domainCount, setDomainCount] = useState<number>(0)
    const auth = useContext(AuthContext)

    useEffect(() => {
        if (Object.keys(formError).length > 0)
            setFormError({})
        if (isServerError === true)
            setIsServerError(false)
    }, [formField])
    useEffect(() => {
        setFormField(props?.domain)
    }, [props?.domain])
    const onSubmitClick = async () => {
        const valid = validateFormField(formField ?? { pool_uuid: "" }, props?.domain?.pool_uuid === formField?.pool_uuid ? 0 : domainCount)
        if (valid.isErr === true) {
            setFormError(valid.err)
            return
        }
        if ((auth?.jwt ?? "").length === 0) {
            setIsServerError(true)
            return
        }
        setLoading(true)
        setIsServerError(false)
        try {
            const res = await fetch(config.BACKEND_URL + '/api/v1/user/domain/' + encodeURI(props?.domain?.name ?? "") + '/edit', {
                method: 'post',
                body: JSONtoQueryRequest(valid.body),
                headers: {
                    'Authorization': `Bearer ${auth?.jwt ?? ""}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            await auth.fetchResMiddleware(res)
            const res_js = await res.json()
            setLoading(false)
            if (res_js?.http_code === 202) {
                if (props?.afterEdit !== undefined) props.afterEdit()
                else if (props?.onClose !== undefined) props.onClose()
            } else if (res_js?.http_code === 400 && typeof res_js?.data === 'object')
                setFormError((res_js?.data ?? {}) as EditDomainFormError)
            else setIsServerError(true)
        } catch (error) {
            setLoading(false)
            setIsServerError(true)
        }
    }

    return (<Dialog
        open={typeof props?.domain?.name === 'string' && props.domain.name.length > 0}
        onClose={isLoading === true ? undefined : props?.onClose}
    >
        <DialogTitle>{t('dashboard_user_domain_editdialog:EditDomainDialogTitle')}</DialogTitle>
        <DialogContent>
            <Grid container spacing={0.5}>
                <Grid item xs={12}>
                    <TextField
                        label={t('dashboard_user_domain_editdialog:DomainTextFieldLabel')}
                        value={props?.domain?.name ?? ""}
                        fullWidth
                        margin="dense"
                        disabled
                    />
                </Grid>
                <Grid item xs={12}>
                    <Select2Like
                        renderInput={(props) => <TextField
                            {...props}
                            error={typeof formError?.pool_uuid === 'string' && formError.pool_uuid.length > 0}
                            helperText={typeof formError?.pool_uuid === 'string' && formError.pool_uuid.length > 0 && t([`exception:${formError.pool_uuid}`, 'SomethingError'])}
                            label={t('dashboard_user_domain_editdialog:PoolUUIDTextFieldLabel')}
                            margin="dense"
                            autoComplete="off"
                        />}
                        fetchInfo={config.BACKEND_URL + '/api/v1/user/pool/select2'}
                        fetchInit={{ headers: { 'Authorization': `Bearer ${auth?.jwt ?? ""}` } }}
                        fetchMiddleware={async res => {
                            if ((auth?.jwt ?? "").length > 0) {
                                await auth.fetchResMiddleware(res)
                                return await res.json()
                            } else return {}
                        }}
                        value={typeof formField?.pool_uuid === 'string' && formField.pool_uuid.length > 0 ? formField.pool_uuid : null}
                        onChange={s => {
                            if (typeof s !== 'string' || s.length === 0)
                                setDomainCount(0)
                            setFormField(v => ({ ...v, pool_uuid: typeof s === 'string' ? s : "" }))
                        }}
                        autocompleteOnChange={(e, v: any) => setDomainCount(typeof v === 'object' && typeof v?.domain_count === 'number' ? v.domain_count : 0)}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        label={t('dashboard_user_domain_editdialog:HTTPPortTextFieldLabel')}
                        value={formField?.http_port ?? ""}
                        onChange={e => setFormField(v =>
                            v === undefined ? undefined :
                                ({
                                    ...v,
                                    http_port: e.target.value.length === 0 ? undefined : (parseInt(e.target.value) >= 0 ? parseInt(e.target.value) : undefined)
                                })
                        )}
                        error={typeof formError?.http_port === 'string' && formError.http_port.length > 0}
                        helperText={
                            typeof formError?.http_port === 'string' && formError.http_port.length > 0 ?
                                t([`exception:${formError.http_port}`, 'SomethingError']) :
                                t('dashboard_user_domain_editdialog:HTTPPortHelperText')
                        }
                        fullWidth
                        margin="dense"
                        autoComplete="off"
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        label={t('dashboard_user_domain_editdialog:HTTPSPortTextFieldLabel')}
                        value={formField?.https_port ?? ""}
                        onChange={e => setFormField(v =>
                            v === undefined ? undefined :
                                ({
                                    ...v,
                                    https_port: e.target.value.length === 0 ? undefined : (parseInt(e.target.value) >= 0 ? parseInt(e.target.value) : undefined)
                                })
                        )}
                        error={typeof formError?.https_port === 'string' && formError.https_port.length > 0}
                        helperText={
                            typeof formError?.https_port === 'string' && formError.https_port.length > 0 ?
                                t([`exception:${formError.https_port}`, 'SomethingError']) :
                                t('dashboard_user_domain_editdialog:HTTPSPortHelperText')
                        }
                        fullWidth
                        margin="dense"
                        autoComplete="off"
                    />
                </Grid>
            </Grid>
        </DialogContent>
        <DialogActions>
            <Button onClick={isLoading === true ? undefined : props?.onClose}>{t('dashboard_user_domain_editdialog:CloseButton')}</Button>
            {isLoading === true ? (
                <Button disabled><CircularProgress size={15} /></Button>
            ) : (
                <Button
                    color={isServerError === true ? "warning" : "primary"}
                    endIcon={isServerError === true && (<Replay />)}
                    onClick={onSubmitClick}
                >{t('dashboard_user_domain_editdialog:SubmitButton')}</Button>
            )}
        </DialogActions>
    </Dialog>)
}
export type { EditDomainFormField }
export default EditDomainDialog