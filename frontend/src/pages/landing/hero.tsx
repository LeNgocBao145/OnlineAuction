export default function Hero({username}: {username: string}) {
    return (
        <div className="w-full h-[200px]">
            <h1 className="text-(--primary) font-sans font-bold text-2xl text-center mt-8">Hello, {username}!</h1>
            <p className="text-(--primary) font-sans font-bold text-center">Welcome back to AUCTIONIFY!</p>
        </div>
    );
}