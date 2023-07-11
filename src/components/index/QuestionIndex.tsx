import { MailTwoTone } from "@mui/icons-material"
import { Box, Button, Theme, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import config from "../../config"

const QuestionIndex = () => {
    const { t } = useTranslation(['index_questionindex'])
    return (
        <Box sx={{
            minHeight: '20vh',
            width: '100%',
            backgroundColor: (t: Theme) => t.palette.mode === 'dark' ? t.palette.grey[800] : t.palette.grey[300],
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
        }}>
            <Typography typography="h4" fontWeight="medium">{t('index_questionindex:TitleEmailUs')}</Typography>
            <Button startIcon={<MailTwoTone />} variant="contained" sx={{ marginTop: 1 }} size="large"
                component="a" href={`mailto:${config.EMAIL_ADMIN}`}
            >{config.EMAIL_ADMIN}</Button>
        </Box>
    )
}

export default QuestionIndex