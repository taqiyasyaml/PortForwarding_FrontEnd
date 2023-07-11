import { CssBaseline, IconButton, Toolbar, useMediaQuery, useTheme, ListItemButton, Container, Drawer, Divider, List, ListItemIcon, LinkProps, SxProps, Box, Typography, ListItemText, Grid, Paper, ToggleButtonGroup, ToggleButton } from "@mui/material"
import AppBar from "../../../components/dashboard/AppBar"
import { AccountCircle, ChevronLeft, DarkModeTwoTone, Home, ImportExport, Lan, LightModeTwoTone, Logout, Menu, VpnKey, Web } from "@mui/icons-material"
import { useContext, useEffect, useState } from "react"
import { Link, Outlet, matchPath, useLocation, useNavigate } from "react-router-dom"
import DrawerMiniVariant from "../../../components/dashboard/DrawerMiniVariant"
import config from "../../../config"
import { useTranslation } from "react-i18next"
import { ThemeContext } from "../../../components/ThemeProvider"
import { AuthContext } from "../../../components/AuthProvider"

const DrawerXS_SX: SxProps = {
    backdropFilter: 'blur(2px)',
    display: { xs: 'block', sm: 'none' },
    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240, },
}

const Component = () => {
    const theme = useTheme()
    const isUpSm = useMediaQuery(theme.breakpoints.up('sm'))
    const themeCtx = useContext(ThemeContext)
    const [isDrawerOpen, setDrawerOpen] = useState<boolean>(false)
    const { t, i18n } = useTranslation(['translation', 'dashboard_user_layout'])
    const location = useLocation()
    const navigate = useNavigate()
    const auth = useContext(AuthContext)

    useEffect(() => {
        if (!auth.checkValidRole('user')) navigate('/auth')
    }, [auth?.jwt])

    const drawerChildrens = (<>
        <Toolbar
            sx={{ alignItems: 'center', justifyContent: 'end' }}
        >
            <IconButton
                onClick={() => setDrawerOpen(false)}
                sx={{ ...(isDrawerOpen !== true && ({ display: 'none' })) }}
            >
                <ChevronLeft />
            </IconButton>
        </Toolbar>
        <Divider />
        <List>
            <ListItemButton component={Link} to="/dashboard/user" selected={matchPath("/dashboard/user", location.pathname) !== null}>
                <ListItemIcon><Home /></ListItemIcon>
                <ListItemText primary={t('dashboard_user_layout:HomeNav')} />
            </ListItemButton>
        </List>
        <Divider />
        <List>
            <ListItemButton component={Link} to="/dashboard/user/pools" selected={matchPath("/dashboard/user/pools", location.pathname) !== null}>
                <ListItemIcon><Lan /></ListItemIcon>
                <ListItemText primary={t('dashboard_user_layout:PoolsNav')} />
            </ListItemButton>
            <ListItemButton component={Link} to="/dashboard/user/ports" selected={matchPath("/dashboard/user/ports", location.pathname) !== null}>
                <ListItemIcon><ImportExport sx={{ rotate: '90deg' }} /></ListItemIcon>
                <ListItemText primary={t('dashboard_user_layout:PortsNav')} />
            </ListItemButton>
            <ListItemButton component={Link} to="/dashboard/user/domains" selected={matchPath("/dashboard/user/domains", location.pathname) !== null}>
                <ListItemIcon><Web /></ListItemIcon>
                <ListItemText primary={t('dashboard_user_layout:DomainsNav')} />
            </ListItemButton>
            <ListItemButton component={Link} to="/dashboard/user/user_packages" selected={matchPath("/dashboard/user/user_packages", location.pathname) !== null}>
                <ListItemIcon><VpnKey /></ListItemIcon>
                <ListItemText primary={t('dashboard_user_layout:UserPackagesNav')} />
            </ListItemButton>
        </List>
        <Divider />
        <List>
            <ListItemButton component={Link} to="/dashboard/user/profile" selected={matchPath("/dashboard/user/profile", location.pathname) !== null}>
                <ListItemIcon><AccountCircle /></ListItemIcon>
                <ListItemText primary={t('dashboard_user_layout:ProfileNav')} />
            </ListItemButton>
            <ListItemButton component={Link} to="/dashboard/user/logout">
                <ListItemIcon><Logout /></ListItemIcon>
                <ListItemText primary={t('dashboard_user_layout:LogoutNav')} />
            </ListItemButton>
        </List>
    </>)

    return (<>
        <CssBaseline />
        <AppBar position="fixed" drawerMiniVariant={isUpSm === true} drawerOpen={isDrawerOpen === true}>
            <Toolbar
                sx={{ alignItems: 'center' }}
            >
                <IconButton
                    onClick={() => setDrawerOpen(true)}
                    edge="start"
                    sx={{ color: 'inherit', ...(isUpSm === true && isDrawerOpen === true && { display: 'none' }) }}
                ><Menu /></IconButton>
                <Link to='/' style={{ textDecoration: 'none', color:'inherit' }}><Typography>{config.APP_NAME}</Typography></Link>
                <Box sx={{ ml: 'auto' }}>
                    <IconButton
                        color="inherit"
                        onClick={() => themeCtx.setPaletteMode(themeCtx.paletteMode === 'dark' ? 'light' : 'dark')}
                    >{themeCtx.paletteMode === 'dark' ? <LightModeTwoTone /> : <DarkModeTwoTone />}</IconButton>
                    <ToggleButtonGroup
                        exclusive
                        value={i18n.language}
                        onChange={(e, lng) => i18n.changeLanguage(lng)}
                        size='small'
                        sx={{ backgroundColor: 'background.paper', mx: { xs: 0.5, md: 1 } }}
                    >
                        <ToggleButton value='en'>EN</ToggleButton>
                        <ToggleButton value='id'>ID</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Toolbar>
        </AppBar>
        <Drawer
            variant="temporary"
            open={isDrawerOpen}
            onClose={() => setDrawerOpen(false)}
            keepMounted
            sx={DrawerXS_SX}
        >{drawerChildrens}</Drawer>
        <Box sx={{ display: 'flex' }}>
            <DrawerMiniVariant
                variant="permanent"
                open={isDrawerOpen}
                sx={{ display: { xs: 'none', sm: 'block' } }}
            >{drawerChildrens}</DrawerMiniVariant>
            <Box sx={{ minHeight: '100vh', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Toolbar />
                <Box sx={{ p: 3, flexGrow: 1, backgroundColor: t => t.palette.mode === 'dark' ? t.palette.grey[900] : t.palette.grey[100] }} component='main'>
                    <Container maxWidth='xl'>
                        <Outlet />
                    </Container>
                </Box>
                <Paper sx={{ textAlign: 'center' }} component='footer'>
                    <Divider />
                    <Typography variant="body2" color="text.secondary" sx={{ p: { xs: 0.5, sm: 1, md: 1.5 }, backgroundColor: t => t.palette.mode === 'dark' ? t.palette.grey[800] : t.palette.grey[200] }}>{t('dashboard_user_layout:Copyright')}</Typography>
                </Paper>
            </Box>
        </Box>
    </>)
}

export { Component }