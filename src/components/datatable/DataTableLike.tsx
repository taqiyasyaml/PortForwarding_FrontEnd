import { Badge, Box, Button, CircularProgress, FormControl, FormControlLabel, Grid, IconButton, InputLabel, MenuItem, Pagination, Select, Skeleton, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableProps, TableRow, TextField, Typography } from "@mui/material"
import { DTSearch } from "./DataTableFilterPopover"
import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import JSONtoQueryRequest from "../../helper/jsonqueryrequest"
import { ArrowUpward, FilterList, Sync } from "@mui/icons-material"
import DataTableHeaderDefault, { DataTableHeaderDefaultProps } from "./DataTableHeaderDefault"

type TData = string | number | boolean | null
const isTData = (data: any): boolean => data === null || typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean'
type TDataObj = { [key: string]: TData }

interface DTColumn {
    data?: string,
    name?: string,
    searchable?: boolean,
    orderable?: boolean,
}
interface DTColumnReq extends DTColumn {
    search?: DTSearch
}
interface DTOrderReq {
    column: number,
    dir: 'asc' | 'desc',
}

interface DTRequest {
    draw?: number,
    start: number,
    length?: number,
    search?: DTSearch,
    order?: DTOrderReq[],
    columns: DTColumnReq[],
}
interface DTResponse {
    draw?: number,
    recordsTotal?: number,
    recordsFiltered?: number,
    data?: TDataObj[],
    error?: string
}

interface DTColumnRow extends DTColumn {
    keyId: string,
    setData?: (data: { rowData?: TDataObj, rawData?: TData }) => TData,
    formatData?: (data: { rowData?: TDataObj, rawData?: TData }) => TData,
    renderData?: (data: { idData: any, rowData?: TDataObj, rawData?: any, formattedData?: any }) => JSX.Element,
    searchType?: DataTableHeaderDefaultProps['searchType']
}

interface DataTableLikeTranslation {
    GlobalSearchValueTextFieldLabel?: string,
    GlobalSearchRegexSwitchLabel?: string,
    GlobalSearchIsNotSwitchLabel?: string,
    FirstDataPrefix?: string,
    FirstDataBetweenLastData?: string,
    LastDataBetweenFilteredTotal?: string,
    FilteredTotalPostfix?: string,
    DataTotalPrefix?: string,
    DataTotalPostfix?: string,
    RowsPerPage?: string
}

interface DataTableLikeProps extends TableProps {
    columns: DTColumnRow[],
    idData: string,
    fetchInfo: RequestInfo | URL,
    fetchInit?: RequestInit,
    fetchMiddleware?: (res: Response) => Promise<DTResponse>
    globalSearchDT?: boolean,
    translation?: DataTableLikeTranslation,
    filterTranslation?: DataTableHeaderDefaultProps['filterTranslation']
}
interface DataTableLikeRef {
    refresh: () => Promise<boolean>
}
const DataTableLike = forwardRef<DataTableLikeRef, DataTableLikeProps>((props, ref) => {
    const [isLoading, setLoading] = useState<boolean>(false)
    const [serverError, setServerError] = useState<boolean>(false)

    const [lastDraw, setLastDraw] = useState<number | undefined>()

    const [dtGlobalSearch, setDTGlobalSearch] = useState<Pick<DTSearch, "value" | "regex" | "is_not"> | undefined>()
    const [lastDTColumnReq, setLastDTColumnReq] = useState<DTColumnReq[]>([])
    const [dtColumnReq, setDTColumnReq] = useState<DTColumnReq[]>([])
    const [dtOrderReq, setDTOrderReq] = useState<DTOrderReq[]>([])
    const [dtData, setDTData] = useState<TDataObj[]>([])
    const [dtPagination, setDTPagination] = useState<{
        page: number,
        length: number
    }>({ page: 1, length: 10 })
    const [bodyCells, setBodyCells] = useState<(JSX.Element[])[]>([])
    const [headerCells, setHeaderCells] = useState<JSX.Element[]>([])
    const [totalRecords, setTotalRecords] = useState<{
        recordsTotal: number,
        recordsFiltered: number
    }>({ recordsTotal: 0, recordsFiltered: 0 })

    const propsTable: TableProps = Object.keys(props).filter(
        k => !['columns', 'idData', 'fetchInfo', 'fetchInit', 'fetchMiddleware', 'globalSearchDT', 'translation', 'filterTranslation'].includes(k)
    ).reduce((p, k) => ({ ...p, [k]: props[k as keyof TableProps] }), {})

    useImperativeHandle(ref, () => ({
        refresh: sendDTRequest
    }))

    useEffect(() => {
        setDTOrderReq(
            v => [...v.filter(old => typeof old?.column === 'number' && old.column >= 0 &&
                dtColumnReq?.[old.column]?.data === props.columns?.[old.column]?.data && props.columns[old.column]?.orderable === true
            )]
        )
        setDTColumnReq(
            v => props.columns.map(
                ({ data, name, searchable, orderable }, i) => ({
                    data, name, searchable, orderable,
                    search: (searchable === true && v?.[i]?.data === data) ? v[i]?.search : undefined
                })
            )
        )
        const tmpBodyCells: (JSX.Element[])[] = []
        for (const data of dtData) {
            if (typeof data !== 'object') continue
            const idData = data?.[props.idData]
            if (typeof idData !== 'string' && typeof idData !== 'number') continue
            tmpBodyCells.push(
                props.columns.map(col => {
                    const tmpRawDataPrimer = col?.data === undefined ? undefined : data?.[col.data]
                    const tmpRawData = col?.setData === undefined ?
                        tmpRawDataPrimer :
                        col.setData({ rowData: data, rawData: tmpRawDataPrimer })
                    const tmpFixRawData = isTData(tmpRawData) ? tmpRawData : undefined
                    const tmpFormatData = col?.formatData === undefined ?
                        tmpFixRawData :
                        col.formatData({ rowData: data, rawData: tmpFixRawData })
                    return (
                        col?.renderData === undefined ?
                            (<>
                                {
                                    tmpFormatData === null ? "null" :
                                        (typeof tmpFormatData === 'string' ? tmpFormatData :
                                            (typeof tmpFormatData === 'number' ? tmpFormatData.toString() :
                                                (typeof tmpFormatData === 'boolean' ? (tmpFormatData === true ? 'true' : 'false') :
                                                    ""
                                                )
                                            )
                                        )
                                }
                            </>) :
                            col.renderData({ idData, rowData: data, rawData: tmpFixRawData, formattedData: tmpFormatData })
                    )
                })
            )
        }
        setBodyCells(tmpBodyCells)
    }, [props.columns, props.idData, dtData])
    useEffect(() => {
        sendDTRequest().catch(e => console.log(e))
    }, [props.fetchInfo, props.fetchInit])
    useEffect(() => {
        let isChange = dtColumnReq.length !== lastDTColumnReq.length
        const tmpCols: DTColumnReq[] = []
        for (const [i_col, col] of Object.entries(dtColumnReq)) {
            const lastCol = lastDTColumnReq?.[parseInt(i_col)]
            if (col?.data !== lastCol?.data || col?.name !== lastCol?.name)
                isChange = true
            tmpCols.push({ data: col?.data, name: col?.name })
        }
        if (isChange === true) {
            setLastDTColumnReq(tmpCols)
            sendDTRequest().catch(e => console.log(e))
        }
    }, [dtColumnReq, lastDTColumnReq])
    useEffect(() => {
        setHeaderCells(
            props.columns.map((v, i) => {
                const headerProps: DataTableHeaderDefaultProps = {
                    name: v?.name ?? "",
                    orderable: v?.orderable === true,
                    searchable: v?.searchable === true,
                    searchType: v?.searchType,
                    isServerLoading: isLoading,
                    filterTranslation: props?.filterTranslation
                }
                if (headerProps.orderable === true) {
                    headerProps.totalOrder = dtOrderReq.length
                    const indexOrder = dtOrderReq.findIndex(v => v.column === i)
                    if (indexOrder >= 0) {
                        headerProps.orderNum = indexOrder + 1
                        headerProps.orderDir = dtOrderReq[indexOrder].dir
                    }
                    headerProps.toggleDir = () => onToggleOrder(i, headerProps?.orderDir)
                }
                if (headerProps.searchable === true) {
                    headerProps.onChangeSearch = (search) => onSearchChange(i, search)
                    headerProps.search = dtColumnReq?.[i]?.search
                }
                return (<DataTableHeaderDefault {...headerProps} />)
            })
        )
    }, [lastDTColumnReq, dtOrderReq, props?.filterTranslation])
    useEffect(() => {
        if (
            dtPagination.length > 0 && dtPagination.page > 0 &&
            (dtPagination.page - 1) * dtPagination.length < Math.max(1, totalRecords.recordsTotal)
        ) sendDTRequest().catch(e => console.log(e))
    }, [dtGlobalSearch, dtPagination])
    useEffect(() => {
        if (dtPagination.length <= 0)
            setDTPagination(p => ({ ...p, length: 1 }))
        else if (dtPagination.page <= 0)
            setDTPagination(p => ({ ...p, page: 1 }))
        else if (dtPagination.page > 1 && (dtPagination.page - 1) * dtPagination.length > totalRecords.recordsFiltered)
            setDTPagination(p => ({ ...p, page: Math.ceil(totalRecords.recordsFiltered / dtPagination.length) }))
    }, [dtPagination, totalRecords])

    const onToggleOrder = (i_column: number, dir?: 'asc' | 'desc') => {
        if (isLoading === true) return
        setDTOrderReq(data => {
            const tmpOrder = [...data]
            const indexOrder = tmpOrder.findIndex(v => v.column === i_column)
            if (dir === undefined && indexOrder < 0) tmpOrder.push({ column: i_column, dir: 'asc' })
            else if (dir === 'asc' && tmpOrder[indexOrder].dir === 'asc') tmpOrder[indexOrder].dir = 'desc'
            else if (dir === 'desc' && tmpOrder[indexOrder].dir === 'desc') tmpOrder.splice(indexOrder, 1)
            sendDTRequest({ dtOrderReq: tmpOrder }).catch(e => console.log(e))
            return tmpOrder
        })
    }
    const onSearchChange = (i_column: number, search?: DTSearch) => {
        if (isLoading === true) return
        setDTColumnReq(v => {
            const tmpCol = [...v]
            if (tmpCol?.[i_column] === undefined) return tmpCol
            tmpCol[i_column].search = search
            sendDTRequest({ dtColumnReq: tmpCol }).catch(e => console.log(e))
            return tmpCol
        })
    }

    const sendDTRequest = (
        tmpData: {
            dtGlobalSearch?: DTSearch,
            dtPagination?: ({ page: number, length: number }),
            dtColumnReq?: DTColumnReq[],
            dtOrderReq?: DTOrderReq[],
        } = {}
    ) => new Promise<boolean>(async (resolve, reject) => {
        if (dtColumnReq.length === 0 && dtColumnReq.length !== props.columns.length)
            return resolve(false)
        const draw = 1000 + Math.round(Math.random() * 8999)
        setLastDraw(draw)
        tmpData.dtPagination = tmpData.dtPagination ?? dtPagination
        tmpData.dtColumnReq = tmpData.dtColumnReq ?? dtColumnReq
        tmpData.dtOrderReq = tmpData.dtOrderReq ?? dtOrderReq
        tmpData.dtGlobalSearch = tmpData.dtGlobalSearch ?? dtGlobalSearch
        const dtReq: DTRequest = {
            draw,
            start: (tmpData.dtPagination.page - 1) * tmpData.dtPagination.length,
            length: tmpData.dtPagination.length,
            search:
                (typeof tmpData.dtGlobalSearch?.value === 'number' || (typeof tmpData.dtGlobalSearch?.value === 'string' && tmpData.dtGlobalSearch.value.length > 0)) ?
                    tmpData.dtGlobalSearch :
                    undefined,
            columns: tmpData.dtColumnReq,
            order: tmpData.dtOrderReq
        }
        const dtReqStr = JSONtoQueryRequest(dtReq)
        const fetch_method = props?.fetchInit?.method ?? "get"
        let resJSON: DTResponse = {}
        setServerError(false)
        setLoading(true)
        try {
            if (fetch_method.toLowerCase() === 'get') {
                if (typeof props.fetchInfo !== 'string')
                    throw new Error("Unsupported fetchInfo for GET DataTable request")
                const splitURL = props.fetchInfo.split("?")
                const res = await fetch(`${splitURL[0]}?${(splitURL?.[1] ?? "").length === 0 ? dtReqStr : `${splitURL?.[1] ?? ""}&${dtReqStr}`}`, props?.fetchInit)
                resJSON = await (props?.fetchMiddleware !== undefined ? props.fetchMiddleware(res) : (res.json() as DTResponse))
            } else if (props?.fetchInit !== undefined) {
                if (props.fetchInit?.body !== undefined && typeof props.fetchInit.body !== 'string')
                    throw new Error("Unsupported body for other GET DataTable request")
                else if (props.fetchInit?.headers !== undefined) {
                    const content_type: string =
                        (Array.isArray(props.fetchInit.headers) ?
                            (props.fetchInit.headers.find(v => v[0].toLowerCase() === 'content-type')?.[1] ?? "application/x-www-form-urlencoded") :
                            (Object.entries(props.fetchInit.headers).find(v => v[0].toLowerCase() === 'content-type')?.[1] ?? "application/x-www-form-urlencoded")
                        ).toLowerCase()
                    if (content_type === 'application/x-www-form-urlencoded') {
                        const res = await fetch(props.fetchInfo, {
                            ...props.fetchInit,
                            headers: Array.isArray(props.fetchInit.headers) ?
                                [...props.fetchInit.headers.filter(v => v[0].toLowerCase() !== 'content-type'), ['Content-Type', 'application/x-www-form-urlencoded']] :
                                { ...props.fetchInit.headers, 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: (typeof props.fetchInit?.body !== 'string' || props.fetchInit.body.length === 0) ? dtReqStr : `${props.fetchInit.body}&${dtReqStr}`
                        })
                        resJSON = await (props?.fetchMiddleware !== undefined ? props.fetchMiddleware(res) : (res.json() as DTResponse))
                    } else if (content_type === 'aplication/json') {
                        const res = await fetch(props.fetchInfo, {
                            ...props.fetchInit, body: JSON.stringify(
                                (typeof props.fetchInit?.body !== 'string' || props.fetchInit.body.length === 0) ?
                                    dtReq : { ...JSON.parse(props.fetchInit.body), ...dtReq }
                            )
                        })
                        resJSON = await (props?.fetchMiddleware !== undefined ? props.fetchMiddleware(res) : (res.json() as DTResponse))
                    } else
                        throw new Error("Unsupported content-type for other GET DataTable request")
                } else {
                    const res = await fetch(props.fetchInfo, {
                        ...props.fetchInit, headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: dtReqStr
                    })
                    resJSON = await (props?.fetchMiddleware !== undefined ? props.fetchMiddleware(res) : (res.json() as DTResponse))
                }
            } else {
                const res = await fetch(props.fetchInfo, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: dtReqStr
                })
                resJSON = await (props?.fetchMiddleware !== undefined ? props.fetchMiddleware(res) : (res.json() as DTResponse))
            }
            setLoading(false)

        } catch (error) {
            setServerError(true)
            setLoading(false)
            setDTData([])
            return reject(error)
        }
        if (typeof resJSON?.draw !== 'number') return resolve(false)
        else return setLastDraw(
            v => {
                if (v !== resJSON.draw) {
                    setServerError(true)
                    resolve(false)
                    return v
                }
                setTotalRecords({
                    recordsTotal: typeof resJSON?.recordsTotal === 'number' && resJSON.recordsTotal >= 0 ? resJSON.recordsTotal : 0,
                    recordsFiltered: typeof resJSON?.recordsFiltered === 'number' && resJSON.recordsFiltered >= 0 ? resJSON.recordsFiltered : 0,
                })
                setDTData(Array.isArray(resJSON?.data) ? resJSON.data : [])
                resolve(true)
                return undefined
            }
        )
    })

    const onRetryClick = () => sendDTRequest().catch(e => console.log(e))

    return (<>
        <Grid container justifyContent='flex-end' sx={{ my: 0.5 }}>
            <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
                    {props?.globalSearchDT === true && (
                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', mr: 1 }}>
                            <TextField
                                label={props?.translation?.GlobalSearchValueTextFieldLabel ?? "Value"}
                                value={dtGlobalSearch?.value ?? ""}
                                onChange={e => {
                                    if (isLoading === true) return
                                    setDTGlobalSearch(v => v === undefined ? ({ value: e.target.value }) : ({ ...v, value: e.target.value }))
                                }}
                                size="small"
                                fullWidth
                            />
                            <Box>
                                <FormControlLabel
                                    control={<Switch
                                        checked={dtGlobalSearch?.regex === true}
                                        onChange={e => {
                                            if (isLoading === true) return
                                            setDTGlobalSearch(v => v === undefined ? ({ regex: e.target.checked }) : ({ ...v, regex: e.target.checked }))
                                        }}
                                    />}
                                    label={props?.translation?.GlobalSearchRegexSwitchLabel ?? "Regex"}
                                />
                                <FormControlLabel
                                    control={<Switch
                                        checked={dtGlobalSearch?.is_not === true}
                                        onChange={e => {
                                            if (isLoading === true) return
                                            setDTGlobalSearch(v => v === undefined ? ({ is_not: e.target.checked }) : ({ ...v, is_not: e.target.checked }))
                                        }}
                                    />}
                                    label={props?.translation?.GlobalSearchIsNotSwitchLabel ?? "Exclude"}
                                />
                            </Box>
                        </Box>
                    )}
                    <Button variant="contained" color={serverError === true ? "warning" : "primary"} onClick={isLoading !== true ? onRetryClick : undefined} disabled={isLoading === true}>
                        {isLoading === true ? <CircularProgress color="inherit" size={25} /> : <Sync />}
                    </Button>
                </Box>
            </Grid>
        </Grid>
        <TableContainer>
            <Table {...propsTable}>
                <TableHead>
                    <TableRow>
                        {headerCells.map((v, i) => (
                            <TableCell key={props.columns?.[i]?.keyId ?? i}>
                                {v}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {isLoading === true ?
                        [...Array(Math.max(1, bodyCells.length))].map((tmp, i) => (<TableRow key={i}>
                            {props.columns.map(c => (
                                <TableCell key={c.keyId}><Skeleton /></TableCell>
                            ))}
                        </TableRow>)) :
                        bodyCells.map((row, i_row) => {
                            const keyId = dtData?.[i_row]?.[props.idData]
                            return (
                                <TableRow key={(typeof keyId === 'string' && typeof keyId === 'number') ? keyId : i_row}>
                                    {row.map((cell, i_cell) => (
                                        <TableCell key={props.columns?.[i_cell]?.keyId ?? i_cell}>
                                            {cell}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            )
                        })
                    }
                </TableBody>
            </Table>
        </TableContainer>
        <Grid container spacing={1} sx={{ my: 0.5 }}>
            <Grid item xs={12}>
                <Typography variant="body2">
                    {
                        `${props?.translation?.FirstDataPrefix ?? "Showing data from"} ${Math.min((dtPagination.page - 1) * dtPagination.length + 1, totalRecords.recordsFiltered)} ` +
                        `${props?.translation?.FirstDataBetweenLastData ?? "to"} ${Math.min(dtPagination.page * dtPagination.length, totalRecords.recordsFiltered)} ` +
                        `${props?.translation?.LastDataBetweenFilteredTotal ?? "of"} ${totalRecords?.recordsFiltered} ` +
                        `${props?.translation?.FilteredTotalPostfix ?? "entries"}`
                    }
                    {totalRecords?.recordsFiltered !== totalRecords?.recordsTotal && (
                        ` ${props?.translation?.DataTotalPrefix ?? "(filtered from"} ${totalRecords?.recordsTotal} ` +
                        `${props?.translation?.DataTotalPostfix ?? "entries)"}`
                    )}
                </Typography>
            </Grid>
            <Grid item xs={1} sm={6} alignItems='center'>
                <FormControl>
                    <InputLabel>{props?.translation?.RowsPerPage ?? "Rows"}</InputLabel>
                    <Select
                        label={props?.translation?.RowsPerPage ?? "Rows"}
                        value={dtPagination?.length}
                        onChange={e => {
                            if (isLoading === true) return
                            setDTPagination(p => {
                                const len: number = Math.max(1, parseInt(e.target.value as string))
                                const currentStart = (p.page - 1) * p.length
                                return { page: Math.max(1, Math.floor(currentStart / len) + 1), length: len }
                            })
                        }}
                    >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={15}>15</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                        <MenuItem value={100}>100</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={11} sm={6} display='flex' justifyContent='flex-end' alignItems='center'>
                <Pagination
                    count={Math.ceil(totalRecords.recordsFiltered / dtPagination.length)}
                    page={dtPagination.page}
                    siblingCount={1}
                    boundaryCount={1}
                    onChange={(e, page) => {
                        if (isLoading === true) return
                        setDTPagination(v => ({ ...v, page }))
                    }}
                />
            </Grid>
        </Grid>
    </>)
})
export type { DataTableLikeProps, DataTableLikeRef }
export default DataTableLike