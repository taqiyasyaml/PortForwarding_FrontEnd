import { Popover, TextField, Box, Select, MenuItem, ToggleButtonGroup, ToggleButton, Grid, FormControl, InputLabel, FormControlLabel, Switch, Button, Chip, Theme, IconButton, Avatar, InputAdornment } from "@mui/material"
import dayjs from "dayjs"
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { useEffect, useState } from "react"
import { FilterList } from "@mui/icons-material"
import Select2Like, { Select2LikeProps } from "../Select2Like"
interface DTSearchStr {
    eq?: string,
    ne?: string
}
interface DTSearchNum {
    lt?: number,
    lte?: number,
    eq?: number,
    ne?: number,
    gt?: number,
    gte?: number,
}
interface DTSearchArr {
    in?: (string | number)[],
    nin?: (string | number)[]
}
interface DTSearchStr {
    eq?: string,
    ne?: string,
    contain?: string,
    contain_not?: string,
    start?: string,
    start_not?: string,
    end?: string,
    end_not?: string,
}
interface DTSearchNull {
    is_null?: boolean,
    not_null?: boolean
}
interface DTSearch {
    value?: string | number,
    regex?: boolean,
    is_not?: boolean,
    str?: DTSearchStr,
    num?: DTSearchNum,
    arr?: DTSearchArr,
    nul?: DTSearchNull
}

type DataTableTypeSearch = 'default' | 'str' | 'num' | 'nul' | 'arr'
type DataTableStrSearchOperator = 'start' | 'eq' | 'contain' | 'end'
type DataTableStrNumOperator = 'lt' | 'eq' | 'both' | 'gt'
type DataTableNumSearch = 'num' | 'utc_s' | 'utc_ms'

interface DataTableArrSearch {
    label?: string,
    value: string | number
}

interface DataTableFilterPopOverTranslation {
    DataTypeSelect?: string,
    DefaultSelectTypeItem?: string,
    NumberSelectTypeItem?: string,
    DateSelectTypeItem?: string,
    StringSelectTypeItem?: string,
    ArraySelectTypeItem?: string,
    NullSelectTypeItem?: string,
    ClearSelectTypeItem?: string,
    DefaultValueLabel?: string,
    DefaultRegexLabel?: string,
    DefaultIsNotLabel?: string,
    NumEqualToggleLabel?: string,
    NumLowerToggleLabel?: string,
    NumBothToggleLabel?: string,
    NumGreaterToggleLabel?: string,
    NumValueTextFieldLabel?: string,
    NumLowerTextFieldLabel?: string,
    NumGreaterTextFieldLabel?: string,
    NumEqualSwitchLabel?: string,
    NumNotEqualSwitchLabel?: string,
    DateEqualToggleLabel?: string,
    DateLowerToggleLabel?: string,
    DateBothToggleLabel?: string,
    DateGreaterToggleLabel?: string,
    DateValueTextFieldLabel?: string,
    DateLowerTextFieldLabel?: string,
    DateGreaterTextFieldLabel?: string,
    DateEqualSwitchLabel?: string,
    DateNotEqualSwitchLabel?: string,
    ArrValueLabel?: string,
    ArrIsNotSwitchLabel?: string,
    StrEqualToggleLabel?: string,
    StrStartToggleLabel?: string,
    StrContainToggleLabel?: string,
    StrEndToggleLabel?: string,
    StrValueTextFieldLabel?: string,
    StrNotEqualSwitchLabel?: string,
    StrExcludeSwitchLabel?: string,
    NulIsNullToggleLabel?: string,
    NulAnyToggleLabel?: string,
    NulNotNullToggleLabel?: string
}

interface DataTableFilterPopoverProps {
    onSearchSubmit?: (search?: DTSearch) => void,
    search?: DTSearch,
    strSearch?: boolean,
    numSearch?: DataTableNumSearch,
    arrSearch?: (DataTableArrSearch | string | number)[] | Select2LikeProps<any, true, undefined, undefined>,
    nulSearch?: boolean
    translation?: DataTableFilterPopOverTranslation,
    isServerLoading?: boolean,
    numFactor?: number,
    numUnit?: string
}


const DataTableFilterPopover = (props: DataTableFilterPopoverProps) => {
    const [anchorOriginReferenceElement, setAnchorOriginReferenceElement] = useState<HTMLElement | null>(null)

    const [isSearch, setIsSearch] = useState<boolean>(false)
    const [typeSearch, setTypeSearch] = useState<DataTableTypeSearch>('default')

    const [defaultSearchVals, setDefaultSearchVals] = useState<{
        value: string | number,
        regex: boolean,
        is_not: boolean
    }>({ value: "", regex: false, is_not: false })

    const [numSearchVals, setNumSearchVals] = useState<{
        lt: number,
        value: number,
        gt: number,
        operator: DataTableStrNumOperator,
        include_equal: boolean
    }>({ lt: 0, gt: 0, value: 0, operator: "eq", include_equal: true })

    const [arrSearchVals, setArrSearchVals] = useState<{
        value: (string | number)[],
        is_not: boolean
    }>({ value: [], is_not: false })
    const [arrSearchItems, setArrSearchItems] = useState<DataTableArrSearch[]>([])

    const [strSearchVals, setStrSearchVals] = useState<{
        value: string,
        operator: DataTableStrSearchOperator,
        is_not: boolean
    }>({ value: "", operator: "eq", is_not: false })

    const [nulSearchVals, setNulSearchVals] = useState<{
        is_null: boolean,
        not_null: boolean,
    }>({ is_null: false, not_null: false })

    useEffect(() => {
        const defaultNum: number = props?.numSearch === 'utc_ms' ? (new Date().getTime()) : (props?.numSearch === 'utc_s' ? Math.round((new Date().getTime()) / 1000) : 0)
        //num
        if (props?.numSearch !== undefined && (
            props?.search?.num?.gt !== undefined ||
            props?.search?.num?.gte !== undefined ||
            props?.search?.num?.eq !== undefined ||
            props?.search?.num?.ne !== undefined ||
            props?.search?.num?.lt !== undefined ||
            props?.search?.num?.lte !== undefined
        )) {
            setIsSearch(true)
            setTypeSearch('num')
            if (props?.search?.num?.gte !== undefined && props?.search?.num?.lte !== undefined)
                setNumSearchVals({ operator: 'both', gt: props.search.num.gte, value: defaultNum, lt: props.search.num.lte, include_equal: true })
            else if (props?.search?.num?.gt !== undefined && props?.search?.num?.lt !== undefined)
                setNumSearchVals({ operator: 'both', gt: props.search.num.gt, value: defaultNum, lt: props.search.num.lt, include_equal: false })
            else if (props?.search?.num?.eq !== undefined)
                setNumSearchVals({ operator: 'eq', gt: defaultNum, value: props.search.num.eq, lt: defaultNum, include_equal: true })
            else if (props?.search?.num?.ne !== undefined)
                setNumSearchVals({ operator: 'eq', gt: defaultNum, value: props.search.num.ne, lt: defaultNum, include_equal: false })
            else if (props?.search?.num?.lt !== undefined)
                setNumSearchVals({ operator: 'lt', gt: defaultNum, value: props.search.num.lt, lt: defaultNum, include_equal: false })
            else if (props?.search?.num?.lte !== undefined)
                setNumSearchVals({ operator: 'lt', gt: defaultNum, value: props.search.num.lte, lt: defaultNum, include_equal: true })
            else if (props?.search?.num?.gt !== undefined)
                setNumSearchVals({ operator: 'gt', gt: defaultNum, value: props.search.num.gt, lt: defaultNum, include_equal: false })
            else if (props?.search?.num?.gte !== undefined)
                setNumSearchVals({ operator: 'gt', gt: defaultNum, value: props.search.num.gte, lt: defaultNum, include_equal: true })
        }
        //arr
        else if (props?.arrSearch !== undefined && (
            (props?.search?.arr?.in !== undefined && props.search.arr.in.length > 0) ||
            (props?.search?.arr?.nin !== undefined && props.search.arr.nin.length > 0)
        )) {
            setIsSearch(true)
            setTypeSearch('arr')
            if (props?.search?.arr?.in !== undefined && props.search.arr.in.length > 0)
                setArrSearchVals({ value: props.search.arr.in, is_not: false })
            else if (props?.search?.arr?.nin !== undefined && props.search.arr.nin.length > 0)
                setArrSearchVals({ value: props.search.arr.nin, is_not: true })
        }
        //str
        else if (props?.strSearch === true && (
            (props?.search?.str?.eq !== undefined && props.search.str.eq.length > 0) ||
            (props?.search?.str?.ne !== undefined && props.search.str.ne.length > 0) ||
            (props?.search?.str?.contain !== undefined && props.search.str.contain.length > 0) ||
            (props?.search?.str?.contain_not !== undefined && props.search.str.contain_not.length > 0) ||
            (props?.search?.str?.start !== undefined && props.search.str.start.length > 0) ||
            (props?.search?.str?.start_not !== undefined && props.search.str.start_not.length > 0) ||
            (props?.search?.str?.end !== undefined && props.search.str.end.length > 0) ||
            (props?.search?.str?.end_not !== undefined && props.search.str.end_not.length > 0)
        )) {
            setIsSearch(true)
            setTypeSearch('str')
            if (props?.search?.str?.eq !== undefined && props.search.str.eq.length > 0)
                setStrSearchVals({ operator: 'eq', value: props.search.str.eq, is_not: false })
            else if (props?.search?.str?.ne !== undefined && props.search.str.ne.length > 0)
                setStrSearchVals({ operator: 'eq', value: props.search.str.ne, is_not: true })
            else if (props?.search?.str?.contain !== undefined && props.search.str.contain.length > 0)
                setStrSearchVals({ operator: 'contain', value: props.search.str.contain, is_not: false })
            else if (props?.search?.str?.contain_not !== undefined && props.search.str.contain_not.length > 0)
                setStrSearchVals({ operator: 'contain', value: props.search.str.contain_not, is_not: true })
            else if (props?.search?.str?.start !== undefined && props.search.str.start.length > 0)
                setStrSearchVals({ operator: 'start', value: props.search.str.start, is_not: false })
            else if (props?.search?.str?.start_not !== undefined && props.search.str.start_not.length > 0)
                setStrSearchVals({ operator: 'start', value: props.search.str.start_not, is_not: true })
            else if (props?.search?.str?.end !== undefined && props.search.str.end.length > 0)
                setStrSearchVals({ operator: 'end', value: props.search.str.end, is_not: false })
            else if (props?.search?.str?.end_not !== undefined && props.search.str.end_not.length > 0)
                setStrSearchVals({ operator: 'end', value: props.search.str.end_not, is_not: true })
        }
        //null
        else if (props?.nulSearch === true && (
            props?.search?.nul?.not_null !== undefined ||
            props?.search?.nul?.is_null !== undefined
        )) {
            setIsSearch(true)
            setTypeSearch('nul')
            if (props?.search?.nul?.not_null === true)
                setNulSearchVals({ is_null: false, not_null: true })
            else if (props?.search?.nul?.is_null === true)
                setNulSearchVals({ is_null: true, not_null: false })
            else
                setNulSearchVals({ is_null: false, not_null: false })
        }
        //default
        else if (typeof props?.search?.value === 'number' || (typeof props?.search?.value === 'string' && props.search.value.length > 0)) {
            setIsSearch(true)
            setTypeSearch('default')
            setDefaultSearchVals({ value: props.search.value, regex: props.search?.regex === true, is_not: props.search?.is_not === true })
        }
        //num
        else if (props?.numSearch !== undefined) {
            setIsSearch(false)
            setTypeSearch('num')
            setNumSearchVals({ operator: 'eq', lt: defaultNum, value: defaultNum, gt: defaultNum, include_equal: true })
        }
        //str
        else if (props?.strSearch === true) {
            setIsSearch(false)
            setTypeSearch('str')
            setStrSearchVals({ operator: 'eq', value: '', is_not: false })
        }
        //arr
        else if (props?.arrSearch !== undefined) {
            setIsSearch(false)
            setTypeSearch('arr')
            setArrSearchVals({ value: [], is_not: false })
        }
        //nul
        else if (props?.nulSearch === true) {
            setIsSearch(false)
            setTypeSearch('nul')
            setNulSearchVals({ is_null: false, not_null: false })
        }
        //default
        else {
            setIsSearch(false)
            setTypeSearch('default')
            setDefaultSearchVals({ value: '', regex: false, is_not: false })
        }
    }, [props?.search])
    useEffect(() => {
        if (Array.isArray(props?.arrSearch))
            setArrSearchItems(
                props.arrSearch.map(
                    (v: string | number | DataTableArrSearch): DataTableArrSearch => {
                        if (typeof v === 'string') return { label: v, value: v }
                        else if (typeof v === 'number') {
                            if (props?.numSearch === 'utc_s')
                                return { label: new Date(v * 1000).toLocaleString(), value: v }
                            else if (props?.numSearch === 'utc_ms')
                                return { label: new Date(v).toLocaleString(), value: v }
                            else
                                return { label: v.toString(), value: v }
                        } else if (v?.label === undefined)
                            return { label: typeof v.value === 'string' ? v.value : v.value.toString(), value: v.value }
                        else
                            return v
                    }
                ).filter((v, i, a) => a.findIndex(v_i => v_i.value === v.value) === i)
            )
        else if (typeof props?.arrSearch === 'object') {
            setArrSearchItems([])
        } else setArrSearchItems([])
    }, [props?.arrSearch])

    const onSearchClick = () => {
        let tmpSearch: DTSearch | undefined
        //num
        if (typeSearch === 'num') {
            if (numSearchVals.operator === 'eq' && numSearchVals.include_equal === true && (props?.numSearch === 'num' || numSearchVals.value > 0))
                tmpSearch = { num: { eq: numSearchVals.value } }
            else if (numSearchVals.operator === 'eq' && numSearchVals.include_equal !== true && (props?.numSearch === 'num' || numSearchVals.value > 0))
                tmpSearch = { num: { ne: numSearchVals.value } }
            else if (numSearchVals.operator === 'both' && numSearchVals.include_equal === true && (props?.numSearch === 'num' || (numSearchVals.gt > 0 && numSearchVals.lt > 0)))
                tmpSearch = { num: { lte: numSearchVals.lt, gte: numSearchVals.gt } }
            else if (numSearchVals.operator === 'both' && numSearchVals.include_equal !== true && (props?.numSearch === 'num' || (numSearchVals.gt > 0 && numSearchVals.lt > 0)))
                tmpSearch = { num: { lt: numSearchVals.lt, gt: numSearchVals.gt } }
            else if (numSearchVals.operator === 'lt' && numSearchVals.include_equal === true && (props?.numSearch === 'num' || numSearchVals.value > 0))
                tmpSearch = { num: { lte: numSearchVals.value } }
            else if (numSearchVals.operator === 'lt' && numSearchVals.include_equal !== true && (props?.numSearch === 'num' || numSearchVals.value > 0))
                tmpSearch = { num: { lt: numSearchVals.value } }
            else if (numSearchVals.operator === 'gt' && numSearchVals.include_equal === true && (props?.numSearch === 'num' || numSearchVals.value > 0))
                tmpSearch = { num: { gte: numSearchVals.value } }
            else if (numSearchVals.operator === 'gt' && numSearchVals.include_equal !== true && (props?.numSearch === 'num' || numSearchVals.value > 0))
                tmpSearch = { num: { gt: numSearchVals.value } }
            else tmpSearch = undefined
        }
        //arr
        else if (typeSearch === 'arr') {
            if (arrSearchVals.value.length > 0 && arrSearchVals.is_not !== true) tmpSearch = { arr: { in: arrSearchVals.value } }
            else if (arrSearchVals.value.length > 0 && arrSearchVals.is_not === true) tmpSearch = { arr: { nin: arrSearchVals.value } }
            else tmpSearch = undefined
        }
        //str
        else if (typeSearch === 'str') {
            if (strSearchVals.operator === 'eq' && strSearchVals.is_not !== true && strSearchVals.value.length > 0)
                tmpSearch = { str: { eq: strSearchVals.value } }
            else if (strSearchVals.operator === 'eq' && strSearchVals.is_not === true && strSearchVals.value.length > 0)
                tmpSearch = { str: { ne: strSearchVals.value } }
            else if (strSearchVals.operator === 'contain' && strSearchVals.is_not !== true && strSearchVals.value.length > 0)
                tmpSearch = { str: { contain: strSearchVals.value } }
            else if (strSearchVals.operator === 'contain' && strSearchVals.is_not === true && strSearchVals.value.length > 0)
                tmpSearch = { str: { contain_not: strSearchVals.value } }
            else if (strSearchVals.operator === 'start' && strSearchVals.is_not !== true && strSearchVals.value.length > 0)
                tmpSearch = { str: { start: strSearchVals.value } }
            else if (strSearchVals.operator === 'start' && strSearchVals.is_not === true && strSearchVals.value.length > 0)
                tmpSearch = { str: { start_not: strSearchVals.value } }
            else if (strSearchVals.operator === 'end' && strSearchVals.is_not !== true && strSearchVals.value.length > 0)
                tmpSearch = { str: { end: strSearchVals.value } }
            else if (strSearchVals.operator === 'end' && strSearchVals.is_not === true && strSearchVals.value.length > 0)
                tmpSearch = { str: { end_not: strSearchVals.value } }
            else tmpSearch = undefined
        }
        //default
        else if (typeSearch === 'default') {
            if (typeof defaultSearchVals.value === 'number' || (typeof defaultSearchVals.value === 'string' && defaultSearchVals.value.length > 0))
                tmpSearch = { ...defaultSearchVals }
            else tmpSearch = undefined
        }
        //nul
        else if (typeSearch === 'nul') {
            if (nulSearchVals.is_null === true && nulSearchVals.not_null !== true) tmpSearch = { nul: { is_null: true } }
            else if (nulSearchVals.is_null !== true && nulSearchVals.not_null === true) tmpSearch = { nul: { not_null: true } }
            else tmpSearch = undefined
        }
        else tmpSearch = undefined
        if (typeof props?.onSearchSubmit === 'function') props.onSearchSubmit(tmpSearch)
        setAnchorOriginReferenceElement(null)
    }

    return (<>
        <IconButton onClick={e => setAnchorOriginReferenceElement(v => v === null ? e.currentTarget : null)}>
            {isSearch === true ? (<Avatar sx={{ bgcolor: 'primary.main' }}><FilterList /></Avatar>) : <FilterList />}
        </IconButton>
        <Popover
            open={anchorOriginReferenceElement !== null}
            onClose={() => setAnchorOriginReferenceElement(null)}
            anchorEl={anchorOriginReferenceElement ?? null}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
        >
            <Grid container spacing={1} padding={2} sx={{ width: { md: '30vw' } }}>
                <Grid item xs={12}>
                    <FormControl
                        fullWidth
                    >
                        <InputLabel>{props?.translation?.DataTypeSelect ?? "Data Type"}</InputLabel>
                        <Select
                            size="small"
                            label={props?.translation?.DataTypeSelect ?? "Data Type"}
                            value={typeSearch}
                            onChange={e => {
                                if (e.target.value === 'clear') {
                                    if (typeof props?.onSearchSubmit === 'function') props.onSearchSubmit()
                                    setAnchorOriginReferenceElement(null)
                                    return
                                }
                                setTypeSearch(t => {
                                    const new_t = e.target.value as DataTableTypeSearch
                                    if (new_t !== t) {
                                        const defaultNum: number = props?.numSearch === 'utc_ms' ? (new Date().getTime()) : (props?.numSearch === 'utc_s' ? Math.round((new Date().getTime()) / 1000) : 0)
                                        if (new_t === 'num' || t === 'num') setNumSearchVals({ operator: 'eq', lt: defaultNum, value: defaultNum, gt: defaultNum, include_equal: true })
                                        if (new_t === 'str' || t === 'str') setStrSearchVals({ operator: 'eq', value: '', is_not: false })
                                        if (new_t === 'arr' || t === 'arr') setArrSearchVals({ value: [], is_not: false })
                                        if (new_t === 'nul' || t === 'nul') setNulSearchVals({ is_null: false, not_null: false })
                                        setDefaultSearchVals({ value: '', regex: false, is_not: false })
                                    }
                                    return new_t
                                })
                            }}
                        >
                            <MenuItem value="default">{props?.translation?.DefaultSelectTypeItem ?? "Default"}</MenuItem>
                            {props?.strSearch === true && (
                                <MenuItem value="str">{props?.translation?.StringSelectTypeItem ?? "String"}</MenuItem>
                            )}

                            {props?.numSearch === 'num' && (
                                <MenuItem value="num">{props?.translation?.NumberSelectTypeItem ?? "Number"}</MenuItem>
                            )}
                            {(props?.numSearch === 'utc_s' || props?.numSearch === 'utc_ms') && (
                                <MenuItem value="num">{props?.translation?.DateSelectTypeItem ?? "Date"}</MenuItem>
                            )}

                            {props?.arrSearch !== undefined && (
                                <MenuItem value="arr">{props?.translation?.ArraySelectTypeItem ?? "Array"}</MenuItem>
                            )}

                            {props?.nulSearch === true && (
                                <MenuItem value="nul">{props?.translation?.NullSelectTypeItem ?? "Null"}</MenuItem>
                            )}
                            <MenuItem value="clear" disabled={props?.isServerLoading === true}>{props?.translation?.ClearSelectTypeItem ?? "Clear Filter"}</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                {/* Default */}
                {typeSearch === 'default' && (<>
                    <Grid item xs={12}>
                        <TextField
                            label={props?.translation?.DefaultValueLabel ?? "Value"}
                            value={defaultSearchVals.value}
                            onChange={e => setDefaultSearchVals(v => ({ ...v, value: e.target.value }))}
                            size="small"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={<Switch
                                checked={defaultSearchVals.regex === true}
                                onChange={e => setDefaultSearchVals(v => ({ ...v, regex: e.target.checked }))}
                            />}
                            label={props?.translation?.DefaultRegexLabel ?? "Regex"}
                        />
                        <FormControlLabel
                            control={<Switch
                                checked={defaultSearchVals.is_not === true}
                                onChange={e => setDefaultSearchVals(v => ({ ...v, is_not: e.target.checked }))}
                            />}
                            label={props?.translation?.DefaultIsNotLabel ?? "Exclude"}
                        />
                    </Grid>
                </>)}
                {/* Number */}
                {typeSearch === 'num' && props?.numSearch === 'num' && (<>
                    <Grid item xs={12}>
                        <ToggleButtonGroup
                            exclusive
                            value={numSearchVals?.operator}
                            onChange={(e, operator) => setNumSearchVals(v => {
                                if (operator === v.operator) return { ...v }
                                else return { operator, lt: 0, value: 0, gt: 0, include_equal: true }
                            })}
                            fullWidth
                            size="small"
                        >
                            <ToggleButton value='eq'>{props?.translation?.NumEqualToggleLabel ?? "Equal"}</ToggleButton>
                            <ToggleButton value='lt'>{props?.translation?.NumLowerToggleLabel ?? "Lower Than"}</ToggleButton>
                            <ToggleButton value='both'>{props?.translation?.NumBothToggleLabel ?? "Both"}</ToggleButton>
                            <ToggleButton value='gt'>{props?.translation?.NumGreaterToggleLabel ?? "Greater Than"}</ToggleButton>
                        </ToggleButtonGroup>
                    </Grid>
                    {numSearchVals?.operator === 'both' ? (<>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label={props?.translation?.NumLowerTextFieldLabel ?? "Greater Than"}
                                value={numSearchVals.gt / ((props?.numFactor ?? 0) === 0 ? 1 : props?.numFactor ?? 1)}
                                onChange={e => setNumSearchVals(v => ({ ...v, gt: parseFloat(e.target.value) * ((props?.numFactor ?? 0) === 0 ? 1 : props?.numFactor ?? 1) }))}
                                size="small"
                                fullWidth
                                type="number"
                                InputProps={
                                    props?.numUnit !== undefined ?
                                        { endAdornment: (<InputAdornment position="end">{props.numUnit}</InputAdornment>) }
                                        : {}
                                }
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label={props?.translation?.NumLowerTextFieldLabel ?? "Lower Than"}
                                value={numSearchVals.lt / ((props?.numFactor ?? 0) === 0 ? 1 : props?.numFactor ?? 1)}
                                onChange={e => setNumSearchVals(v => ({ ...v, lt: parseFloat(e.target.value) * ((props?.numFactor ?? 0) === 0 ? 1 : props?.numFactor ?? 1) }))}
                                size="small"
                                fullWidth
                                type="number"
                                InputProps={
                                    props?.numUnit !== undefined ?
                                        { endAdornment: (<InputAdornment position="end">{props.numUnit}</InputAdornment>) }
                                        : {}
                                }
                            />
                        </Grid>
                    </>) : (<Grid item xs={12}>
                        <TextField
                            label={props?.translation?.NumValueTextFieldLabel ?? "Value"}
                            value={numSearchVals.value / ((props?.numFactor ?? 0) === 0 ? 1 : props?.numFactor ?? 1)}
                            onChange={e => setNumSearchVals(v => ({ ...v, value: parseFloat(e.target.value) * ((props?.numFactor ?? 0) === 0 ? 1 : props?.numFactor ?? 1) }))}
                            size="small"
                            fullWidth
                            type="number"
                            InputProps={
                                props?.numUnit !== undefined ?
                                    { endAdornment: (<InputAdornment position="end">{props.numUnit}</InputAdornment>) }
                                    : {}
                            }
                        />
                    </Grid>)}
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={<Switch
                                checked={numSearchVals.operator === 'eq' ? numSearchVals.include_equal !== true : numSearchVals.include_equal === true}
                                onChange={e => setNumSearchVals(v => ({ ...v, include_equal: numSearchVals.operator === 'eq' ? !e.target.checked : e.target.checked }))}
                            />}
                            label={numSearchVals.operator === 'eq' ? (props?.translation?.NumNotEqualSwitchLabel ?? "Not Equal") : (props?.translation?.NumEqualSwitchLabel ?? "Equal")}
                        />
                    </Grid>
                </>)}
                {typeSearch === 'num' && (props?.numSearch === 'utc_s' || props?.numSearch === 'utc_ms') && (<LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Grid item xs={12}>
                        <ToggleButtonGroup
                            exclusive
                            value={numSearchVals?.operator}
                            onChange={(e, operator) => setNumSearchVals(v => {
                                const defaultNum = props?.numSearch === 'utc_s' ? Math.round(new Date().getTime() / 1000) : new Date().getTime()
                                const minute5 = props?.numSearch === 'utc_s' ? 300 : 300_000
                                if (operator === v.operator) return { ...v }
                                else return { operator, lt: defaultNum + minute5, value: defaultNum, gt: defaultNum - minute5, include_equal: true }
                            })}
                            fullWidth
                            size="small"
                        >
                            <ToggleButton value='eq'>{props?.translation?.DateEqualToggleLabel ?? "At"}</ToggleButton>
                            <ToggleButton value='lt'>{props?.translation?.DateLowerToggleLabel ?? "Before"}</ToggleButton>
                            <ToggleButton value='both'>{props?.translation?.DateBothToggleLabel ?? "Both"}</ToggleButton>
                            <ToggleButton value='gt'>{props?.translation?.DateGreaterToggleLabel ?? "After"}</ToggleButton>
                        </ToggleButtonGroup>
                    </Grid>
                    {numSearchVals?.operator === 'both' ? (<>
                        <Grid item xs={12} md={6}>
                            <DateTimePicker
                                label={props?.translation?.DateGreaterTextFieldLabel ?? "After"}
                                value={dayjs(props?.numSearch === 'utc_s' ? numSearchVals.gt * 1000 : numSearchVals.gt)}
                                onChange={d => setNumSearchVals(
                                    v => ({
                                        ...v,
                                        gt: props?.numSearch === 'utc_s' ?
                                            Math.round((d === null ? new Date().getTime() : d.toDate().getTime()) / 1000) :
                                            (d === null ? new Date().getTime() : d.toDate().getTime())
                                    })
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <DateTimePicker
                                label={props?.translation?.DateLowerTextFieldLabel ?? "Before"}
                                value={dayjs(props?.numSearch === 'utc_s' ? numSearchVals.lt * 1000 : numSearchVals.lt)}
                                onChange={d => setNumSearchVals(
                                    v => ({
                                        ...v,
                                        lt: props?.numSearch === 'utc_s' ?
                                            Math.round((d === null ? new Date().getTime() : d.toDate().getTime()) / 1000) :
                                            (d === null ? new Date().getTime() : d.toDate().getTime())
                                    })
                                )}
                            />
                        </Grid>
                    </>) : (<Grid item xs={12}>
                        <DateTimePicker
                            label={props?.translation?.DateValueTextFieldLabel ?? "At"}
                            value={dayjs(props?.numSearch === 'utc_s' ? numSearchVals.value * 1000 : numSearchVals.value)}
                            onChange={d => setNumSearchVals(
                                v => ({
                                    ...v,
                                    value: props?.numSearch === 'utc_s' ?
                                        Math.round((d === null ? new Date().getTime() : d.toDate().getTime()) / 1000) :
                                        (d === null ? new Date().getTime() : d.toDate().getTime())
                                })
                            )}
                        />
                    </Grid>)}
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={<Switch
                                checked={numSearchVals.operator === 'eq' ? numSearchVals.include_equal !== true : numSearchVals.include_equal === true}
                                onChange={e => setNumSearchVals(v => ({ ...v, include_equal: numSearchVals.operator === 'eq' ? !e.target.checked : e.target.checked }))}
                            />}
                            label={numSearchVals.operator === 'eq' ? (props?.translation?.DateNotEqualSwitchLabel ?? "Not At") : (props?.translation?.DateEqualSwitchLabel ?? "Include At")}
                        />
                    </Grid>
                </LocalizationProvider>)
                }
                {typeSearch === 'str' && (<>
                    <Grid item xs={12}>
                        <ToggleButtonGroup
                            exclusive
                            value={strSearchVals?.operator}
                            onChange={(e, operator) => setStrSearchVals({ operator, value: '', is_not: false })}
                            fullWidth
                            size="small"
                        >
                            <ToggleButton value='eq'>{props?.translation?.StrEqualToggleLabel ?? "Equal"}</ToggleButton>
                            <ToggleButton value='start'>{props?.translation?.StrStartToggleLabel ?? "Start"}</ToggleButton>
                            <ToggleButton value='contain'>{props?.translation?.StrContainToggleLabel ?? "Contain"}</ToggleButton>
                            <ToggleButton value='end'>{props?.translation?.StrEndToggleLabel ?? "End"}</ToggleButton>
                        </ToggleButtonGroup>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label={props?.translation?.StrValueTextFieldLabel ?? "Value"}
                            value={strSearchVals.value}
                            onChange={e => setStrSearchVals(v => ({ ...v, value: e.target.value }))}
                            size="small"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={<Switch
                                checked={strSearchVals.is_not}
                                onChange={e => setStrSearchVals(v => ({ ...v, is_not: e.target.checked }))}
                            />}
                            label={strSearchVals.operator === 'eq' ? (props?.translation?.StrNotEqualSwitchLabel ?? "Not Equal") : (props?.translation?.StrExcludeSwitchLabel ?? "Exclude")}
                        />
                    </Grid>
                </>)}
                {/* Regular Array */}
                {typeSearch === 'arr' && arrSearchItems.length > 0 && (<>
                    <Grid item xs={12}>
                        <FormControl
                            fullWidth
                        >
                            <InputLabel>{props?.translation?.ArrValueLabel ?? "Values"}</InputLabel>
                            <Select
                                multiple
                                size="small"
                                label={props?.translation?.ArrValueLabel ?? "Values"}
                                value={arrSearchVals.value}
                                onChange={e => setArrSearchVals(v => {
                                    if (typeof e.target.value === 'string') return { ...v }
                                    else return { ...v, value: e.target.value }
                                })}
                                renderValue={vs => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                                        {vs.map(v =>
                                        (<Chip
                                            key={v} label={arrSearchItems.find(s => s.value === v)?.label ?? v} sx={{ m: 0.2 }} size="small"
                                        />)
                                        )}
                                    </Box>
                                )}
                            >
                                {arrSearchItems.map(v =>
                                (<MenuItem
                                    key={v.value} value={v.value}
                                    sx={{ fontWeight: (t: Theme) => arrSearchVals.value.indexOf(v.value) < 0 ? t.typography.fontWeightRegular : t.typography.fontWeightMedium }}
                                >{v?.label ?? v.value}</MenuItem>)
                                )}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={<Switch
                                checked={arrSearchVals.is_not}
                                onChange={e => setArrSearchVals(v => ({ ...v, is_not: e.target.checked }))}
                            />}
                            label={props?.translation?.ArrIsNotSwitchLabel ?? "Exclude"}
                        />
                    </Grid>
                </>)}
                {/* Select2Array */}
                {typeSearch === 'arr' && typeof props?.arrSearch === 'object' && (props?.arrSearch as Select2LikeProps<any, true, undefined, undefined>)?.fetchInfo !== undefined && (<>
                    <Grid item xs={12}>
                        <Select2Like
                            fullWidth
                            renderInput={(i_props) => <TextField label={props?.translation?.ArrValueLabel ?? "Values"} {...i_props} />}
                            {...props?.arrSearch as Select2LikeProps<any, true, undefined, undefined>}
                            multiple
                            value={arrSearchVals.value}
                            onChange={v => setArrSearchVals(s => ({ ...s, value: Array.isArray(v) ? v : [] }))}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={<Switch
                                checked={arrSearchVals.is_not}
                                onChange={e => setArrSearchVals(v => ({ ...v, is_not: e.target.checked }))}
                            />}
                            label={props?.translation?.ArrIsNotSwitchLabel ?? "Exclude"}
                        />
                    </Grid>
                </>)}
                {/* Null */}
                {typeSearch === 'nul' && (<Grid item xs={12}>
                    <ToggleButtonGroup
                        exclusive
                        value={
                            nulSearchVals?.is_null !== true && nulSearchVals?.not_null !== true ? 'any' :
                                (nulSearchVals?.is_null === true && nulSearchVals?.not_null === true ? 'none' :
                                    (nulSearchVals?.is_null === true ? 'null' : 'not_null')
                                )
                        }
                        onChange={(e, v) => {
                            if (v === 'any') setNulSearchVals({ is_null: false, not_null: false })
                            else if (v === 'null') setNulSearchVals({ is_null: true, not_null: false })
                            else if (v === 'not_null') setNulSearchVals({ is_null: false, not_null: true })
                        }}
                        fullWidth
                        size="small"
                    >
                        <ToggleButton value='null'>{props?.translation?.NulIsNullToggleLabel ?? "Null"}</ToggleButton>
                        <ToggleButton value='any'>{props?.translation?.NulAnyToggleLabel ?? "Any"}</ToggleButton>
                        <ToggleButton value='not_null'>{props?.translation?.NulNotNullToggleLabel ?? "Not Null"}</ToggleButton>
                    </ToggleButtonGroup>
                </Grid>)}
                <Grid item xs={12}>
                    <Button fullWidth variant="contained" onClick={onSearchClick} disabled={props?.isServerLoading === true}>Search</Button>
                </Grid>
            </Grid >
        </Popover >
    </>)
}

export type { DTSearch, DataTableFilterPopoverProps }
export default DataTableFilterPopover