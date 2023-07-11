import { TextFieldProps, TextField, BoxProps, Box, FormHelperText, FormHelperTextProps } from "@mui/material"
import { forwardRef, useEffect, useState, useImperativeHandle, useRef } from 'react'


interface OTPTextFieldRef {
    value: string,
    focus: () => void
}
interface OTPTextFieldProps {
    length: number,
    value?: string,
    onValueChange?: (newValue: string) => void,
    onValueComplete?: (completeValue: string) => void,
    numeric?: boolean,
    upCase?: boolean,
    lowCase?: boolean,
    disabledTextField?: boolean,
    autofocusTextField?: boolean,
    marginTextField?: TextFieldProps['margin'],
    errorTextField?: boolean,
    colorTextField?: TextFieldProps['color'],
    sxTextField?: TextFieldProps['sx'],
    sxHelperText?: FormHelperTextProps['sx'],
    sxBox?: BoxProps['sx'],
    inputTextFieldProps?: TextFieldProps['InputProps'],
    helperText?: React.ReactNode
}
const OTPTextField = forwardRef<OTPTextFieldRef, OTPTextFieldProps>((props: OTPTextFieldProps, ref) => {
    const [OTPval, setOTPval] = useState<string[]>([])
    const [lastCompleteOTP, setLastCompleteOTP] = useState<string>("")
    const textRef = useRef<HTMLInputElement[]>([])

    useEffect(() => {
        setOTPval([...Array(props.length)].map((tmp, i) => filterValueChange(props?.value?.[i] ?? "")))
    }, [props.value])
    useEffect(() => {
        if (OTPval.length > props.length)
            setOTPval(v => v.filter((tmp, i) => i < props.length))
        else if (OTPval.length < props.length)
            setOTPval(v => [...Array(props.length)].map((tmp, i) => v?.[i] ?? ""))
    }, [OTPval, props.length])
    useEffect(() => {
        if (OTPval.length === props.length) {
            const lastVal = getVal(true)
            if (lastVal !== lastCompleteOTP) {
                if (typeof props?.onValueChange === 'function') props.onValueChange(lastVal)
                if (getVal(false).length === props.length && typeof props?.onValueComplete === 'function')
                    props.onValueComplete(lastVal)
            }
            setLastCompleteOTP(lastVal)
        }
    }, [OTPval])
    useImperativeHandle(ref, () => ({
        value: getVal(true),
        focus: () => {
            if (typeof textRef.current?.[0] !== 'undefined')
                textRef.current?.[0]?.focus()
        }
    }))

    const getVal = (add_space: boolean = true): string => OTPval.reduce((p, v) => v.length === 0 && add_space === true ? `${p} ` : `${p}${v[v.length - 1]}`, '')
    const filterValueChange = (val: string): string => {
        if (val.length === 0) return ''
        else if (val.length > 1) val = val[val.length - 1]
        if (props?.numeric === true && /[0-9]/.test(val)) return val
        else if (props?.upCase === true && /[A-Z]/.test(val)) return val
        else if (props?.upCase === true && /[a-z]/.test(val)) return val.toUpperCase()
        else if (props?.lowCase === true && /[a-z]/.test(val)) return val
        else if (props?.lowCase === true && /[A-Z]/.test(val)) return val.toLowerCase()
        else if (
            (props?.numeric === undefined || props?.numeric === false) &&
            (props?.upCase === undefined || props?.upCase === false) &&
            (props?.lowCase === undefined || props?.lowCase === false)
        ) return val
        else return ''
    }

    const onTextFieldKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, i: number): void => {
        if (i > 0 && e.key === 'Backspace') {
            e.preventDefault()
            setOTPval(v => {
                if ((v?.[i] ?? "").length === 0 && typeof textRef.current?.[i - 1] !== 'undefined') {
                    v[i - 1] = ""
                    textRef.current[i - 1].focus()
                    const tmp_end = textRef.current[i - 1].value.length
                    textRef.current[i - 1].setSelectionRange(tmp_end, tmp_end)
                } else v[i] = ""
                return [...v]
            })
        } else if (i > 0 && e.key === 'ArrowLeft' && typeof textRef.current?.[i - 1] !== 'undefined') {
            e.preventDefault()
            textRef.current[i - 1].focus()
            const tmp_end = textRef.current[i - 1].value.length
            textRef.current[i - 1].setSelectionRange(tmp_end, tmp_end)
        } else if (i < (props.length - 1) && e.key === 'ArrowRight' && typeof textRef.current?.[i + 1] !== 'undefined') {
            e.preventDefault()
            textRef.current[i + 1].focus()
            const tmp_end = textRef.current[i + 1].value.length
            textRef.current[i + 1].setSelectionRange(tmp_end, tmp_end)
        }
    }

    const onTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>, i: number): void => setOTPval(v => {
        const current_v: string[] = [...Array(props.length)].map((tmp, i) => v?.[i] ?? "")
        const filtered_v: string = filterValueChange(e.target.value)
        if (i >= props.length)
            return current_v
        if (current_v.join('').length === 0)
            i = 0
        current_v[i] = filtered_v
        if (i < (props.length - 1) && current_v[i].length === 1 && typeof textRef.current?.[i + 1] !== 'undefined')
            textRef.current[i + 1].focus()
        return current_v
    })

    return (<>
        <Box
            sx={{
                ...(props?.sxBox ?? {}),
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'nowrap',
                justifyContent: 'space-around'
            }}
        >
            {
                [...Array(props.length)].map((tmp, i) => (<TextField
                    key={`otp${i}`}
                    inputRef={r => textRef.current[i] = r}
                    value={OTPval?.[i] ?? ""}
                    autoComplete="off"
                    onChange={e => onTextFieldChange(e as React.ChangeEvent<HTMLInputElement>, i)}
                    onKeyDown={e => onTextFieldKeyDown(e, i)}
                    autoFocus={i === 0 ? props.autofocusTextField : undefined}
                    disabled={props?.disabledTextField}
                    error={props?.errorTextField}
                    color={props?.colorTextField}
                    margin={props?.marginTextField}
                    sx={{
                        ...(props?.sxTextField ?? {}),
                        flexGrow: 1,
                        mx: 1
                    }}
                />))
            }
        </Box>
        {
            typeof props?.helperText !== 'function' && (<FormHelperText
                disabled={props?.disabledTextField}
                error={props?.errorTextField}
                sx={{
                    ...(props?.sxHelperText ?? {}),
                    textAlign: 'center'
                }}
            >
                {props.helperText}
            </FormHelperText>)
        }
    </>)
})
export default OTPTextField