import AuctionInfo from "./auctionInfo";
import BidHistory from "./bidsHistory";
import ProductBrief from "./brief";
import ProductDescription from "./description";
import ProductImages from "./images";
import ProductQuestions from "./questions";

export default function ProductBody() {
    return (
        <div className="flex flex-col justify-around items-center px-[10%] gap-4 mt-4 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ProductImages/>
                <ProductBrief/>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 items-start">
                <div className="flex flex-col justify-start items-center w-full">
                    <ProductDescription/>
                    <ProductQuestions/>
                </div>
                <div className="flex flex-col justify-start items-center w-full">
                    <BidHistory/>
                    <AuctionInfo/>
                </div>
            </div>
        </div>
    );
}