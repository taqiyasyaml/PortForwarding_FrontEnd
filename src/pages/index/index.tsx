import { CssBaseline} from "@mui/material"
import FirstIndex from "../../components/index/FirstIndex"
import HowItWorks from "../../components/index/HowItWorks"
import OurPackage from "../../components/index/OurPackage"
import QuestionIndex from "../../components/index/QuestionIndex"
import FooterIndex from "../../components/index/FooterIndex"
const Component = () => {

    return (<>
        <CssBaseline />
        <FirstIndex />
        <HowItWorks />
        <OurPackage />
        <QuestionIndex />
        <FooterIndex />
    </>)
}

export { Component }