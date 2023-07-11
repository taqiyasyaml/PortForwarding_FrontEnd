import { Box, Card, Container, CssBaseline, Tab, Tabs } from "@mui/material"
import { useTranslation } from 'react-i18next'
import { Link, Outlet, matchPath, useLocation, useMatch, useNavigate } from "react-router-dom"
import { useContext, useEffect } from 'react'
import { AuthContext } from "../../components/AuthProvider"

const Component = () => {
    const auth = useContext(AuthContext)
    const { t } = useTranslation(['exception', 'auth_layout'])
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        if (auth.checkValidRole()) {
            if (auth.role === 'user') navigate('/dashboard/user')
            else auth.logout()
        }
    }, [auth.role])
    return (<>
        <CssBaseline />
        <Box
            sx={{
                minHeight: '100vh',
                width: '100vw',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
            <Container maxWidth='sm'>
                <Card elevation={6}>
                    <Tabs
                        value={true}
                        variant="fullWidth"
                    >
                        <Tab value={matchPath('/auth/login', location.pathname) !== null || matchPath('/auth', location.pathname) !== null} label={t('auth_layout:LoginTab')} component={Link} to='/auth/login' />
                        <Tab value={matchPath('/auth/register', location.pathname) !== null} label={t('auth_layout:RegisterTab')} component={Link} to='/auth/register' />
                    </Tabs>
                    <Outlet />
                </Card>
            </Container>
        </Box>
    </>)
}

export { Component }