import { DarkModeTwoTone, LightModeTwoTone } from "@mui/icons-material"
import { Box, Button, IconButton, Theme, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material"
import { useContext, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { AuthContext } from "../AuthProvider"
import { ThemeContext } from "../ThemeProvider"
import { Link } from "react-router-dom"
const FirstIndex = () => {

    const auth = useContext(AuthContext)
    const themeCtx = useContext(ThemeContext)
    const { t, i18n } = useTranslation(['index_firstindex'])
    const isAuth = useMemo(() => auth.checkValidRole(), [auth?.jwt])
    const isUser = useMemo(() => auth.checkValidRole('user'), [auth?.jwt])
    return (
        <Box sx={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: (t: Theme) => t.palette.mode === 'dark' ? t.palette.grey[900] : t.palette.grey[500],
        }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', p: 3 }}>
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
            <Box sx={{
                flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
            }}>
                <Box>
                    <Typography
                        fontWeight="bold" color="primary.main" display="inline"
                        fontSize={(t: Theme) => ({ xs: t.typography.h5.fontSize, sm: t.typography.h3.fontSize, md: t.typography.h1.fontSize })}
                    >Port</Typography>
                    <Typography
                        fontWeight="bold" color="secondary.main" display="inline"
                        fontSize={(t: Theme) => ({ xs: t.typography.h5.fontSize, sm: t.typography.h3.fontSize, md: t.typography.h1.fontSize })}
                    >Forwarding</Typography>
                    <Typography
                        fontWeight="bold" display="inline"
                        fontSize={(t: Theme) => ({ xs: t.typography.h5.fontSize, sm: t.typography.h3.fontSize, md: t.typography.h1.fontSize })}
                    >.my.id</Typography>
                </Box>
                <Typography
                    fontSize={(t: Theme) => ({ xs: t.typography.body1.fontSize, md: t.typography.h6.fontSize })}
                    textAlign="center"
                >{t('index_firstindex:DescriptionText')}</Typography>
                {!isAuth &&
                    <Box display="inline" marginTop={3}>
                        <Button
                            variant="contained" color="secondary"
                            sx={{ minWidth: '10vw', m: 1, fontSize: (t: Theme) => ({ xs: t.typography.h6.fontSize, md: t.typography.h5.fontSize }) }}
                            component={Link} to="/auth/login"
                        >{t('index_firstindex:LoginButtonLabel')}</Button>
                        <Button
                            variant="contained" color="primary"
                            sx={{ minWidth: '10vw', m: 1, fontSize: (t: Theme) => ({ xs: t.typography.h6.fontSize, md: t.typography.h5.fontSize }) }}
                            component={Link} to="/auth/register"
                        >{t('index_firstindex:RegisterButtonLabel')}</Button>
                    </Box>
                }
                {isUser && <Button
                    variant="contained" color="primary"
                    sx={{ minWidth: '10vw', m: 1, mt: 4, fontSize: (t: Theme) => ({ xs: t.typography.h6.fontSize, md: t.typography.h5.fontSize }) }}
                    component={Link} to="/dashboard/user"
                >{t('index_firstindex:DashboardButtonLabel')}</Button>}
            </Box>
        </Box>
    )
}

export default FirstIndex