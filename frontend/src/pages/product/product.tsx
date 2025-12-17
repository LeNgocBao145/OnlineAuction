import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Nav from "../../components/ui/nav";
import ProductBody from "./productBody";
import useProductStore from "@/stores/productStore";

export default function ProductPage() {
    const { id } = useParams<{ id: string }>();
    const { fetchProduct, loading, error, product } = useProductStore();

    useEffect(() => {
        if (!id) return;
        (async () => {
            await fetchProduct(id);
        })();
    }, [id, fetchProduct]);

    return (
        <>
            <Nav />
            <div className="px-[10%] mt-6 text-white">
                {loading && <p>Loading product...</p>}
                {error && <p className="text-red-400">{error}</p>}
                {!loading && !error && product && <ProductBody />}
            </div>
        </>
    );
}