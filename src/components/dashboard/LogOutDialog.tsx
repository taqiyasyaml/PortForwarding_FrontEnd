import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Theme, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useState, useContext, useEffect } from 'react'
import { AuthContext } from "../AuthProvider"
import { Replay } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import config from "../../config"

const Component = () => {
    const { t } = useTranslation(['dashboard_logout'])
    const auth = useContext(AuthContext)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [serverError, setServerError] = useState<boolean>(false)
    const navigate = useNavigate()
    const onLogOutButtonClick = async () => {
        setServerError(false)
        setIsLoading(true)
        try {
            await auth.logout()
            setIsLoading(true)
        } catch (error) {
            console.log(error)
            setServerError(true)
            setIsLoading(false)
        }
    }
    const onDialogClose = () => navigate(-1)

    useEffect(() => {
        document.title = `${t('dashboard_logout:LogOutTitle')} | ${config.APP_NAME}`
        return () => { document.title = config.APP_NAME }
    }, [])

    return (<Dialog open={true} onClose={isLoading === true ? undefined : onDialogClose}>
        <DialogTitle>{t('dashboard_logout:LogOutDialogTitle')}</DialogTitle>
        <DialogContent>
            <DialogContentText sx={{ display: 'inline' }}>
                {t('dashboard_logout:MessageDialogContentText')}
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={isLoading === true ? undefined : onDialogClose}>{t('dashboard_logout:CloseButtonDialogActions')}</Button>
            {isLoading === true ? (
                <Button disabled><CircularProgress size={15} /></Button>
            ) : (
                <Button
                    onClick={onLogOutButtonClick}
                    color={serverError === true ? "warning" : "primary"}
                    endIcon={serverError === true && (<Replay />)}
                >{t('dashboard_logout:SubmitButtonDialogActions')}</Button>
            )}
        </DialogActions>
    </Dialog >)
}
export { Component }