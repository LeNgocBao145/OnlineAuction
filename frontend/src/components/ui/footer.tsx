import { Link } from "react-router";
import Icon from "../../assets/icon.png";

export default function Footer() {
    return (
        <footer className="bg-gradient-to-br from-(--third) via-(--secondary) to-(--third) border-t border-(--primary)/20 mt-auto relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-(--primary) rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-(--primary) rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-8 py-12 h-[157px] flex items-center justify-between">
                <Link to="/" className="flex items-center gap-4 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-(--primary) rounded-full blur-xl opacity-0 group-hover:opacity-2 transition-opacity duration-500"></div>
                        <img
                            src={Icon}
                            className="relative h-20 w-auto transition-all duration-300 group-hover:scale-115 drop-shadow-[0_0_12px_rgba(255,215,0,0.4)] group-hover:drop-shadow-[0_0_25px_rgba(255,215,0,0.7)]"
                            alt="Logo"
                        />
                    </div>
                    <div>
                        <h3 className="text-2xl font-extrabold text-(--primary) font-sans tracking-wide drop-shadow-[0_0_10px_rgba(255,215,0,0.4)] group-hover:drop-shadow-[0_0_18px_rgba(255,215,0,0.6)] transition-all duration-300">
                            AUCTIONIFY
                        </h3>
                        <p className="text-white/40 text-xs group-hover:text-white/60 transition-colors duration-300">Bid. Win. Celebrate.</p>
                    </div>
                </Link>

                <div className="flex flex-col items-end space-y-2">
                    <div className="flex space-x-3">
                        <a href="#" className="w-8 h-8 bg-white/5 hover:bg-(--primary)/20 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                            <svg className="w-4 h-4 text-white/60 group-hover:text-(--primary)" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        </a>
                        <a href="#" className="w-8 h-8 bg-white/5 hover:bg-(--primary)/20 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                            <svg className="w-4 h-4 text-white/60 group-hover:text-(--primary)" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                            </svg>
                        </a>
                        <a href="#" className="w-8 h-8 bg-white/5 hover:bg-(--primary)/20 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                            <svg className="w-4 h-4 text-white/60 group-hover:text-(--primary)" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                        </a>
                    </div>
                    <p className="text-white/30 text-xs">© 2026 Auctionify. All rights reserved</p>
                </div>
            </div>
        </footer>
    );
}
