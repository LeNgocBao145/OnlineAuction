import AuctionInfo from "./auctionInfo";
import BidHistory from "./bidsHistory";
import ProductBrief from "./brief";
import ProductDescription from "./description";
import ProductImages from "./images";
import ProductQuestions from "./questions";
import RelatedProducts from "./relatedProducts";

export default function ProductBody() {
    return (
        <div className="flex flex-col justify-around items-center gap-4 mt-4 pb-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 w-full">

                <ProductImages />
                <ProductBrief />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 items-start w-full">

                <div className="flex flex-col justify-start items-center w-full gap-4">
                    <ProductDescription />
                    <ProductQuestions />
                </div>
                <div className="flex flex-col justify-start items-center w-full gap-4">
                    <BidHistory />
                </div>
            </div>
            <AuctionInfo />
            <RelatedProducts />
        </div>

    );
}
