import { Box, Button, Card, CardContent, CardHeader, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from "@mui/material"
import { useState, Suspense, lazy, useContext, useMemo, useRef, useEffect } from 'react'
import DataTableLikeTranslation from "../../../components/datatable/DataTableLikeTranslation"
import config from "../../../config"
import { AuthContext } from "../../../components/AuthProvider"
import { DataTableLikeProps, DataTableLikeRef } from "../../../components/datatable/DataTableLike"
import { Delete, Edit } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
const AddPoolDialog = lazy(() => import('./../../../components/dashboard/user/pool/AddPoolDialog'))
const EditPoolDialog = lazy(() => import("../../../components/dashboard/user/pool/EditPoolDialog"))
const DeletePoolDialog = lazy(() => import("../../../components/dashboard/user/pool/DeletePoolDialog"))
const Component = () => {
    const [openAddPool, setOpenAddPool] = useState<boolean>(false)
    const [editPoolDialog, setEditPoolDialog] = useState<({ poolID?: string, poolName?: string }) | undefined>()
    const [deletePoolDialog, setDeletePoolDialog] = useState<({ poolID?: string, poolName?: string }) | undefined>()
    const { t } = useTranslation(['dashboard_user_pools'])
    const auth = useContext(AuthContext)
    const dtRef = useRef<DataTableLikeRef>(null)

    useEffect(() => {
        document.title = `${t('dashboard_user_pools:PoolsTitle')} | ${config.APP_NAME}`
        return () => { document.title = config.APP_NAME }
    }, [])

    const DT = useMemo<JSX.Element>(() => {
        const columns: DataTableLikeProps['columns'] = [
            {
                keyId: "pool_name", data: "pool_name", name: t('dashboard_user_pools:PoolNameNameDT'),
                orderable: true, searchable: true, searchType: { strSearch: true },
                formatData: (d) => (typeof d?.rawData === 'string' && d.rawData.length > 0) ? d.rawData : (d.rowData?.id ?? "")
            },
            {
                keyId: "ip", data: "ip", name: t('dashboard_user_pools:IPNameDT'),
                orderable: false, searchable: true, searchType: { strSearch: true, nulSearch: true },
                formatData: (d) => d?.rawData ?? ""
            },
            {
                keyId: "actions", renderData: (d) => {
                    return (<>
                        <Box display='flex' flexDirection='row' justifyContent='flex-end'>
                            <IconButton
                                onClick={() => setEditPoolDialog({ poolID: d.idData, poolName: d?.rowData?.pool_name as string })}
                            ><Edit /></IconButton>
                            <IconButton
                                onClick={() => setDeletePoolDialog({ poolID: d.idData, poolName: d?.rowData?.pool_name as string })}
                            ><Delete /></IconButton>
                        </Box>
                    </>)
                }
            }
        ]
        return (<DataTableLikeTranslation
            idData="id"
            globalSearchDT
            columns={columns}
            fetchInfo={`${config.BACKEND_URL}/api/v1/user/pool/datatables`}
            fetchInit={{ headers: { 'Authorization': `Bearer ${auth?.jwt ?? ""}` } }}
            fetchMiddleware={async (res) => {
                if ((auth?.jwt ?? "").length > 0) {
                    await auth.fetchResMiddleware(res)
                    return await res.json()
                } else return {}
            }}
            ref={dtRef}
        />)
    }, [auth?.jwt, t])

    return (<>
        <Card>
            <CardHeader
                title={t('dashboard_user_pools:PoolsTitle')}
                subheader={<Button
                    onClick={async () => setOpenAddPool(true)}
                    variant="contained"
                >{t('dashboard_user_pools:AddPoolButtonLabel')}</Button>} size="medium"
            />
            <CardContent>
                {DT}
            </CardContent>
        </Card>
        <Suspense>
            <AddPoolDialog
                open={openAddPool}
                onClose={() => setOpenAddPool(false)}
                afterAdd={() => {
                    setOpenAddPool(false)
                    if (dtRef?.current?.refresh !== undefined) dtRef.current.refresh()
                }}
            />
        </Suspense>
        <Suspense>
            <EditPoolDialog
                poolID={editPoolDialog?.poolID}
                poolName={editPoolDialog?.poolName}
                onClose={() => setEditPoolDialog(undefined)}
                afterEdit={() => {
                    setEditPoolDialog(undefined)
                    if (dtRef?.current?.refresh !== undefined) dtRef.current.refresh()
                }}
            />
        </Suspense>
        <Suspense>
            <DeletePoolDialog
                poolID={deletePoolDialog?.poolID}
                poolName={deletePoolDialog?.poolName}
                onClose={() => setDeletePoolDialog(undefined)}
                afterDelete={() => {
                    setDeletePoolDialog(undefined)
                    if (dtRef?.current?.refresh !== undefined) dtRef.current.refresh()
                }}
            />
        </Suspense>
    </>)
}

export { Component }