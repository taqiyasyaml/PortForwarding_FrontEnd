import {
    BrowserRouter,
    LoaderFunctionArgs,
    Route,
    RouterProvider,
    Routes,
    createBrowserRouter,
    redirect,
} from "react-router-dom";
import { useContext } from 'react'
import { AuthContext, IAuthContext } from "./components/AuthProvider";

interface CustomRouterLoaderProps extends LoaderFunctionArgs {
    auth?: IAuthContext
}

const Router = () => {
    const auth = useContext(AuthContext)
    const router = createBrowserRouter([
        {
            path: "/",
            lazy: () => import('./pages/index/index'),
        },
        {
            path: '/auth',
            lazy: () => import('./pages/auth/layout'),
            children: [
                { index: true, lazy: () => import('./pages/auth/login') },
                { path: 'login', lazy: () => import('./pages/auth/login') },
                { path: 'register', lazy: () => import('./pages/auth/register') }
            ]
        },
        {
            path: '/dashboard/user',
            lazy: () => import('./pages/dashboard/user/layout'),
            children: [
                {
                    index: true, lazy: () => import('./pages/dashboard/user/index'),
                    loader: async (args) => {
                        const { loader } = await import('./pages/dashboard/user/index')
                        return await loader({ ...args, auth })
                    }
                },
                { path: 'pools', lazy: () => import('./pages/dashboard/user/pools') },
                { path: 'ports', lazy: () => import('./pages/dashboard/user/ports') },
                { path: 'domains', lazy: () => import('./pages/dashboard/user/domains') },
                { path: 'user_packages', lazy: () => import('./pages/dashboard/user/userpackages') },
                {
                    path: 'profile', lazy: () => import('./pages/dashboard/user/profile'),
                    loader: async (args) => {
                        const { loader } = await import('./pages/dashboard/user/profile')
                        return await loader({ ...args, auth })
                    }
                },
                { path: 'logout', lazy: () => import('./components/dashboard/LogOutDialog') },
            ]
        }
    ]);
    return (<RouterProvider router={router} />)
}
export type { CustomRouterLoaderProps }
export default Router