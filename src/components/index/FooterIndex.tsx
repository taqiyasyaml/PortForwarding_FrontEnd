import { Box, Theme, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"

const FooterIndex = () => {
    const { t } = useTranslation(['index_footerindex'])
    return (
        <Box sx={{
            minHeight: '10vh',
            width: '100%',
            backgroundColor: (t: Theme) => t.palette.mode === 'dark' ? t.palette.grey[900] : t.palette.grey[200],
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
        }}>
            <Typography fontWeight="medium">{t('index_footerindex:CopyrightText')}</Typography>
        </Box>
    )
}

export default FooterIndex