import { CSSObject, Theme, Drawer as MuiDrawer, DrawerProps, styled } from "@mui/material"

const DrawerOpenedCSS = (theme: Theme): CSSObject => ({
    width: 240,
    transition: theme.transitions.create(['width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
    })
})
const DrawerClosedCSS = (theme: Theme): CSSObject => ({
    width: theme.spacing(7),
    transition: theme.transitions.create(['width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
    })
})
const DrawerMiniVariant = styled(
    MuiDrawer, { shouldForwardProp: p => p !== 'open' }
)<DrawerProps>(
    p => ({
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        ...(p.open === true && ({
            ...DrawerOpenedCSS(p.theme),
            '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                overflowX: 'hidden',
                ...DrawerOpenedCSS(p.theme)
            }
        })),
        ...(p.open !== true && ({
            ...DrawerClosedCSS(p.theme),
            '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                overflowX: 'hidden',
                ...DrawerClosedCSS(p.theme)
            }
        })),
    })
)

export default DrawerMiniVariant