import { ReactNode } from "react"

interface LayoutProps {
    children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {

    return (
        <div className="h-screen flex flex-col">
             <main className="flex-1">
                {children}
            </main>
        </div>
    )
}

export default Layout;