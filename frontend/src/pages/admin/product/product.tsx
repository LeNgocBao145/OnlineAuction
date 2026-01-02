import Nav from "@/components/ui/nav";
import AdminHeader from "../adminHeader";

import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import productService from "@/services/productService";
import adminService from "@/services/adminService";

interface ProductItem {
    id: number;
    name: string;
    category_name: string;
    current_price: number;
    instant_price: number;
    seller_name: string;
    winner_name: string | null;
}

export default function ProductManagementTab() {
    const [productData, setProductData] = useState<ProductItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState("");

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const result = await productService.filterProducts({ limit: 100 });
            const products = result.products.map(p => ({
                id: p.id,
                name: p.name,
                category_name: p.category_name || "N/A",
                current_price: p.current_price,
                instant_price: p.instant_price || 0,
                seller_name: p.seller_name || "N/A",
                winner_name: p.winner_name || null
            }));
            setProductData(products);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to fetch products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDeleteProduct = async (productId: number) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await adminService.deleteProduct(productId);
            toast.success("Product deleted successfully");
            fetchProducts();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to delete product");
        }
    };

    const filteredProducts = productData.filter(product =>
        product.name.toLowerCase().includes(searchKeyword.toLowerCase())
    );

    return (
        <>
            <Nav />
            <div className="px-[10%]">
                <AdminHeader activeTab="product" />
                <div className="p-4 border border-white/10 rounded-b-lg bg-(--third)">
                    <div className="relative lg:w-1/3 w-full">
                        <input 
                            className="border border-white/10 text-white/60 bg-(--secondary) w-full h-10 p-2 rounded-md" 
                            placeholder="Search product by name..." 
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                        />
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
                                    {loading ? (
                                        <p className="text-white/60 py-4">Loading...</p>
                                    ) : filteredProducts.length === 0 ? (
                                        <p className="text-white/60 py-4">No products found.</p>
                                    ) : (
                                    filteredProducts.map((product) => (
                                        <li key={product.id} className="h-20 border-b border-white/10 grid grid-cols-[1fr_2fr_1fr_1fr_1fr_2fr_2fr_1fr] items-center">
                                            <p className="text-white/60">{product.id}</p>
                                            <p className="text-white/60">{product.name}</p>
                                            <p className="text-white/60">{product.category_name}</p>
                                            <p className="text-(--primary)">${product.current_price}</p>
                                            <p className="text-(--primary)">${product.instant_price}</p>
                                            <p className="text-white/60">{product.seller_name}</p>
                                            <p className="text-white/60">{product.winner_name || "None"}</p>
                                            <button 
                                                className="text-sm bg-red-500 text-white rounded-md px-2 py-1 hover:bg-red-500/10"
                                                onClick={() => handleDeleteProduct(product.id)}
                                            >Delete</button>
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
