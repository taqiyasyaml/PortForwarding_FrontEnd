import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from "@mui/material";
import { StringErrCode } from "../../../../helper/exception";
import { useContext, useEffect, useState } from "react";
import { Replay } from "@mui/icons-material";
import Select2Like from "../../../Select2Like";
import config from "../../../../config";
import { AuthContext } from "../../../AuthProvider";
import { useTranslation } from "react-i18next";
import JSONtoQueryRequest from "../../../../helper/jsonqueryrequest";

interface TopUpFormBody {
    from_userpackage_id?: string,
    to_userpackage_id?: string,
    qty?: number,
}
interface TopUpFormField {
    from_userpackage_id?: string,
    to_userpackage_id?: string,
    qty?: number,
}
interface TopUpFormError {
    userpackage_id_from?: StringErrCode,
    userpackage_id_to?: StringErrCode,
    exp_package_at_from?: StringErrCode,
    exp_package_at_to?: StringErrCode,
    qty?: StringErrCode,
    cycle_ms?: StringErrCode,
    tunnel?: StringErrCode,
    quote_bytes?: StringErrCode,
    left_cycle_time?: StringErrCode,
}
interface TopUpFormErrorGroup {
    userpackage_id_from?: StringErrCode[],
    userpackage_id_to?: StringErrCode[],
    qty?: StringErrCode[]
}
const validateFormField = (data: TopUpFormField, left_cycle_time?: number): { isErr: boolean, err: TopUpFormError, body: TopUpFormBody } => {
    left_cycle_time = (left_cycle_time ?? 0) > 0 ? left_cycle_time : -1
    let isErr: boolean = false
    let err: TopUpFormError = {}
    const body: TopUpFormBody = {}

    if (typeof data?.from_userpackage_id !== 'string' || data.from_userpackage_id.length === 0) {
        isErr = true
        err.userpackage_id_from = 'EmptyPackage'
    } else body.from_userpackage_id = data.from_userpackage_id
    if (typeof data?.to_userpackage_id !== 'string' || data.to_userpackage_id.length === 0) {
        isErr = true
        err.userpackage_id_to = 'EmptyPackage'
    } else body.to_userpackage_id = data.to_userpackage_id
    if (body?.from_userpackage_id === body?.to_userpackage_id) {
        isErr = true
        err.userpackage_id_from = 'SamePackage'
        err.userpackage_id_to = 'SamePackage'
    }
    if (typeof data?.qty !== 'number') {
        isErr = true
        err.qty = 'EmptyQty'
    } else if (data.qty <= 0) {
        isErr = true
        err.qty = 'InvalidQty'
    } else body.qty = data.qty

    if ((left_cycle_time ?? -1) < (body?.qty ?? 0)) {
        isErr = true
        err.left_cycle_time = 'NotEnoughLeftCyclePackage'
    }

    return { isErr, err, body }
}
const groupError = (err?: TopUpFormError): TopUpFormErrorGroup => {
    const errorGroupped: Required<TopUpFormErrorGroup> = { userpackage_id_from: [], userpackage_id_to: [], qty: [] }
    if (typeof err?.userpackage_id_from === 'string' && err.userpackage_id_from.length > 0)
        errorGroupped.userpackage_id_from.push(err.userpackage_id_from)
    if (typeof err?.exp_package_at_from === 'string' && err.exp_package_at_from.length > 0)
        errorGroupped.userpackage_id_from.push(err.exp_package_at_from)
    if (typeof err?.cycle_ms === 'string' && err.cycle_ms.length > 0)
        errorGroupped.userpackage_id_from.push(err.cycle_ms)
    if (typeof err?.tunnel === 'string' && err.tunnel.length > 0)
        errorGroupped.userpackage_id_from.push(err.tunnel)
    if (typeof err?.quote_bytes === 'string' && err.quote_bytes.length > 0)
        errorGroupped.userpackage_id_from.push(err.quote_bytes)
    if (typeof err?.userpackage_id_to === 'string' && err.userpackage_id_to.length > 0)
        errorGroupped.userpackage_id_to.push(err.userpackage_id_to)
    if (typeof err?.exp_package_at_to === 'string' && err.exp_package_at_to.length > 0)
        errorGroupped.userpackage_id_to.push(err.exp_package_at_to)
    if (typeof err?.qty === 'string' && err.qty.length > 0)
        errorGroupped.qty.push(err.qty)
    if (typeof err?.left_cycle_time === 'string' && err.left_cycle_time.length > 0)
        errorGroupped.qty.push(err.left_cycle_time)
    return Object.entries(errorGroupped).reduce((p, v) => ({ ...p, [v[0]]: v[1].length > 0 ? v[1] : undefined }), {})
}

interface TopUpQtyDialogProps {
    toUserPackageID?: string,
    onClose?: () => void,
    afterTopUp?: () => void
}
const TopUpQtyDialog = (props: TopUpQtyDialogProps) => {
    const { t } = useTranslation(['dashboard_user_userpackage_topupqtydialog', 'exception'])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isServerError, setIsServerError] = useState<boolean>(false)
    const auth = useContext(AuthContext)
    const [formField, setFormField] = useState<TopUpFormField>({})
    const [leftQtyFrom, setLeftQtyFrom] = useState<number>(0)
    const [formError, setFormError] = useState<TopUpFormErrorGroup | undefined>(undefined)

    useEffect(() => {
        setFormField({ to_userpackage_id: props?.toUserPackageID })
    }, [props?.toUserPackageID])
    useEffect(() => {
        if (Object.keys(formError ?? {}).length > 0)
            setFormError({})
        if (isServerError === true)
            setIsServerError(false)
    }, [formField])

    const onSubmitClick = async () => {
        const valid = validateFormField(formField ?? { pool_uuid: "" }, leftQtyFrom)
        if (valid.isErr === true) {
            setFormError(groupError(valid.err))
            return
        }
        if ((auth?.jwt ?? "").length === 0) {
            setIsServerError(true)
            return
        }
        setIsLoading(true)
        setIsServerError(false)
        try {
            const res = await fetch(config.BACKEND_URL + '/api/v1/user/user_package/top_up', {
                method: 'post',
                body: JSONtoQueryRequest(valid.body),
                headers: {
                    'Authorization': `Bearer ${auth?.jwt ?? ""}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            await auth.fetchResMiddleware(res)
            const res_js = await res.json()
            setIsLoading(false)
            if (res_js?.http_code === 202) {
                if (props?.afterTopUp !== undefined) props.afterTopUp()
                else if (props?.onClose !== undefined) props.onClose()
            } else if (res_js?.http_code === 400 && typeof res_js?.data === 'object')
                setFormError(groupError((res_js?.data ?? {}) as TopUpFormError))
            else setIsServerError(true)
        } catch (error) {
            setIsLoading(false)
            setIsServerError(true)
        }
    }

    return (<Dialog
        open={typeof props?.toUserPackageID === 'string' && props.toUserPackageID.length > 0}
        onClose={isLoading === true ? undefined : props?.onClose}
    >
        <DialogTitle>{t('dashboard_user_userpackage_topupqtydialog:TopUpQtyDialogTitle')}</DialogTitle>
        <DialogContent>
            <Grid container>
                <Grid item xs={12}>
                    <Select2Like
                        renderInput={(props) => <TextField
                            {...props}
                            label={t('dashboard_user_userpackage_topupqtydialog:FromPackageIDTextFieldLabel')}
                            margin="dense"
                            autoComplete="off"
                            error={formError?.userpackage_id_from !== undefined && formError.userpackage_id_from.length > 0}
                            helperText={formError?.userpackage_id_from !== undefined && formError.userpackage_id_from.length > 0 &&
                                formError.userpackage_id_from.map(v => t([`exception:${v}`, 'SomethingError'])).join(', ')
                            }
                        />}
                        fetchInfo={config.BACKEND_URL + '/api/v1/user/user_package/top_up/select2?to_userpackage_id=' + encodeURIComponent(props?.toUserPackageID ?? "")}
                        fetchInit={{ headers: { 'Authorization': `Bearer ${auth?.jwt ?? ""}` } }}
                        fetchMiddleware={async res => {
                            if ((auth?.jwt ?? "").length > 0) {
                                await auth.fetchResMiddleware(res)
                                return await res.json()
                            } else return {}
                        }}
                        value={typeof formField?.from_userpackage_id === 'string' && formField.from_userpackage_id.length > 0 ? formField.from_userpackage_id : null}
                        onChange={s => {
                            if (typeof s !== 'string' || s.length === 0)
                                setLeftQtyFrom(0)
                            setFormField(v => ({ ...v, from_userpackage_id: typeof s === 'string' ? s : "" }))
                        }}
                        autocompleteOnChange={(e, v: any) => setLeftQtyFrom(typeof v === 'object' && typeof v?.left_cycle_time === 'number' ? v.left_cycle_time : 0)}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label={t('dashboard_user_userpackage_topupqtydialog:QtyTextFieldLabel')}
                        value={formField?.qty ?? 0}
                        onChange={e => setFormField(v => ({
                            ...v,
                            qty: parseInt(e.target.value) >= 0 ? parseInt(e.target.value) : 0
                        }))}
                        error={formError?.qty !== undefined && formError.qty.length > 0}
                        helperText={formError?.qty !== undefined && formError.qty.length > 0 &&
                            formError.qty.map(v => t([`exception:${v}`, 'SomethingError'])).join(', ')
                        }
                        fullWidth
                        margin="dense"
                        autoComplete="off"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label={t('dashboard_user_userpackage_topupqtydialog:ToPackageIDTextFieldLabel')}
                        value={props?.toUserPackageID ?? ""}
                        fullWidth
                        margin="dense"
                        disabled
                        error={formError?.userpackage_id_to !== undefined && formError.userpackage_id_to.length > 0}
                        helperText={formError?.userpackage_id_to !== undefined && formError.userpackage_id_to.length > 0 &&
                            formError.userpackage_id_to.map(v => t([`exception:${v}`, 'SomethingError'])).join(', ')
                        }
                    />
                </Grid>
            </Grid>
        </DialogContent>
        <DialogActions>
            <Button onClick={isLoading === true ? undefined : props?.onClose}>{t('dashboard_user_userpackage_topupqtydialog:CloseButtonLabel')}</Button>
            {isLoading === true ? (
                <Button disabled><CircularProgress size={15} /></Button>
            ) : (
                <Button
                    color={isServerError === true ? "warning" : "primary"}
                    endIcon={isServerError === true && (<Replay />)}
                    onClick={onSubmitClick}
                >{t('dashboard_user_userpackage_topupqtydialog:SubmitButtonLabel')}</Button>
            )}
        </DialogActions>
    </Dialog>)
}
export default TopUpQtyDialog