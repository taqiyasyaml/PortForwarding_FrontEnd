import { PaletteMode, Theme, createTheme, useMediaQuery, ThemeProvider as MuiThemeProvider } from '@mui/material'
import { enUS, idID } from '@mui/material/locale'
import { createContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
interface IThemeContext {
    paletteMode: PaletteMode,
    setPaletteMode: (mode?: PaletteMode) => void
}
const ThemeContext = createContext<IThemeContext>({
    paletteMode: 'dark',
    setPaletteMode: () => { }
})

interface ThemeProviderProps {
    children?: React.ReactNode
}
const ThemeProvider = (p: ThemeProviderProps) => {
    const { i18n } = useTranslation()
    const systemMode: PaletteMode = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light'
    const paletteMode = useState<PaletteMode>(systemMode)
    const [theme, setTheme] = useState<Theme | undefined>()

    useEffect(() => {
        setTheme(createTheme({ palette: { mode: paletteMode[0] } }, i18n.language.toLowerCase() === 'id' ? idID : enUS))
    }, [paletteMode[0], i18n.language])
    useEffect(() => {
        const storageMode = window.localStorage.getItem('theme')
        if (storageMode !== null && storageMode !== paletteMode[0]) {
            if (storageMode === 'dark') setPaletteMode('dark')
            else if (storageMode === 'light') setPaletteMode('light')
            else window.localStorage.removeItem('theme')
        }
    }, [])
    useEffect(() => {
        const storageMode = window.localStorage.getItem('theme')
        if (storageMode === null) setPaletteMode()
    }, [systemMode])

    const setPaletteMode = (mode?: PaletteMode) => {
        if (mode === undefined || mode === systemMode) window.localStorage.removeItem('theme')
        else window.localStorage.setItem('theme', mode)
        paletteMode[1](mode ?? systemMode)
    }

    return (<ThemeContext.Provider value={{
        paletteMode: paletteMode[0],
        setPaletteMode
    }}>
        {
            theme === undefined ? p?.children : (<MuiThemeProvider theme={theme}>
                {p?.children}
            </MuiThemeProvider>)
        }
    </ThemeContext.Provider>)
}

export { ThemeContext }
export default ThemeProvider