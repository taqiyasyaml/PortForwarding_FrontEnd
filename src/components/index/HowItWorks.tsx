import { CreateTwoTone, SearchTwoTone, SettingsTwoTone, VpnKeyTwoTone } from "@mui/icons-material"
import { Box, Grid, Paper, Theme, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"

const HowItWorks = () => {
    const { t } = useTranslation(['index_howitworks'])
    return (
        <Box sx={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            backgroundColor: (t: Theme) => t.palette.mode === 'dark' ? t.palette.grey[800] : t.palette.grey[200],
        }}>
            <Typography variant="h2" textAlign="center" fontWeight="medium">{t('index_howitworks:HowItWorksTitle')}</Typography>
            <Grid container spacing={2} padding={2} alignItems="stretch">
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        sx={{
                            minHeight: '40vh', height: '100%',
                            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
                        }}
                    >
                        <CreateTwoTone sx={{ fontSize: '10vh' }} />
                        <Typography variant="h6" margin={2} textAlign="center">{t('index_howitworks:CreateText')}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        sx={{
                            minHeight: '40vh', height: '100%',
                            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
                        }}
                    >
                        <SettingsTwoTone sx={{ fontSize: '10vh' }} />
                        <Typography variant="h6" margin={2} textAlign="center">{t('index_howitworks:SetText')}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        sx={{
                            minHeight: '40vh', height: '100%',
                            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
                        }}
                    >
                        <SearchTwoTone sx={{ fontSize: '10vh' }} />
                        <Typography variant="h6" margin={2} textAlign="center">{t('index_howitworks:FindText')}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        sx={{
                            minHeight: '40vh', height: '100%',
                            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
                        }}
                    >
                        <VpnKeyTwoTone sx={{ fontSize: '10vh' }} />
                        <Typography variant="h6" margin={2} textAlign="center">{t('index_howitworks:TunnelText')}</Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box >
    )
}

export default HowItWorks