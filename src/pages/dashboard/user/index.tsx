import { ArrowCircleRight, ImportExport, Lan, SvgIconComponent, VpnKey, Web } from "@mui/icons-material"
import { Box, Grid, Paper, SvgIconProps, Theme, Typography, useTheme } from "@mui/material"
import { useMemo, useContext, useEffect } from "react"
import { Link, redirect, useLoaderData } from "react-router-dom"
import { CustomRouterLoaderProps } from "../../../Router"
import config from "../../../config"
import { AuthContext } from "../../../components/AuthProvider"
import { useTranslation } from "react-i18next"

interface colorHSLComponentPaper {
    mainBox: [number, number, number],
    subBox: [number, number, number],
    icon: [number, number, number],
    text: [number, number, number],
}
interface themeHSLComponentPaper {
    light: colorHSLComponentPaper,
    dark: colorHSLComponentPaper
}
const randomHSL = (): { h: number, s: number, l: number } => ({
    h: Math.round(89 * Math.random()),
    s: Math.round(30 * Math.random()),
    l: Math.round(15 * Math.random())
})
const generateHSL = (): themeHSLComponentPaper[] => {
    const { h, s, l } = randomHSL()
    return [...Array(4)].map((v, i): themeHSLComponentPaper => ({
        light: {
            mainBox: [90 * i + h, 70 + s, 80 + l],
            subBox: [90 * i + h, 70 + s, 80 + l - 3],
            icon: [90 * i + h, 70 + s, 80 + l - 10],
            text: [90 * i + h, 70 + s, 40 - l]
        },
        dark: {
            mainBox: [90 * i + h, 70 + s, 20 - l],
            subBox: [90 * i + h, 70 + s, 20 - l + 3],
            icon: [90 * i + h, 70 + s, 20 - l + 10],
            text: [90 * i + h, 70 + s, 60 + l]
        },
    }))
}
const formatHSL = (hsl: [number, number, number]): string => `hsl(${hsl[0]},${hsl[1]}%,${hsl[2]}%)`

interface PaperWidgetProps {
    color: themeHSLComponentPaper,
    isDark?: boolean,
    title?: string,
    subtitle?: string,
    CustomIcon?: SvgIconComponent,
    customIconProps?: SvgIconProps,
    linkTo?: string,
    moreTranslation?: string
}

const PaperWidget = (props: PaperWidgetProps) => {
    const CustomIcon = props?.CustomIcon
    return (
        <Paper sx={{ color: formatHSL(props.color[props.isDark === true ? 'dark' : 'light'].text) }}>
            <Box sx={{
                display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', p: 3,
                backgroundColor: formatHSL(props.color[props.isDark === true ? 'dark' : 'light'].mainBox)
            }}>
                <Box>
                    <Typography variant="h6">{props?.title ?? ""}</Typography>
                    <Typography variant="h2">{props?.subtitle ?? "0"}</Typography>
                </Box>
                {CustomIcon !== undefined &&
                    <CustomIcon
                        {...(props?.customIconProps ?? {})}
                        sx={{ fontSize: 'h2.fontSize', color: formatHSL(props.color[props.isDark === true ? 'dark' : 'light'].icon), ...(props?.customIconProps?.sx ?? {}) }}
                    />
                }
            </Box>
            <Box sx={{ p: 1, backgroundColor: formatHSL(props.color[props.isDark === true ? 'dark' : 'light'].subBox) }}>
                <Link to={props?.linkTo ?? "/"} style={{
                    textDecoration: 'none', color: 'inherit',
                    display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Typography variant="body2">{props?.moreTranslation ?? "More"}</Typography>
                    <ArrowCircleRight sx={{ ml: 0.2 }} fontSize="small" />
                </Link>
            </Box>
        </Paper>
    )
}

const shuffleArray = <T,>(arr: T[]): T[] => {
    const tmpArr = [...arr]
    const tmpRes: T[] = []
    while (tmpArr.length > 0) {
        const i = Math.floor(tmpArr.length * Math.random())
        tmpRes.push(tmpArr[i])
        tmpArr.splice(i, 1)
    }
    return tmpRes
}

const Component = () => {
    const data = useLoaderData() as { pool?: number, port?: number, domain?: number, userpackage?: number }
    const auth = useContext(AuthContext)
    const theme = useTheme()
    const { t } = useTranslation(['dashboard_user_index'])
    const isDark = theme.palette.mode === 'dark'

    const pickColor = useMemo(() => shuffleArray(generateHSL()), [])

    useEffect(() => {
        document.title = config.APP_NAME
    }, [])

    return (<>
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h3">
                    {t('dashboard_user_index:HiPrefixHeader') + ' '}
                    <Typography fontWeight="medium" variant="h3" display="inline">{auth?.name ?? ""}</Typography>
                    {' ' + t('dashboard_user_index:HiPostfixHeader')}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <PaperWidget
                    color={pickColor[0]} isDark={isDark}
                    title={t('dashboard_user_index:PoolWidgetTitle')} subtitle={typeof data?.pool === 'number' ? data.pool.toString() : "0"} CustomIcon={Lan}
                    moreTranslation={t('dashboard_user_index:MoreWidgetText')} linkTo="/dashboard/user/pools"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <PaperWidget
                    color={pickColor[1]} isDark={isDark}
                    title={t('dashboard_user_index:UserPackageWidgetTitle')} subtitle={typeof data?.userpackage === 'number' ? data.userpackage.toString() : "0"} CustomIcon={VpnKey}
                    moreTranslation={t('dashboard_user_index:MoreWidgetText')} linkTo="/dashboard/user/user_packages"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <PaperWidget
                    color={pickColor[2]} isDark={isDark}
                    title={t('dashboard_user_index:PortWidgetTitle')} subtitle={typeof data?.port === 'number' ? data.port.toString() : "0"}
                    CustomIcon={ImportExport} customIconProps={{ sx: { rotate: '90deg' } }}
                    moreTranslation={t('dashboard_user_index:MoreWidgetText')} linkTo="/dashboard/user/ports"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <PaperWidget
                    color={pickColor[3]} isDark={isDark}
                    title={t('dashboard_user_index:DomainWidgetTitle')} subtitle={typeof data?.domain === 'number' ? data.domain.toString() : "0"} CustomIcon={Web}
                    moreTranslation={t('dashboard_user_index:MoreWidgetText')} linkTo="/dashboard/user/domains"
                />
            </Grid>
        </Grid>
    </>)
}

const loader = async (props: CustomRouterLoaderProps) => {
    if (props?.auth === undefined) throw new Response("", { status: 404, statusText: "Not Found" })
    const res = await fetch(config.BACKEND_URL + '/api/v1/user/dashboard/count', { headers: { 'Authorization': `Bearer ${props.auth?.jwt ?? ""}` } })
    await props.auth.fetchResMiddleware(res, true)
    if (res.status === 401) return redirect('/auth')
    else if (res.status === 500) throw new Response("", { status: 500, statusText: "Internal Server Error" })
    const res_js = await res.json()
    if (res_js.http_code === 401) return redirect('/auth')
    else if (res_js?.http_code === 200)
        return res_js?.data !== null && typeof res_js?.data === 'object' ? res_js.data : { pool: 0, port: 0, domain: 0, userpackage: 0 }
    else throw new Response("", { status: 500, statusText: "Internal Server Error" })
}

export { Component, loader }