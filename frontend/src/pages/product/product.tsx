import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Nav from "../../components/ui/nav";
import ProductBody from "./productBody";
import useProductStore from "@/stores/productStore";
import useAuthStore from "@/stores/authStore";
import useUserStore from "@/stores/userStore";

export default function ProductPage() {
    const { id } = useParams<{ id: string }>();
    const { fetchProduct, loading, error, product } = useProductStore();
    const {user} = useAuthStore();
    const {fetchFavorites} = useUserStore();

    useEffect(() => {
        if (!id) return;
        (async () => {
            await fetchProduct(id);
            if (user?.id) {
                await fetchFavorites(user.id);
            }
        })();
    }, [id, user?.id]);

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