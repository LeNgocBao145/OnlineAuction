export default function Hero({ username }: { username: string }) {
    return (
        <div className="w-full flex-grow flex flex-col justify-center items-center py-20">
            <h1 className="text-(--primary) font-sans font-bold text-5xl text-center">Hello, {username}!</h1>
            <p className="text-(--primary) font-sans font-bold text-2xl text-center mt-4">Welcome back to AUCTIONIFY!</p>
        </div>
    );
}