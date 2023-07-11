import { Box, Card, CardContent, CardHeader, IconButton, MenuItem, Select, Theme, Typography } from "@mui/material"
import DataTableLike, { DataTableLikeProps, DataTableLikeRef } from "../../../components/datatable/DataTableLike"
import DataTableLikeTranslation from "../../../components/datatable/DataTableLikeTranslation"
import config from "../../../config"
import { useContext, useMemo, useRef, useState, Suspense, lazy, useEffect } from 'react'
import { AuthContext } from "../../../components/AuthProvider"
import { Add, Delete, Edit, ImportExport, Save, Search, Sync, VpnKey } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import GetIPDialog from "../../../components/dashboard/user/userpackages/GetIPDialog"
import RenewKeyDialog from "../../../components/dashboard/user/userpackages/RenewKeyDialog"
import RenewDialog from "../../../components/dashboard/user/userpackages/RenewDialog"
const SetPoolDialog = lazy(() => import("../../../components/dashboard/user/userpackages/SetPoolDialog"))
const DeletePoolDialog = lazy(() => import("../../../components/dashboard/user/userpackages/DeletePoolDialog"))
const TopUpQtyDialog = lazy(() => import("../../../components/dashboard/user/userpackages/TopUpQtyDialog"))
const Component = () => {
    const auth = useContext(AuthContext)
    const { t } = useTranslation(['dashboard_user_userpackages'])
    const [dialogSetPool, setDialogSetPool] = useState<{ userPackageID: string, poolID?: string } | undefined>(undefined)
    const [dialogDeletePool, setDialogDeletePool] = useState<{ userPackageID: string } | undefined>(undefined)
    const [dialogRenewKey, setDialogRenewKey] = useState<{ userPackageID: string } | undefined>(undefined)
    const [dialogGetIP, setDialogGetIP] = useState<{ userPackageID: string } | undefined>(undefined)
    const [dialogTopUpQty, setDialogTopUpQty] = useState<{ toUserPackageID: string } | undefined>(undefined)
    const [dialogRenew, setDialogRenew] = useState<{ userPackageID: string } | undefined>(undefined)
    const dtRef = useRef<DataTableLikeRef>(null)

    useEffect(() => {
        document.title = `${t('dashboard_user_userpackages:UserPackageTitle')} | ${config.APP_NAME}`
        return () => { document.title = config.APP_NAME }
    }, [])

    const DT = useMemo(() => {
        const columns: DataTableLikeProps['columns'] = [
            {
                keyId: 'id', data: 'id', name: t('dashboard_user_userpackages:IDColumnNameDT'),
                orderable: true, searchable: true,
                searchType: { strSearch: true }
            },
            {
                keyId: 'tunnel', data: 'tunnel', name: t('dashboard_user_userpackages:TunnelColumnNameDT'),
                formatData: d =>
                    d.rawData === 'openvpn' ? t('dashboard_user_userpackages:OpenVPNArraySearchDT') :
                        d.rawData === 'wireguard' ? t('dashboard_user_userpackages:WireGuardArraySearchDT') : d?.rawData ?? "",
                orderable: false, searchable: true,
                searchType: {
                    arrSearch: [
                        { label: t('dashboard_user_userpackages:OpenVPNArraySearchDT'), value: 'openvpn' },
                        { label: t('dashboard_user_userpackages:WireGuardArraySearchDT'), value: 'wireguard' }
                    ]
                }
            },
            {
                keyId: 'cycle_ms', data: 'cycle_ms', name: t('dashboard_user_userpackages:CycleColumnNameDT'),
                orderable: true, searchable: false,
                renderData: (d) => (<Box>
                    <Typography>
                        <Typography sx={{ fontWeight: (t: Theme) => t.typography.fontWeightBold }}>{t('dashboard_user_userpackages:CycleDurationColumnRenderDT')} : </Typography>
                        {Math.floor((typeof d?.rowData?.cycle_ms === 'number' ? d.rowData.cycle_ms : 0) / (24 * 3600_000))} day
                    </Typography>
                    <Typography>
                        <Typography sx={{ fontWeight: (t: Theme) => t.typography.fontWeightBold }}>{t('dashboard_user_userpackages:RenewCycleColumnRenderDT')} : </Typography>
                        {Math.floor(((typeof d?.rowData?.cycle_ms === 'number' ? d.rowData.cycle_ms : 0) - (typeof d?.rowData?.renew_before_exp_ms === 'number' ? d.rowData.renew_before_exp_ms : 0)) / (24 * 3600_000))} day
                    </Typography>
                </Box>)
            },
            {
                keyId: 'quote_bytes', data: 'quote_bytes', name: t('dashboard_user_userpackages:QuoteColumnNameDT'),
                orderable: true, searchable: false,
                renderData: (d) => (<Box>
                    <Typography>
                        <Typography sx={{ fontWeight: (t: Theme) => t.typography.fontWeightBold }}>{t('dashboard_user_userpackages:QuoteColumnRenderDT')} : </Typography>
                        {Math.round((typeof d?.rowData?.quote_bytes === 'number' ? d.rowData.quote_bytes : 0) / 1_000_000_0) / 100} GB
                    </Typography>
                    <Typography>
                        <Typography sx={{ fontWeight: (t: Theme) => t.typography.fontWeightBold }}>{t('dashboard_user_userpackages:RolloverColumnRenderDT')} : </Typography>
                        {Math.round((typeof d?.rowData?.rollover_bytes === 'number' ? d.rowData.rollover_bytes : 0) / 1_000_000_0) / 100} GB
                    </Typography>
                </Box>)
            },
            {
                keyId: 'pool_name', data: 'pool_name', name: t('dashboard_user_userpackages:PoolColumnNameDT'),
                setData: d => (typeof d.rowData?.pool_name === 'string' && d.rowData.pool_name.length > 0) ? d.rowData.pool_name : d.rowData?.pool_uuid ?? null,
                orderable: true, searchable: true,
                searchType: { strSearch: true, nulSearch: true },
                renderData: (d) => (<>
                    {typeof d?.rawData === 'string' && (<Box sx={{ textAlign: 'center' }}><Typography>{d.rawData}</Typography></Box>)}
                    <Box sx={{ textAlign: 'center' }}>
                        <IconButton onClick={() => {
                            setDialogSetPool({ userPackageID: d.idData, poolID: typeof d?.rowData?.pool_uuid === 'string' ? d?.rowData?.pool_uuid : undefined })
                        }}><Edit /></IconButton>
                        {typeof d?.rawData === 'string' && <IconButton
                            onClick={() => setDialogDeletePool({ userPackageID: d.idData })}
                        ><Delete /></IconButton>}
                    </Box>
                </>),
            },
            {
                keyId: 'ip', data: 'ip', name: t('dashboard_user_userpackages:IPColumnNameDT'),
                orderable: false, searchable: true,
                searchType: { strSearch: true, nulSearch: true },
                renderData: (d) => (<>
                    {typeof d?.rawData === 'string' && (<Box sx={{ textAlign: 'center' }}><Typography>{d.rawData}</Typography></Box>)}
                    <Box sx={{ textAlign: 'center' }}>
                        {typeof d?.rawData === 'string' ? (<>
                            <IconButton
                                onClick={() => setDialogRenewKey({ userPackageID: d?.idData })}
                            ><VpnKey /></IconButton>
                            {d?.rowData?.tunnel === 'openvpn' &&
                                <IconButton
                                    component='a'
                                    href={config.BACKEND_URL + '/assets/client_configs/' + encodeURIComponent(d?.idData ?? "") + '.zip?token=' + encodeURIComponent(auth?.jwt ?? "")}
                                    target="_blank"
                                ><Save /></IconButton>
                            }
                            {d?.rowData?.tunnel === 'wireguard' &&
                                <IconButton
                                    component='a'
                                    href={config.BACKEND_URL + '/assets/client_configs/' + encodeURIComponent(d?.idData ?? "") + '.conf?token=' + encodeURIComponent(auth?.jwt ?? "")}
                                    target="_blank"
                                ><Save /></IconButton>
                            }
                        </>) : (
                            <IconButton
                                onClick={() => setDialogGetIP({ userPackageID: d?.idData })}
                            ><Search /></IconButton>
                        )}
                    </Box>
                </>),
            },
            {
                keyId: 'left_quote_bytes', data: 'left_quote_bytes', name: t('dashboard_user_userpackages:LeftQuoteColumnNameDT'),
                formatData: (d) => `${Math.round((typeof d?.rawData === 'number' ? d.rawData : 0) / 1_000_000_0) / 100} GB`,
                orderable: true, searchable: false,
            },
            {
                keyId: 'left_cycle_time', data: 'left_cycle_time', name: t('dashboard_user_userpackages:LeftCycleColumnNameDT'),
                orderable: true, searchable: false,
                renderData: (d) => (<>
                    <Box sx={{ textAlign: 'center' }}><Typography>{d.rawData}</Typography></Box>
                    {typeof d.rowData?.exp_package_at === 'number' &&
                        <Box sx={{ textAlign: 'center' }}><IconButton
                            onClick={() => setDialogTopUpQty({ toUserPackageID: d.idData })}
                        ><Add /></IconButton></Box>
                    }
                </>)
            },
            {
                keyId: 'exp_package_at', data: 'exp_package_at', name: t('dashboard_user_userpackages:ExpColumnNameDT'),
                orderable: true, searchable: true,
                searchType: { numSearch: 'utc_ms' },
                renderData: (d) => (<Box>
                    {typeof d.rowData?.exp_package_at === 'number' && d.rowData.exp_package_at > 0 && (<>
                        <Typography>
                            <Typography sx={{ fontWeight: (t: Theme) => t.typography.fontWeightBold }}>{t('dashboard_user_userpackages:ExpPackageColumnRenderDT')} : </Typography>
                            {new Date(typeof d.rowData?.exp_package_at === 'number' ? d.rowData.exp_package_at : new Date().getTime()).toLocaleString()}
                        </Typography>
                        <Typography>
                            <Typography sx={{ fontWeight: (t: Theme) => t.typography.fontWeightBold }}>{t('dashboard_user_userpackages:RenewPackageColumnRenderDT')} : </Typography>
                            {new Date(typeof d.rowData?.renew_package_at === 'number' ? d.rowData.renew_package_at : new Date().getTime()).toLocaleString()}
                        </Typography>
                    </>)}
                    {typeof d.rowData?.exp_package_at === 'number' && d.rowData?.exp_package_at !== d.rowData?.exp_ip_at && (
                        <Typography>
                            <Typography color="warning.main" sx={{ fontWeight: (t: Theme) => t.typography.fontWeightBold }}>{t('dashboard_user_userpackages:ExpIPColumnRenderDT')} : </Typography>
                            {new Date(typeof d.rowData?.exp_ip_at === 'number' ? d.rowData.exp_ip_at : new Date().getTime()).toLocaleString()}
                        </Typography>
                    )}
                    {
                        (
                            typeof d.rowData?.ip === 'string' && d.rowData.ip.length > 0 &&
                            typeof d.rowData?.left_cycle_time === 'number' && d.rowData.left_cycle_time > 0 &&
                            (d.rowData?.exp_package_at !== d.rowData?.exp_ip_at ||
                                (typeof d.rowData?.renew_package_at === 'number' && d.rowData.renew_package_at <= new Date().getTime())
                            )
                        ) && (
                            <IconButton
                                onClick={() => setDialogRenew({ userPackageID: d?.idData })}
                            ><Sync /></IconButton>
                        )
                    }
                </Box>)
            }
        ]
        return (<DataTableLikeTranslation
            ref={dtRef}
            columns={columns}
            idData="id"
            fetchInfo={`${config.BACKEND_URL}/api/v1/user/user_package/datatables`}
            fetchInit={{ headers: { 'Authorization': `Bearer ${auth?.jwt ?? ""}` } }}
            fetchMiddleware={async (res) => {
                if ((auth?.jwt ?? "").length > 0) {
                    await auth.fetchResMiddleware(res)
                    return await res.json()
                } else return {}
            }}
            globalSearchDT
        />)
    }, [auth?.jwt, t])
    return (<>
        <Card>
            <CardHeader title={t('dashboard_user_userpackages:UserPackageTitle')} />
            <CardContent>
                {DT}
            </CardContent>
        </Card>
        <Suspense>
            <SetPoolDialog
                userPackageID={dialogSetPool?.userPackageID}
                poolID={dialogSetPool?.poolID}
                onClose={() => setDialogSetPool(undefined)}
                afterSet={() => {
                    if (dtRef?.current?.refresh !== undefined) dtRef.current.refresh()
                    setDialogSetPool(undefined)
                }}
            />
        </Suspense>
        <Suspense>
            <DeletePoolDialog
                userPackageID={dialogDeletePool?.userPackageID}
                onClose={() => setDialogDeletePool(undefined)}
                afterDelete={() => {
                    if (dtRef?.current?.refresh !== undefined) dtRef.current.refresh()
                    setDialogDeletePool(undefined)
                }}
            />
        </Suspense>
        <Suspense>
            <TopUpQtyDialog
                toUserPackageID={dialogTopUpQty?.toUserPackageID}
                onClose={() => setDialogTopUpQty(undefined)}
                afterTopUp={() => {
                    if (dtRef?.current?.refresh !== undefined) dtRef.current.refresh()
                    setDialogTopUpQty(undefined)
                }}
            />
        </Suspense>
        <Suspense>
            <GetIPDialog
                userPackageID={dialogGetIP?.userPackageID}
                onClose={() => setDialogGetIP(undefined)}
                afterGet={() => {
                    if (dtRef?.current?.refresh !== undefined) dtRef.current.refresh()
                    setDialogGetIP(undefined)
                }}
            />
        </Suspense>
        <Suspense>
            <RenewKeyDialog
                userPackageID={dialogRenewKey?.userPackageID}
                onClose={() => setDialogRenewKey(undefined)}
                afterRenew={() => {
                    if (dtRef?.current?.refresh !== undefined) dtRef.current.refresh()
                    setDialogRenewKey(undefined)
                }}
            />
        </Suspense>
        <Suspense>
            <RenewDialog
                userPackageID={dialogRenew?.userPackageID}
                onClose={() => setDialogRenew(undefined)}
                afterRenew={() => {
                    if (dtRef?.current?.refresh !== undefined) dtRef.current.refresh()
                    setDialogRenew(undefined)
                }}
            />
        </Suspense>
    </>)
}

export { Component }