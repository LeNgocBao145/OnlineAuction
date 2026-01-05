import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useProductStore from "@/stores/productStore";
import productService from "@/services/productService";
import { formatTimeLeft } from "@/utils/timeUtils";
import { formatCurrency } from "@/utils/numberUtils";
import type { Product } from "@/types/Product";

export default function RelatedProducts() {
    const navigate = useNavigate();
    const { product } = useProductStore();
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            if (!product?.id || !product?.categories?.length) return;

            // Get the first category ID
            const firstCategory = product.categories[0];
            const categoryId = typeof firstCategory === "object" ? firstCategory.id : firstCategory;

            if (!categoryId) return;

            try {
                setLoading(true);
                const products = await productService.getRelatedProducts(
                    product.id,
                    categoryId,
                    5
                );
                setRelatedProducts(products.slice(0, 5));
            } catch (error) {
                console.error("Error fetching related products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRelatedProducts();
    }, [product?.id, product?.categories]);

    if (!product || relatedProducts.length === 0) return null;

    return (
        <div className="w-full mt-8">
            <div className="p-6 bg-(--third) border border-white/10 rounded-xl shadow-xl">
                <h2 className="text-white text-2xl font-bold mb-6 flex items-center gap-2">
                    <span className="w-2 h-8 bg-(--primary) rounded-full"></span>
                    Related Products
                </h2>

                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-(--primary)"></div>
                    </div>
                ) : (
                    <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {relatedProducts.map((item) => {
                            const addedRecently = (() => {
                                const THIRTY_MIN_MS = 30 * 60 * 1000;
                                const addedDate = new Date(item.created_at || "").getTime();
                                const now = Date.now();
                                return now - addedDate <= THIRTY_MIN_MS;
                            })();

                            return (
                                <div
                                    key={item.id}
                                    className={`border border-white/10 rounded-xl bg-(--third) p-4 flex flex-col 
                                        hover:scale-[1.02] transition-transform duration-200 cursor-pointer 
                                        ${addedRecently ? "ring-2 ring-(--primary)" : ""}`}
                                    onClick={() => navigate(`/product/${item.id}`)}
                                >
                                    <img
                                        src={item.image || "/placeholder.jpg"}
                                        alt={item.name}
                                        className="w-full h-40 object-cover rounded-lg mb-4 bg-(--secondary)"
                                    />
                                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1" title={item.name}>
                                        {item.name}
                                    </h3>
                                    <div className="flex justify-between mb-4">
                                        <div className="flex flex-col">
                                            <p className="text-xl text-(--primary)">{formatCurrency(item.current_price)}</p>
                                            <p className="text-white/60 text-sm">Current Price</p>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <p className="text-lg text-white">{item.bid_count || 0}</p>
                                            <p className="text-white/60 text-sm">Bids</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <div className="flex flex-col">
                                            <p className="text-lg text-white">{formatTimeLeft(item.time_left || "") || "N/A"}</p>
                                            <p className="text-white/60 text-sm">Time Left</p>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <div className="flex items-center gap-2 justify-end">
                                                <span className={`w-3 h-3 rounded-full ${item.state === "incoming"
                                                    ? "bg-yellow-400"
                                                    : item.state === "bidding"
                                                        ? "bg-green-400"
                                                        : "bg-red-500"
                                                    }`}
                                                ></span>
                                                <p className="text-white/60">
                                                    {item.state === "incoming"
                                                        ? "Incoming"
                                                        : item.state === "bidding"
                                                            ? "Bidding"
                                                            : "Sold"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
