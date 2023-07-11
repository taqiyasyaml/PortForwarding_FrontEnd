import { AppBar as MuiAppBar, AppBarProps as MuiAppBarProps, styled } from "@mui/material";

interface AppBarProps extends MuiAppBarProps {
    drawerOpen?: boolean,
    drawerMiniVariant?: boolean
}
const AppBar = styled(
    MuiAppBar,
    { shouldForwardProp: p => p !== 'drawerOpen' && p !== 'drawerMiniVariant' }
)<AppBarProps>
    (
        p => p.drawerMiniVariant === true && ({
            zIndex: p.theme.zIndex.drawer + 1,
            transition: p.theme.transitions.create(['width', 'margin'], {
                easing: p.theme.transitions.easing.sharp,
                duration: p.drawerOpen === true ? p.theme.transitions.duration.enteringScreen : p.theme.transitions.duration.leavingScreen
            }),
            ...(
                p.drawerOpen === true && ({
                    marginLeft: 240,
                    width: 'calc(100% - 240px)'
                })
            )
        })
    )

export default AppBar