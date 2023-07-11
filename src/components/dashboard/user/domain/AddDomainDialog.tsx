import { Replay } from "@mui/icons-material"
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, TextField } from "@mui/material"
import { useState, useContext, useEffect } from "react"
import Select2Like from "../../../Select2Like"
import config from "../../../../config"
import { AuthContext } from "../../../AuthProvider"
import { StringErrCode } from "../../../../helper/exception"
import { useTranslation } from "react-i18next"
import JSONtoQueryRequest from "../../../../helper/jsonqueryrequest"
import domainvalidator from "../../../../helper/domainvalidator"
interface AddDomainFormField {
    name: string,
    pool_uuid: string,
    http_port?: number,
    https_port?: number
}
interface AddDomainFormBody {
    name?: string,
    pool_uuid?: string,
    http_port?: number,
    https_port?: number
}
interface AddDomainFormError {
    name?: StringErrCode,
    pool_uuid?: StringErrCode,
    http_port?: StringErrCode,
    https_port?: StringErrCode,
}
const validateFormField = (data: AddDomainFormField, domain_count?: number): { isErr: boolean, err: AddDomainFormError, body: AddDomainFormBody } => {
    domain_count = Math.max(0, domain_count ?? 0)
    let isErr: boolean = false
    let err: AddDomainFormError = {}
    const body: AddDomainFormBody = {}

    if (data.name.length === 0) {
        isErr = true
        err.name = "EmptyDomainName"
    } else if (!domainvalidator.maindomain(data.name, { wildcard: config.DOMAIN_WILDCARD_ENABLED })) {
        isErr = true
        err.name = "InvalidDomainName"
    } else body.name = data.name.toLowerCase()

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

interface AddDomainDialogProps {
    open?: boolean,
    onClose?: () => void,
    afterAdd?: () => void
}
const AddDomainDialog = (props: AddDomainDialogProps) => {
    const { t } = useTranslation(['exception', 'dashboard_user_domain_adddialog'])
    const [isLoading, setLoading] = useState<boolean>(false)
    const [isServerError, setIsServerError] = useState<boolean>(false)
    const [formField, setFormField] = useState<AddDomainFormField>({
        name: "",
        pool_uuid: ""
    })
    const [formError, setFormError] = useState<AddDomainFormError>({})
    const [domainCount, setDomainCount] = useState<number>(0)
    const auth = useContext(AuthContext)

    useEffect(() => {
        if (Object.keys(formError).length > 0)
            setFormError({})
        if (isServerError === true)
            setIsServerError(false)
    }, [formField])
    useEffect(() => {
        setFormField({ name: "", pool_uuid: "" })
    }, [props?.open])

    const onSubmitClick = async () => {
        const valid = validateFormField(formField, domainCount)
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
            const res = await fetch(config.BACKEND_URL + '/api/v1/user/domain/create', {
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
            if (res_js?.http_code === 201) {
                if (props?.afterAdd !== undefined) props.afterAdd()
                else if (props?.onClose !== undefined) props.onClose()
            } else if (res_js?.http_code === 400 && typeof res_js?.data === 'object')
                setFormError((res_js?.data ?? {}) as AddDomainFormError)
            else setIsServerError(true)
        } catch (error) {
            setLoading(false)
            setIsServerError(true)
        }
    }

    return (<Dialog
        open={props?.open === true}
        onClose={isLoading === true ? undefined : props?.onClose}
    >
        <DialogTitle>{t('dashboard_user_domain_adddialog:AddDomainDialogTitle')}</DialogTitle>
        <DialogContent>
            <Grid container spacing={0.5}>
                <Grid item xs={12}>
                    <TextField
                        label={t('dashboard_user_domain_adddialog:DomainTextFieldLabel')}
                        value={formField.name}
                        onChange={e => setFormField(v => ({ ...v, name: e.target.value }))}
                        error={typeof formError?.name === 'string' && formError.name.length > 0}
                        helperText={
                            typeof formError?.name === 'string' && formError.name.length > 0 ?
                                t([`exception:${formError.name}`, 'SomethingError']) :
                                t('dashboard_user_domain_adddialog:DomainPrefixHelperText') + config.DOMAIN_MAIN + " " + t('dashboard_user_domain_adddialog:DomainPostfixHelperText') +
                                " " + t('dashboard_user_domain_adddialog:IPPrefixHelperText') + " " + config.SERVER_IP + " " + t('dashboard_user_domain_adddialog:IPPostfixHelperText')
                        }
                        fullWidth
                        margin="dense"
                        autoFocus
                        autoComplete="off"
                    />
                </Grid>
                <Grid item xs={12}>
                    <Select2Like
                        renderInput={(props) => <TextField
                            {...props}
                            error={typeof formError?.pool_uuid === 'string' && formError.pool_uuid.length > 0}
                            helperText={typeof formError?.pool_uuid === 'string' && formError.pool_uuid.length > 0 && t([`exception:${formError.pool_uuid}`, 'SomethingError'])}
                            label={t('dashboard_user_domain_adddialog:PoolUUIDTextFieldLabel')}
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
                        value={formField.pool_uuid.length > 0 ? formField.pool_uuid : null}
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
                        label={t('dashboard_user_domain_adddialog:HTTPPortTextFieldLabel')}
                        value={formField?.http_port ?? ""}
                        onChange={e => setFormField(v =>
                        ({
                            ...v,
                            http_port: e.target.value.length === 0 ? undefined : (parseInt(e.target.value) >= 0 ? parseInt(e.target.value) : undefined)
                        })
                        )}
                        error={typeof formError?.http_port === 'string' && formError.http_port.length > 0}
                        helperText={
                            typeof formError?.http_port === 'string' && formError.http_port.length > 0 ?
                                t([`exception:${formError.http_port}`, 'SomethingError']) :
                                t('dashboard_user_domain_adddialog:HTTPPortHelperText')
                        }
                        fullWidth
                        margin="dense"
                        autoComplete="off"
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        label={t('dashboard_user_domain_adddialog:HTTPSPortTextFieldLabel')}
                        value={formField?.https_port ?? ""}
                        onChange={e => setFormField(v =>
                        ({
                            ...v,
                            https_port: e.target.value.length === 0 ? undefined : (parseInt(e.target.value) >= 0 ? parseInt(e.target.value) : undefined)
                        })
                        )}
                        error={typeof formError?.https_port === 'string' && formError.https_port.length > 0}
                        helperText={
                            typeof formError?.https_port === 'string' && formError.https_port.length > 0 ?
                                t([`exception:${formError.https_port}`, 'SomethingError']) :
                                t('dashboard_user_domain_adddialog:HTTPSPortHelperText')
                        }
                        fullWidth
                        margin="dense"
                        autoComplete="off"
                    />
                </Grid>
            </Grid>
        </DialogContent>
        <DialogActions>
            <Button onClick={isLoading === true ? undefined : props?.onClose}>{t('dashboard_user_domain_adddialog:CloseButton')}</Button>
            {isLoading === true ? (
                <Button disabled><CircularProgress size={15} /></Button>
            ) : (
                <Button
                    color={isServerError === true ? "warning" : "primary"}
                    endIcon={isServerError === true && (<Replay />)}
                    onClick={onSubmitClick}
                >{t('dashboard_user_domain_adddialog:SubmitButton')}</Button>
            )}
        </DialogActions>
    </Dialog>)
}

export default AddDomainDialog