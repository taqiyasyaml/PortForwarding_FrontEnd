import { useContext, useState, Suspense, useRef, useMemo, useEffect } from "react"
import { AuthContext } from "../../../components/AuthProvider"
import { Box, Button, Card, CardContent, CardHeader, IconButton } from "@mui/material"
import AddDomainDialog from "../../../components/dashboard/user/domain/AddDomainDialog"
import EditDomainDialog, { EditDomainFormField } from "../../../components/dashboard/user/domain/EditDomainDialog"
import DeleteDomainDialog from "../../../components/dashboard/user/domain/DeleteDomainDialog"
import { DataTableLikeProps, DataTableLikeRef } from "../../../components/datatable/DataTableLike"
import DataTableLikeTranslation from "../../../components/datatable/DataTableLikeTranslation"
import config from "../../../config"
import { Delete, Edit } from "@mui/icons-material"
import { useTranslation } from "react-i18next"

const Component = () => {
    const auth = useContext(AuthContext)
    const [openAddDomainDialog, setOpenAddDomainDialog] = useState<boolean>(false)
    const [editDomainDialog, setEditDomainDialog] = useState<EditDomainFormField | undefined>(undefined)
    const [deleteDomainDialogDomainName, setDeleteDomainDialogDomainName] = useState<string | undefined>(undefined)
    const dtRef = useRef<DataTableLikeRef>(null)
    const { t } = useTranslation(['dashboard_user_domains'])

    useEffect(() => {
        document.title = `${t('dashboard_user_domains:DomainsTitle')} | ${config.APP_NAME}`
        return () => { document.title = config.APP_NAME }
    }, [])

    const DT = useMemo<JSX.Element>(() => {
        const columns: DataTableLikeProps['columns'] = [
            {
                keyId: 'name', data: 'name', name: t('dashboard_user_domains:DomainNameNameDT'),
                orderable: true, searchable: true, searchType: { strSearch: true }
            },
            {
                keyId: 'pool_uuid', data: 'pool_uuid', name: t('dashboard_user_domains:PoolUUIDNameDT'),
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
                keyId: 'http_port', data: 'http_port', name: t('dashboard_user_domains:HTTPPortNameDT'),
                orderable: true, searchable: true, searchType: { numSearch: 'num' },
                formatData: (d) => typeof d.rawData === 'number' && d.rawData > 0 ?
                    (typeof d?.rowData?.ip === 'string' && d.rowData.ip.length > 0 ? `${d.rowData.ip}:${d.rawData}` : d?.rawData ?? 0) :
                    t('dashboard_user_domains:RedirectFormatHTTPPortDT')
            },
            {
                keyId: 'https_port', data: 'https_port', name: t('dashboard_user_domains:HTTPsPortNameDT'),
                orderable: true, searchable: true, searchType: { numSearch: 'num' },
                formatData: (d) => typeof d.rawData === 'number' && d.rawData > 0 ?
                    (typeof d?.rowData?.ip === 'string' && d.rowData.ip.length > 0 ? `${d.rowData.ip}:${d.rawData}` : d?.rawData ?? 0) :
                    (
                        typeof d?.rowData?.name === 'string' && d.rowData.name.slice(-1 * config.DOMAIN_MAIN.length).toLowerCase() === config.DOMAIN_MAIN.toLowerCase()
                            ? t('dashboard_user_domains:ProxyFormatHTTPsPortDT') : t('dashboard_user_domains:BlockFormatHTTPsPortDT')
                    )
            },
            {
                keyId: 'action', renderData: (d) => {
                    return (<>
                        <Box display='flex' flexDirection='row' justifyContent='flex-end'>
                            <IconButton
                                onClick={() => setDeleteDomainDialogDomainName((d?.rowData?.name ?? "") as string)}
                            ><Delete /></IconButton>
                            <IconButton
                                onClick={() => setEditDomainDialog((d?.rowData ?? {}) as any)}
                            ><Edit /></IconButton>
                        </Box>
                    </>)
                }
            }
        ]
        return (<DataTableLikeTranslation
            idData="name"
            globalSearchDT
            columns={columns}
            fetchInfo={`${config.BACKEND_URL}/api/v1/user/domain/datatables`}
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
                title={t('dashboard_user_domains:DomainsTitle')}
                subheader={<Button
                    variant="contained"
                    onClick={() => setOpenAddDomainDialog(true)}
                >{t('dashboard_user_domains:AddDomainButtonLabel')}</Button>}
            />
            <CardContent>
                {DT}
            </CardContent>
        </Card>
        <Suspense>
            <AddDomainDialog
                open={openAddDomainDialog}
                onClose={() => setOpenAddDomainDialog(false)}
                afterAdd={() => {
                    setOpenAddDomainDialog(false)
                    if (dtRef?.current?.refresh !== undefined) dtRef.current.refresh()
                }}
            />
        </Suspense>
        <Suspense>
            <EditDomainDialog
                domain={editDomainDialog}
                onClose={() => setEditDomainDialog(undefined)}
                afterEdit={() => {
                    setEditDomainDialog(undefined)
                    if (dtRef?.current?.refresh !== undefined) dtRef.current.refresh()
                }}
            />
        </Suspense>
        <Suspense>
            <DeleteDomainDialog
                domainName={deleteDomainDialogDomainName}
                onClose={() => setDeleteDomainDialogDomainName(undefined)}
                afterDelete={() => {
                    setDeleteDomainDialogDomainName(undefined)
                    if (dtRef?.current?.refresh !== undefined) dtRef.current.refresh()
                }}
            />
        </Suspense>
    </>)
}

export { Component }