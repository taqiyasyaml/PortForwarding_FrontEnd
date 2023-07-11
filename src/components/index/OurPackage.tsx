import { Box, Grid, Paper, Theme, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"

const OurPackage = () => {
    const { t } = useTranslation(['index_ourpackage'])
    return (
        <Box sx={{
            minHeight: '70vh',
            width: '100%',
            display: 'flex', flexDirection: 'column',
            backgroundColor: (t: Theme) => t.palette.mode === 'dark' ? t.palette.grey[700] : t.palette.grey[400],
        }}>
            <Box flexGrow={1} display="flex" justifyContent="center" alignItems="center">
                <Grid container spacing={5} padding={3} alignItems="center">
                    <Grid item xs={12} md={6} textAlign="center">
                        <Typography variant="h3" fontWeight="bold">{t('index_ourpackage:OurPackageTitle')}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} container spacing={2}>
                        <Grid item xs={12}><Paper sx={{ height: '100%', p: 2 }}>
                            <Typography variant="h5" fontWeight="medium" textAlign="center" color="primary">
                            {t('index_ourpackage:OneOVPNConfigText')}
                            </Typography>
                        </Paper></Grid>
                        <Grid item xs={12}><Paper sx={{ height: '100%', p: 2 }}>
                            <Typography variant="h5" fontWeight="medium" textAlign="center" color="primary">
                            {t('index_ourpackage:OneWGConfigText')}
                            </Typography>
                        </Paper></Grid>
                        <Grid item xs={12}><Paper sx={{ height: '100%', p: 2 }}>
                            <Typography variant="h5" fontWeight="medium" textAlign="center" color="primary">
                            {t('index_ourpackage:BandwidthMonthlyText')}
                            </Typography>
                        </Paper></Grid>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} container spacing={2}>
                        <Grid item xs={12}><Paper sx={{ height: '100%', p: 2 }}>
                            <Typography variant="h5" fontWeight="medium" textAlign="center" color="primary">
                            {t('index_ourpackage:PortsText')}
                            </Typography>
                        </Paper></Grid>
                        <Grid item xs={12}><Paper sx={{ height: '100%', p: 2 }}>
                            <Typography variant="h5" fontWeight="medium" textAlign="center" color="primary">
                            {t('index_ourpackage:DomainsText')}
                            </Typography>
                        </Paper></Grid>
                        <Grid item xs={12}><Paper sx={{ height: '100%', p: 2 }}>
                            <Typography variant="h5" fontWeight="medium" textAlign="center" color="primary">
                            {t('index_ourpackage:SSLProxyText')}
                            </Typography>
                        </Paper></Grid>
                    </Grid>
                </Grid>
            </Box>
            <Box>
                <Typography variant="subtitle2">{t('index_ourpackage:Star1DescText')}</Typography>
                <Typography variant="subtitle2">{t('index_ourpackage:Star2DescText')}</Typography>
                <Typography variant="subtitle2">{t('index_ourpackage:Star3DescText')}</Typography>
            </Box>
        </Box>
    )
}

export default OurPackage