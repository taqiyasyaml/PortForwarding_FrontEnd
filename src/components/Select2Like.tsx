import { Autocomplete, AutocompleteProps, CircularProgress, TextField, UseAutocompleteProps } from "@mui/material"
import React, { useState, useEffect, useRef, useMemo } from "react"
import JSONtoQueryRequest from "../helper/jsonqueryrequest"
interface Select2LikeResponse {
    results?: any[],
    pagination?: { more?: boolean }
}

interface Select2LikeProps<
    T,
    Multiple extends boolean | undefined = undefined,
    DisableClearable extends boolean | undefined = undefined,
    FreeSolo extends boolean | undefined = undefined
> extends Partial<Omit<AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>, "options" | "onChange" | "defaultValue" | "value">> {
    fetchInfo: RequestInfo | URL,
    fetchInit?: RequestInit,
    fetchMiddleware?: (res: Response) => Promise<Select2LikeResponse>,
    idData?: string,
    textData?: string,
    autocompleteRef?: React.Ref<Element>,
    autocompleteOnChange?: AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>['onChange'],
    onChange?: (newValue: (null | string | number | (string | number)[])) => void,
    autocompleteValue?: AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>['value'],
    value?: null | string | number | (string | number)[],
    autocompleteDefaultValue?: AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>['defaultValue'],
    defaultValue?: string | number | (string | number)[]
}

const Select2Like = <
    T,
    Multiple extends boolean | undefined = undefined,
    DisableClearable extends boolean | undefined = undefined,
    FreeSolo extends boolean | undefined = undefined
>(props: Select2LikeProps<T, Multiple, DisableClearable, FreeSolo>) => {
    const listRef = useRef<Element | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [serverError, setServerError] = useState<boolean>(false)

    const [selectData, setSelectData] = useState<null | string | number | (string | number)[]>(null)
    const [hasMore, setHasMore] = useState<boolean>(true)
    const [options, setOptions] = useState<any[]>([])
    const [lastSelectReq, setLastSelectReq] = useState<{
        q: string, page: number
    }>({ q: "", page: 0 })
    const [selectReq, setSelectReq] = useState<{
        q: string, page: number
    }>({ q: "", page: 1 })

    const propsAutocomplete: Partial<Omit<AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>, "options">> = {
        ...Object.keys(props).filter(
            k => ![
                'fetchInfo', 'fetchInit', 'fetchMiddleware',
                'idData', 'textData',
                'autocompleteRef', 'ref',
                'autocompleteOnChange', 'onChange',
                'autocompleteDefaultValue', 'defaultValue',
                'autocompleteValue', 'value'
            ].includes(k)
        ).reduce((p, k) => ({ ...p, [k]: props[k as keyof Select2LikeProps<T, Multiple, DisableClearable, FreeSolo>] }), {}),
    }
    const idData = props?.idData ?? "id"
    const textData = props?.idData ?? "text"

    useEffect(() => {
        if (props?.defaultValue !== undefined && options.length === 0) {
            if (props?.multiple !== true && ((typeof props?.defaultValue === 'string' && props.defaultValue.length > 0) || typeof props?.defaultValue === 'number')) {
                setOptions([{ [idData]: props.defaultValue }])
                setSelectData(props.defaultValue)
            } else if (props?.multiple === true && Array.isArray(props?.defaultValue) && props.defaultValue.length > 0) {
                setOptions(props.defaultValue.map(v => ({ [idData]: v })))
                setSelectData(props.defaultValue)
            }
        }
    }, [])
    useEffect(() => {
        if (
            hasMore === true && (selectReq.q !== lastSelectReq.q || selectReq.page > lastSelectReq.page)
        ) sendQuery().catch(e => console.log(e))
    }, [hasMore, selectReq, lastSelectReq])
    useEffect(() => {
        if (
            hasMore === true && (listRef?.current?.scrollHeight ?? 1) <= (listRef?.current?.clientHeight ?? 0)
        ) setSelectReq(v => ({ ...v, page: v.page + 1 }))
    }, [hasMore, options])
    useEffect(() => {
        if (props?.value !== undefined) {
            if (props?.multiple === true) {
                setSelectData(
                    Array.isArray(props?.value) ?
                        props.value.filter(v => typeof v === 'string' || typeof v === 'number').filter((v, i, v_s) => v_s.findIndex(v_f => v_f === v) === i)
                        : []
                )
            } else {
                setSelectData(typeof props?.value === 'number' || typeof props?.value === 'string' ? props.value : null)
            }
        }
    }, [props?.value])
    useEffect(() => {
        setOptions(opts => {
            if (Array.isArray(selectData)) {
                for (const v of selectData) {
                    if (opts.findIndex(opt => typeof opt === 'object' && opt?.[idData] === v) < 0) opts.push({ [idData]: v })
                }
            } else if (typeof selectData === 'string' || typeof selectData === 'number') {
                if (opts.findIndex(opt => typeof opt === 'object' && opt?.[idData] === selectData) < 0) opts.push({ [idData]: selectData })
            }
            return [...opts]
        })
    }, [selectData])
    useEffect(() => {
        if (props?.inputValue !== undefined)
            setSelectReq(v => {
                if (props?.inputValue === undefined || v.q === props.inputValue) return { ...v }
                setHasMore(true)
                resetOptions()
                return { q: props.inputValue, page: 1 }
            })
    }, [props?.inputValue])

    const resetOptions = (tmpSelectData?: null | string | number | (string | number)[]) => {
        tmpSelectData = tmpSelectData === undefined ? selectData : tmpSelectData
        setOptions(opts => {
            if (!Array.isArray(opts)) return []
            const tmp = Array.isArray(tmpSelectData) ?
                opts.filter(
                    (opt) => (tmpSelectData as (string | number)[]).findIndex(d => opt?.[idData] === d) >= 0
                )
                    .sort((a, b) => Object.keys(b).length - Object.keys(a).length)
                    .filter((opt, i, opt_s) => opt_s.findIndex(o_v => o_v?.[idData] === opt?.[idData]) === i)
                : ((typeof tmpSelectData === 'string' || typeof tmpSelectData === 'number') ?
                    [...(opts
                        .filter((opt) => typeof opt === 'object' && opt?.[idData] === tmpSelectData)
                        .sort((a, b) => Object.keys(b).length - Object.keys(a).length)
                        .filter((v, i) => i < 1)
                    )] : []
                )
            return tmp
        })
    }

    const sendQuery = () => new Promise<boolean>(async (resolve, reject) => {
        if (selectReq?.page <= 0) {
            setSelectReq(v => ({ ...v, page: 1 }))
            return resolve(false)
        }
        const selectReqStr = JSONtoQueryRequest(selectReq)
        const fetch_method = props?.fetchInit?.method ?? "get"
        let resJSON: Select2LikeResponse = {}
        try {
            setServerError(false)
            setIsLoading(true)
            if (fetch_method.toLowerCase() === 'get') {
                if (typeof props.fetchInfo !== 'string')
                    throw new Error("Unsupported fetchInfo for GET DataTable request")
                const splitURL = props.fetchInfo.split("?")
                const res = await fetch(`${splitURL[0]}?${(splitURL?.[1] ?? "").length === 0 ? selectReqStr : `${splitURL?.[1] ?? ""}&${selectReqStr}`}`, props?.fetchInit)
                resJSON = await (props?.fetchMiddleware !== undefined ? props.fetchMiddleware(res) : (res.json() as Select2LikeResponse))
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
                            body: (typeof props.fetchInit?.body !== 'string' || props.fetchInit.body.length === 0) ? selectReqStr : `${props.fetchInit.body}&${selectReqStr}`
                        })
                        resJSON = await (props?.fetchMiddleware !== undefined ? props.fetchMiddleware(res) : (res.json() as Select2LikeResponse))
                    } else if (content_type === 'aplication/json') {
                        const res = await fetch(props.fetchInfo, {
                            ...props.fetchInit, body: JSON.stringify(
                                (typeof props.fetchInit?.body !== 'string' || props.fetchInit.body.length === 0) ?
                                    selectReq : { ...JSON.parse(props.fetchInit.body), ...selectReq }
                            )
                        })
                        resJSON = await (props?.fetchMiddleware !== undefined ? props.fetchMiddleware(res) : (res.json() as Select2LikeResponse))
                    } else
                        throw new Error("Unsupported content-type for other GET DataTable request")
                } else {
                    const res = await fetch(props.fetchInfo, {
                        ...props.fetchInit, headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: selectReqStr
                    })
                    resJSON = await (props?.fetchMiddleware !== undefined ? props.fetchMiddleware(res) : (res.json() as Select2LikeResponse))
                }
            } else {
                const res = await fetch(props.fetchInfo, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: selectReqStr
                })
                resJSON = await (props?.fetchMiddleware !== undefined ? props.fetchMiddleware(res) : (res.json() as Select2LikeResponse))
            }
            setIsLoading(false)
        } catch (error) {
            setServerError(true)
            setIsLoading(false)
            return reject(error)
        }
        resJSON = {
            results: Array.isArray(resJSON?.results) ? resJSON.results : [],
            pagination: { more: resJSON?.pagination?.more === true }
        }
        setLastSelectReq(v => {
            if (v.q === selectReq.q && v.page >= selectReq.page) {
                resolve(false)
                return { ...v }
            }
            setHasMore(resJSON?.pagination?.more === true)
            setOptions(
                opts => [
                    ...opts,
                    ...(Array.isArray(resJSON?.results) ? resJSON.results : []).filter(r => typeof r === 'object' && (typeof r?.[idData] === 'string' || typeof r?.[idData] === 'number'))
                ]
                    .sort((a, b) => Object.keys(b).length - Object.keys(a).length)
                    .filter((r, i, a) => a.findIndex(v_r => v_r.id === r.id) === i)
            )
            resolve(true)
            return { ...selectReq }
        })
    })

    const onListboxScroll = (e: React.UIEvent<HTMLElement>) => {
        if (
            hasMore === true &&
            (e.currentTarget.scrollHeight - e.currentTarget.clientHeight - e.currentTarget.scrollTop) <= 0.2 * e.currentTarget.clientHeight
        ) setSelectReq(v => ({ ...v, page: v.page + 1 }))
    }
    const pickedValue = useMemo(() => selectData === null ? (props?.multiple === true ? [] : null) :
        (typeof selectData === 'string' || typeof selectData === 'number' ? options.find(opt => typeof opt === 'object' && opt?.[idData] === selectData) :
            (Array.isArray(selectData) ?
                selectData
                    .map(d => options.findIndex(opt => typeof opt === 'object' && opt?.[idData] === d))
                    .filter(d => d >= 0)
                    .map(d => options[d])
                : undefined)
        )
        , [selectData, options])
    return (<Autocomplete
        ref={props?.autocompleteRef}
        isOptionEqualToValue={(o: any, v: any) => typeof o === 'object' && typeof v === 'object' && o?.[idData] !== undefined && o?.[idData] === v?.[idData]}
        getOptionLabel={(o: any) => typeof o?.[textData] === 'number' || (typeof o?.[textData] === 'string' && o[textData].length > 0) ? o[textData] : o[idData]}
        renderInput={(i_props) => <TextField {...i_props} />}
        {...propsAutocomplete}
        options={options}
        value={props?.autocompleteValue === undefined ? pickedValue : props.autocompleteValue}
        onChange={(e, v, r, d) => {
            let tmpSelectData: null | string | number | (string | number)[] = null
            if (Array.isArray(v))
                tmpSelectData = v.length <= 0 ? null : v.map(d => d?.[idData])
            else if (typeof v === 'object' && v !== null && (v as any)?.[idData] !== undefined)
                tmpSelectData = (v as any)?.[idData]
            setSelectData(tmpSelectData)
            if (props?.onChange !== undefined) props.onChange(tmpSelectData)
            if (tmpSelectData === null || Array.isArray(tmpSelectData)) {
                setHasMore(false)
                resetOptions(tmpSelectData)
                setSelectReq({ q: "", page: 1 })
            }
            if (props?.autocompleteOnChange !== undefined) props.autocompleteOnChange(e, v, r, d)
        }}
        onOpen={e => {
            setHasMore(true)
            resetOptions()
            setLastSelectReq(v => ({ ...v, page: 0 }))
            if (props?.onOpen !== undefined) props.onOpen(e)
        }}
        ListboxProps={{
            ...(props?.ListboxProps ?? {}),
            ref: e => {
                listRef.current = e
                if (typeof props?.ListboxProps?.ref === 'function') props.ListboxProps.ref(listRef.current)
                else if (props?.ListboxProps?.ref?.current !== undefined) (props.ListboxProps.ref as React.MutableRefObject<Element | null>).current = listRef.current
            },
            onScroll: (e) => {
                onListboxScroll(e)
                if (props?.ListboxProps?.onScroll !== undefined) props.ListboxProps.onScroll(e)
            },
        }}
        inputValue={
            props?.inputValue !== undefined ? props.inputValue :
                (typeof selectData === 'string' || typeof selectData === 'number') ?
                    options.find(opt => typeof opt === 'object' && opt?.[idData] === selectData)?.[textData] ?? selectData :
                    selectReq.q
        }
        onInputChange={(e, v, r) => {
            if (isLoading === true) return
            if (r === 'input') {
                if (typeof selectData === 'string' || typeof selectData === 'number') {
                    const inputVal: string = options.find(opt => typeof opt === 'object' && opt?.[idData] === selectData)?.[textData] ?? (typeof selectData === 'number' ? selectData.toString() : selectData)
                    if (v.length < inputVal.length) {
                        setSelectData(null)
                        if (props?.onChange !== undefined) props.onChange(null)
                        v = ""
                    } else {
                        if (props?.onInputChange !== undefined) props.onInputChange(e, v, r)
                        return
                    }
                }
                setSelectReq(req => {
                    if (req.q === v) return { ...req }
                    setHasMore(true)
                    resetOptions()
                    return { q: v, page: 1 }
                })
            }
            if (props?.onInputChange !== undefined) props.onInputChange(e, v, r)
        }}
    />)
}
export type { Select2LikeProps }
export default Select2Like