import { useState } from "react";

import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function MyProducts() {
    const [statusFilter, setStatusFilter] = useState<number>(5);
    const [visibleProductsCount, setVisibleProductsCount] = useState<number>(6);
    const [page, setPage] = useState<number>(1);
    const [productData, setProductData] = useState([
        {imagePath: "path/to/image1.jpg", title: "Vintage Clock Really long name to test", status: "incoming", bidCount: 0, startingPrice: 100, currentBid: null, timeStatus: "2d 5h"},
        {imagePath: "path/to/image2.jpg", title: "Antique Vase", status: "active", bidCount: 3, startingPrice: 200, currentBid: null, timeStatus: "5h 30m"},
        {imagePath: "path/to/image3.jpg", title: "Rare Book", status: "closed", bidCount: 5, startingPrice: 50, currentBid: 75, timeStatus: "2h"},
        {imagePath: "path/to/image4.jpg", title: "Collectible Toy", status: "active", bidCount: 2, startingPrice: 30, currentBid: null, timeStatus: "1d 3h"},
        {imagePath: "path/to/image5.jpg", title: "Artisan Jewelry", status: "sold", bidCount: 4, startingPrice: 150, currentBid: 200, timeStatus: "30m"},
    ]);

    const filteredProducts = statusFilter === 5 ? productData : productData.filter(product => {
        if (statusFilter === 1) return product.status === "incoming";
        if (statusFilter === 2) return product.status === "active";
        if (statusFilter === 3) return product.status === "closed";
        if (statusFilter === 4) return product.status === "sold";
        return true;
    });

    const visibleProducts = filteredProducts.slice((page - 1) * visibleProductsCount, page * visibleProductsCount);

    const navigate = useNavigate();

    const handleEditProduct = (index: number) => {
        
    }

    const handleCloseOpenProduct = (index: number) => {
        const product = productData[index];
        if (product.status === 'closed') {
            product.status = 'active';
            product.timeStatus = '1d 0h'; // might wanna define this, its the default time for a new auction window
        } else if (product.status === 'active') {
            product.status = 'closed';
            product.timeStatus = '0h'; // ended
        }
        setProductData([...productData]);
    }

    const handleRemoveProduct = (index: number) => {
        const product = productData[index];
        if(product.status === 'active') {
            return; // cannot remove active auctions
        }
        productData.splice(index, 1);
        setProductData([...productData]);
    }

    return (
        <div className="w-8/10 m-auto mt-6 justify-center flex flex-col">
            <h1 className="text-(--primary) text-2xl font-bold">Your Auctions and Products</h1>
            <div className="flex flex-wrap items-center justify-between gap-4 mt-4 p-4 w-full">
                <div className="flex items-center gap-4">
                    <p className="text-white/60">Sort by</p>
                    <div className="grid lg:grid-cols-6 grid-cols-3 gap-2">
                        <button className={`bg-(--bgc) border border-white/10 p-2 rounded-md mr-2 ${statusFilter === 1 ? "bg-(--primary) text-black" : "text-white"}`}
                        onClick={() => setStatusFilter(1)}>
                        Incoming</button>
                        <button className={`bg-(--bgc) border border-white/10 p-2 rounded-md mr-2 ${statusFilter === 2 ? "bg-(--primary) text-black" : "text-white"}`}
                        onClick={() => setStatusFilter(2)}>
                        Active</button>
                        <button className={`bg-(--bgc) border border-white/10 p-2 rounded-md mr-2 ${statusFilter === 3 ? "bg-(--primary) text-black" : "text-white"}`}
                        onClick={() => setStatusFilter(3)}>
                        Closed</button>
                        <button className={`bg-(--bgc) border border-white/10 p-2 rounded-md mr-2 ${statusFilter === 4 ? "bg-(--primary) text-black" : "text-white"}`}
                        onClick={() => setStatusFilter(4)}>
                        Sold</button>
                        <button className={`bg-(--bgc) border border-white/10 p-2 rounded-md mr-2 ${statusFilter === 5 ? "bg-(--primary) text-black" : "text-white"}`}
                        onClick={() => setStatusFilter(5)}>
                        View All</button>
                    </div>
                </div>
                <button className="bg-(--primary) text-black p-2 rounded-md flex justify-between items-center h-full m-auto lg:m-0"
                onClick={() => {navigate('/createProduct')}}>
                    <FaPlus className="inline mr-2" />
                    Create New Auction
                </button>
            </div>
            <div className="border border-white/10 rounded-lg p-6 bg-(--third) mt-6 w-full flex justify-center flex-col">
                <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {visibleProducts.length > 0 ? (visibleProducts.map((product, index) => (
                        <li key={index} className="border border-white/10 rounded-lg bg-(--secondary) p-4 grid grid-cols-1 lg:grid-cols-[2fr_4fr_2fr] justify-center gap-4 hover:scale-101 hover:cursor-pointer transition-transform"
                            onClick={() => {navigate(`/product/${index}`)}}
                        >
                            <div>
                                <img src={product.imagePath} alt={product.title} className="h-full aspect-square rounded-md mr-4 border border-white/10" />
                            </div>
                            <div className="flex flex-col justify-between">
                                <div>
                                    <h2 className="font-bold text-white text-2xl">{product.title.length > 20 ? product.title.substring(0, 20) + "..." : product.title}</h2>
                                </div>
                                <div>
                                    <p className="text-white">{product.bidCount} {product.bidCount <= 1 ? "Bid" : "Bids"}</p>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <div className="flex flex-col">
                                        <p className="text-white">{product.startingPrice}</p>
                                        <p className="text-white/60">Starting Price</p>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <p className="text-(--primary)">{product.currentBid === null ? "N/A" : product.currentBid}</p>
                                        <p className="text-white/60">{(product.status === "sold" || product.status === "closed") ? "Final Price" : "Current Bid"}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <div className="flex flex-col">
                                        <p className="text-white">{product.timeStatus}</p>
                                        <p className="text-white/60">{product.status === "incoming" ? "Open In" : product.status === "active" ? "Time Left" : "Ended For"}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full ${
                                            product .status === "incoming"
                                                ? "bg-yellow-400"
                                                : product.status === "active"
                                                ? "bg-green-400"
                                                : product.status === "closed"
                                                ? "bg-red-400"
                                                : "bg-purple-500"
                                            }`}
                                        ></span>
                                        <p className="text-white/60">
                                            {product.status === "incoming"
                                            ? "Incoming"
                                            : product.status === "active"
                                            ? "Active"
                                            : product.status === "closed"
                                            ? "Closed"
                                            : "Sold"
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center items-center">
                                {product.status !== "sold" && <button className="bg-blue-400 text-black p-2 rounded-md mt-4 w-9/10 hover:cursor-pointer"
                                onClick={(e) => {e.stopPropagation(); handleEditProduct(index)}}>
                                Edit Auction</button>}
                                {product.status !== "sold" && product.status !== "incoming" && <button className={`text-black p-2 rounded-md mt-4 w-9/10 hover:cursor-pointer ${product.status === 'closed' ? 'bg-green-400' : 'bg-red-400'}`}
                                onClick={(e) => {e.stopPropagation(); handleCloseOpenProduct(index)}}>
                                {product.status === 'closed' ? 'Reopen Auction' : 'Close Auction'}
                                </button>}
                                <button className={`bg-white/10 text-white p-2 rounded-md mt-4 w-9/10 ${product.status !== 'active' ? '' : 'opacity-10 cursor-not-allowed'}`}
                                onClick={(e) => { e.stopPropagation(); handleRemoveProduct(index)}}>
                                Remove Auction</button>
                            </div>
                        </li>
                    ))) : (
                        <p className="text-white/60 col-span-full text-center">No products found for the selected filter.</p>
                    )}
                </ul>
                <div className="flex justify-center items-center space-x-2 gap-4 mt-4">
                    <button className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md"
                        onClick={() => setPage(0)}
                    >First</button>
                    <button className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md"
                        onClick={() => setPage(page > 1 ? page - 1 : 1)}
                    >Previous</button>
                    <span className="text-white">
                        Page <span className="text-(--primary) font-bold">1</span> of <span className="text-(--primary) font-bold">N</span>
                        </span>
                    <button className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md"
                        onClick={() => setPage(page + 1)}
                    >Next</button>
                    <button className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md"
                        onClick={() => setPage(Math.ceil(filteredProducts.length / visibleProductsCount))}
                    >Last</button>
                </div>
            </div>
        </div>
    );
}