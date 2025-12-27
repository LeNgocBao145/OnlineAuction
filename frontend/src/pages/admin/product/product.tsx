import Nav from "@/components/ui/nav";
import AdminHeader from "../adminHeader";

import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

export default function ProductManagementTab() {
    const [productData, setProductData] = useState(
        [
            {id: 1, name: "Product A", category: "Electronics", curPrice: 150, instaPrice: 20, seller: "Seller1", winner: "Bidder1" },
            {id: 2, name: "Product B", category: "Books", curPrice: 50, instaPrice: 10, seller: "Seller2", winner: "None" },
            {id: 3, name: "Product C", category: "Fashion", curPrice: 80, instaPrice: 15, seller: "Seller3", winner: "Bidder2" },
            {id: 4, name: "Product D", category: "Home", curPrice: 200, instaPrice: 25, seller: "Seller4", winner: "Bidder3" },
            {id: 5, name: "Product E", category: "Toys", curPrice: 40, instaPrice: 5, seller: "Seller5", winner: "None" }
        ]
    );

    return (
        <>
            <Nav />
            <div className="px-[10%]">
                <AdminHeader activeTab="product" />
                <div className="p-4 border border-white/10 rounded-b-lg bg-(--third)">
                    <div className="relative lg:w-1/3 w-full">
                        <input className="border border-white/10 text-white/60 bg-(--secondary) w-full h-10 p-2 rounded-md" placeholder="Search product by name..." />
                        <MagnifyingGlassIcon className="w-5 h-5 text-white/60 absolute right-2 top-2.5" />
                    </div>
                    <div className="bg-(--secondary) rounded-md p-4 mt-4">
                        <div className="overflow-x-auto">
                            <div className="w-365">
                                <div className="mt-6 grid grid-cols-[1fr_2fr_1fr_1fr_1fr_2fr_2fr_1fr] font-bold text-white/80 border-b border-white/10 pb-2">
                                    <p>Product ID</p>
                                    <p>Name</p>
                                    <p>Category</p>
                                    <p>Current Price</p>
                                    <p>Instant Price</p>
                                    <p>Seller</p>
                                    <p>Winner</p>
                                    <p>Actions</p>
                                </div>
                                <ul>
                                    {productData.length === 0 ? (
                                        <p className="text-white/60">No users found.</p>
                                    ) : (
                                    productData.map((product) => (
                                        <li key={product.id} className="h-20 border-b border-white/10 grid grid-cols-[1fr_2fr_1fr_1fr_1fr_2fr_2fr_1fr] items-center">
                                            <p className="text-white/60">{product.id}</p>
                                            <p className="text-white/60">{product.name}</p>
                                            <p className="text-white/60">{product.category}</p>
                                            <p className="text-(--primary)">{product.curPrice}</p>
                                            <p className="text-(--primary)">{product.instaPrice}</p>
                                            <p className="text-white/60">{product.seller}</p>
                                            <p className="text-white/60">{product.winner}</p>
                                            <button className="text-sm bg-red-500 text-white rounded-md px-2 py-1 hover:bg-red-500/10">Delete</button>
                                        </li>
                                    )))}
                                </ul>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-center items-center space-x-2 mt-8">
                                <button 
                                    className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                                    First
                                </button>
                                <button 
                                    className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                                    Previous
                                </button>
                                <span className="text-white">
                                    Page <span className="text-(--primary) font-bold">1</span> of <span className="text-(--primary) font-bold">N</span>
                                </span>
                                <button 
                                    className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                                    Next
                                </button>
                                <button 
                                    className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                                    Last
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
