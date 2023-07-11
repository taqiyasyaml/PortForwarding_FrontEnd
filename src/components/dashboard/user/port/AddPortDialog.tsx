import { Replay } from "@mui/icons-material"
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, TextField } from "@mui/material"
import { useState, useContext, useEffect } from "react"
import Select2Like from "../../../Select2Like"
import config from "../../../../config"
import { AuthContext } from "../../../AuthProvider"
import { StringErrCode } from "../../../../helper/exception"
import { useTranslation } from "react-i18next"
import JSONtoQueryRequest from "../../../../helper/jsonqueryrequest"
interface AddPortFormField {
    port_desc?: string,
    pool_uuid: string,
    src_port: number,
    src_protocol?: 'tcp' | 'udp',
    dst_port: number
}
interface AddPortFormBody {
    port_desc?: string,
    pool_uuid?: string,
    src_port?: number,
    src_protocol?: 'tcp' | 'udp',
    dst_port?: number
}
interface AddPortFormError {
    pool_uuid?: StringErrCode
    src_port?: StringErrCode,
    dst_port?: StringErrCode,
}
const validateFormField = (data: AddPortFormField, start_port?: number): { isErr: boolean, err: AddPortFormError, body: AddPortFormBody } => {
    start_port = Math.max(0, start_port ?? 0)
    let isErr: boolean = false
    let err: AddPortFormError = {}
    const body: AddPortFormBody = {
        src_protocol: data?.src_protocol,
        port_desc: data?.port_desc
    }

    if (data.pool_uuid.length === 0) {
        isErr = true
        err.pool_uuid = "EmptyPoolID"
    } else body.pool_uuid = data.pool_uuid

    if (!(
        (data.src_port >= 0 && data.src_port < config.PORT_MAX_CLIENT) ||
        (data.src_port >= start_port && data.src_port < (start_port + config.PORT_MAX_CLIENT))
    )) {
        isErr = true
        err.src_port = "OutRangeSrcPort"
    } else body.src_port = data.src_port

    if (data.dst_port <= 0) {
        isErr = true
        err.dst_port = "InvalidDstPort"
    } else body.dst_port = data.dst_port

    return { isErr, err, body }
}

interface AddPortDialogProps {
    open?: boolean,
    onClose?: () => void,
    afterAdd?: () => void
}
const AddPortDialog = (props: AddPortDialogProps) => {
    const { t } = useTranslation(['exception', 'dashboard_user_port_adddialog'])
    const [isLoading, setLoading] = useState<boolean>(false)
    const [isServerError, setIsServerError] = useState<boolean>(false)
    const [formField, setFormField] = useState<AddPortFormField>({
        pool_uuid: "",
        src_port: 0,
        dst_port: 0
    })
    const [formError, setFormError] = useState<AddPortFormError>({})
    const [startPort, setStartPort] = useState<number>(0)
    const auth = useContext(AuthContext)

    useEffect(() => {
        if (Object.keys(formError).length > 0)
            setFormError({})
        if (isServerError === true)
            setIsServerError(false)
    }, [formField])
    useEffect(() => {
        setFormField({ pool_uuid: "", src_port: 0, dst_port: 0 })
    }, [props?.open])
    const onSubmitClick = async () => {
        const valid = validateFormField(formField, startPort)
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
            const res = await fetch(config.BACKEND_URL + '/api/v1/user/port/create', {
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
                setFormError((res_js?.data ?? {}) as AddPortFormError)
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
        <DialogTitle>{t('dashboard_user_port_adddialog:AddPortDialogTitle')}</DialogTitle>
        <DialogContent>
            <Grid container spacing={0.5}>
                <Grid item xs={12}>
                    <TextField
                        label={t('dashboard_user_port_adddialog:PortDescTextFieldLabel')}
                        value={formField?.port_desc ?? ""}
                        onChange={e => setFormField(v => ({ ...v, port_desc: e.target.value }))}
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
                            label={t('dashboard_user_port_adddialog:PoolUUIDTextFieldLabel')}
                            margin="dense"
                            autoComplete="off"
                        />}
                        fetchInfo={config.BACKEND_URL + '/api/v1/user/pool/select2'}
                        fetchInit={{ headers: { 'Authorization': `Bearer ${auth?.jwt ?? ""}` } }}
                        fetchMiddleware={async res => {
                            if ((auth?.jwt ?? "").length > 0) {
                                await auth.fetchResMiddleware(res)
                                return await res.json()
                            } return {}
                        }}
                        value={formField.pool_uuid.length > 0 ? formField.pool_uuid : null}
                        onChange={s => {
                            if (typeof s !== 'string' || s.length === 0)
                                setStartPort(0)
                            setFormField(v => ({ ...v, pool_uuid: typeof s === 'string' ? s : "" }))
                        }}
                        autocompleteOnChange={(e, v: any) => setStartPort(typeof v === 'object' && typeof v?.port_start === 'number' ? v.port_start : 0)}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>{t('dashboard_user_port_adddialog:ProtocolSelectLabel')}</InputLabel>
                        <Select
                            label={t('dashboard_user_port_adddialog:ProtocolSelectLabel')}
                            value={formField?.src_protocol ?? "tcp&udp"}
                            onChange={e => setFormField(v => ({ ...v, src_protocol: e.target.value === 'tcp' || e.target.value === 'udp' ? e.target.value : undefined }))}
                            autoComplete="off"
                        >
                            <MenuItem value="tcp&udp">{t('dashboard_user_port_adddialog:TCPUDPMenuItem')}</MenuItem>
                            <MenuItem value="tcp">{t('dashboard_user_port_adddialog:TCPMenuItem')}</MenuItem>
                            <MenuItem value="udp">{t('dashboard_user_port_adddialog:UDPMenuItem')}</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        label={t('dashboard_user_port_adddialog:SourcePortTextFieldLabel')}
                        value={formField?.src_port}
                        onChange={e => setFormField(v => ({ ...v, src_port: parseInt(e.target.value) >= 0 ? parseInt(e.target.value) : 0 }))}
                        error={typeof formError?.src_port === 'string' && formError.src_port.length > 0}
                        helperText={typeof formError?.src_port === 'string' && formError.src_port.length > 0 && t([`exception:${formError.src_port}`, 'SomethingError'])}
                        fullWidth
                        margin="dense"
                        autoComplete="off"
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        label={t('dashboard_user_port_adddialog:DestinationPortTextFieldLabel')}
                        value={formField?.dst_port}
                        onChange={e => setFormField(v => ({ ...v, dst_port: parseInt(e.target.value) > 0 ? parseInt(e.target.value) : 0 }))}
                        error={typeof formError?.dst_port === 'string' && formError.dst_port.length > 0}
                        helperText={typeof formError?.dst_port === 'string' && formError.dst_port.length > 0 && t([`exception:${formError.dst_port}`, 'SomethingError'])}
                        fullWidth
                        margin="dense"
                        autoComplete="off"
                    />
                </Grid>
            </Grid>
        </DialogContent>
        <DialogActions>
            <Button onClick={isLoading === true ? undefined : props?.onClose}>{t('dashboard_user_port_adddialog:CloseButton')}</Button>
            {isLoading === true ? (
                <Button disabled><CircularProgress size={15} /></Button>
            ) : (
                <Button
                    color={isServerError === true ? "warning" : "primary"}
                    endIcon={isServerError === true && (<Replay />)}
                    onClick={onSubmitClick}
                >{t('dashboard_user_port_adddialog:SubmitButton')}</Button>
            )}
        </DialogActions>
    </Dialog>)
}

export default AddPortDialog