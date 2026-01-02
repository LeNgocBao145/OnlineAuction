import { useParams } from "react-router-dom";
import CreateAuctionBody from "./createProdBody";

export default function EditAuction() {
    const { id } = useParams();
    return (
        <>
            <CreateAuctionBody productId={id} />
        </>
    );
}
