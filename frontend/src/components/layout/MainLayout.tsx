import Nav from "../ui/nav";
import Footer from "../ui/footer";
import Clock from "../ui/clock";
import useAuthStore from "@/stores/authStore";

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const { user } = useAuthStore();

    return (
        <div className="flex flex-col min-h-screen relative">
            <Nav />
            <main className="flex-grow flex flex-col pb-20">
                {children}
            </main>
            <Footer />

            {user && (
                <div className="fixed bottom-6 left-6 z-[100] transform hover:scale-105 transition-transform duration-300">
                    <Clock />
                </div>
            )}
        </div>
    );
}
