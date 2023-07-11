import { useContext, useState, Suspense, useMemo, useRef, lazy, useEffect } from "react"
import { AuthContext } from "../../../components/AuthProvider"
import { Box, Button, Card, CardContent, CardHeader, IconButton } from "@mui/material"
import DataTableLikeTranslation from "../../../components/datatable/DataTableLikeTranslation"
import config from "../../../config"
import { DataTableLikeProps, DataTableLikeRef } from "../../../components/datatable/DataTableLike"
import { Delete } from "@mui/icons-material"
import { useTranslation } from "react-i18next"

const AddPortDialog = lazy(() => import("../../../components/dashboard/user/port/AddPortDialog"))
const DeletePortDialog = lazy(() => import("../../../components/dashboard/user/port/DeletePortDialog"))

const Component = () => {
    const auth = useContext(AuthContext)
    const { t } = useTranslation(['dashboard_user_ports'])
    const [openAddPortDialog, setOpenAddPortDialog] = useState<boolean>(false)
    const [deletePortDialog, setDeletePortDialog] = useState<{ portID?: string, portProtocol?: string, portDesc?: string } | undefined>(undefined)
    const dtRef = useRef<DataTableLikeRef>(null)

    useEffect(() => {
        document.title = `${t('dashboard_user_ports:PortsTitle')} | ${config.APP_NAME}`
        return () => { document.title = config.APP_NAME }
    }, [])

    const DT = useMemo<JSX.Element>(() => {
        const columns: DataTableLikeProps['columns'] = [
            {
                keyId: 'port_desc', data: 'port_desc', name: t('dashboard_user_ports:PortDescNameDT'),
                orderable: true, searchable: true, searchType: { strSearch: true }
            },
            {
                keyId: 'pool_uuid', data: 'pool_uuid', name: t('dashboard_user_ports:PoolUUIDNameDT'),
                orderable: true, searchable: true, searchType: {
                    arrSearch: {
                        fetchInfo: config.BACKEND_URL + '/api/v1/user/pool/select2',
                        fetchInit: { headers: { 'Authorization': `Bearer ${auth?.jwt ?? ""}` } },
                        fetchMiddleware: async res => {
                            if ((auth?.jwt ?? "").length > 0) {
                                await auth.fetchResMiddleware(res)
                                return await res.json()
                            } else return {}
                        }
                    }
                },
                formatData: (d) => (typeof d?.rowData?.pool_name === 'string' && d.rowData?.pool_name.length > 0) ? d.rowData?.pool_name : (d.rowData?.id ?? "")
            },
            {
                keyId: 'src_port', data: 'src_port', name: t('dashboard_user_ports:SrcPortNameDT'),
                orderable: true, searchable: true, searchType: { numSearch: 'num' },
                formatData: (d) => typeof d?.rowData?.port_start === 'number' && d.rowData.port_start > 0 ? `${config.SERVER_IP}:${(d.rawData as number) + d.rowData.port_start}` : (d.rawData as number)
            },
            {
                keyId: 'src_protocol', data: 'src_protocol', name: 'Protocol',
                orderable: false, searchable: true, searchType: {
                    arrSearch: [
                        { value: 'tcp', label: t('dashboard_user_ports:TCPArraySearchDT') },
                        { value: 'udp', label: t('dashboard_user_ports:UDPArraySearchDT') }
                    ]
                },
                formatData: d => d?.rawData === 'tcp' ? t('dashboard_user_ports:TCPArraySearchDT') :
                    d?.rawData === 'udp' ? t('dashboard_user_ports:UDPArraySearchDT') : d?.rawData ?? ""
            },
            {
                keyId: 'dst_port', data: 'dst_port', name: t('dashboard_user_ports:DstPortNameDT'),
                orderable: true, searchable: true, searchType: { numSearch: 'num' },
                formatData: (d) => typeof d?.rowData?.ip === 'string' && d.rowData.ip.length > 0 ? `${d.rowData.ip}:${d.rawData}` : d?.rawData ?? 0
            },
            {
                keyId: 'action', renderData: (d) => {
                    return (<>
                        <Box display='flex' flexDirection='row' justifyContent='flex-end'>
                            <IconButton
                                onClick={() => setDeletePortDialog({ portID: d.idData, portDesc: d?.rowData?.port_desc as string, portProtocol: d?.rowData?.src_protocol as string })}
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
            fetchInfo={`${config.BACKEND_URL}/api/v1/user/port/datatables`}
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
                title={t('dashboard_user_ports:PortsTitle')}
                subheader={<Button
                    variant="contained"
                    onClick={() => setOpenAddPortDialog(true)}
                >{t('dashboard_user_ports:AddPortButtonLabel')}</Button>}
            />
            <CardContent>
                {DT}
            </CardContent>
        </Card>
        <Suspense>
            <AddPortDialog
                open={openAddPortDialog}
                onClose={() => setOpenAddPortDialog(false)}
                afterAdd={() => {
                    if (dtRef.current?.refresh !== undefined) dtRef.current.refresh()
                    setOpenAddPortDialog(false)
                }}
            />
        </Suspense>
        <Suspense>
            <DeletePortDialog
                {...deletePortDialog}
                onClose={() => setDeletePortDialog(undefined)}
                afterDelete={() => {
                    if (dtRef.current?.refresh !== undefined) dtRef.current.refresh()
                    setDeletePortDialog(undefined)
                }}
            />
        </Suspense>
    </>)
}

export { Component }