import Nav from "../ui/nav";
import Footer from "../ui/footer";

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <div className="flex flex-col min-h-screen">
            <Nav />
            <main className="flex-grow flex flex-col pb-20">
                {children}
            </main>
            <Footer />
        </div>
    );
}
