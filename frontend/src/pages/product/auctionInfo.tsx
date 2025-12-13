import { useState } from "react";

export default function AuctionInfo() {
    const [auctionInfo, setAuctionInfo] = useState({
        createdDate: "2024-01-01",
        expectedEndDate: "2024-01-10",
        startingPrice: 100,
        bidIncrement: 10
    });
    const [paymentMethods, setPaymentMethods] = useState([
        "VISA",
        "PayPal"
    ]);

    return (
        <div className="flex flex-col gap-4 w-full mt-4">
            <div className="p-4 bg-(--third) border border-white/10 rounded-xl w-full">
                <h1 className="text-white text-2xl font-bold">Auction Details</h1>
                <div className="flex justify-between">
                    <p className="text-white/60">Created Date:</p>
                    <p className="text-white">{auctionInfo.createdDate}</p>
                </div>
                <div className="flex justify-between">
                    <p className="text-white/60">Expected End Date:</p>
                    <p className="text-white">{auctionInfo.expectedEndDate}</p>
                </div>
                <div className="flex justify-between">
                    <p className="text-white/60">Starting Price:</p>
                    <p className="text-white">${auctionInfo.startingPrice}</p>
                </div>
                <div className="flex justify-between">
                    <p className="text-white/60">Bid Increment:</p>
                    <p className="text-white">${auctionInfo.bidIncrement}</p>
                </div>
            </div>
            <div className="p-4 bg-(--third) border border-white/10 rounded-xl w-full">
                <h1 className="text-white text-2xl font-bold">Payment Method</h1>
                {paymentMethods.map((method, index) => (
                    <p key={index} className="text-(--primary)">{method}</p>
                ))}
            </div>
        </div>
    );
}