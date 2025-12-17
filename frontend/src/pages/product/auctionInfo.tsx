import useProductStore from "@/stores/productStore";
import { formatDate } from "@/utils/dateUtils";
import { formatCurrency } from "@/utils/numberUtils";

export default function AuctionInfo() {
  const { product } = useProductStore();

  if (!product) return null;

  return (
    <div className="flex flex-col gap-4 w-full mt-4">
      <div className="p-4 bg-(--third) border border-white/10 rounded-xl w-full">
        <h1 className="text-white text-2xl font-bold">Auction Details</h1>
        <div className="flex justify-between">
          <p className="text-white/60">Created at:</p>
          <p className="text-white">
            {formatDate(product.created_at)}
          </p>
        </div>
        <div className="flex justify-between">
          <p className="text-white/60">Ends at:</p>
          <p className="text-white">
            {formatDate(product.expired_at)}
          </p>
        </div>
        <div className="flex justify-between">
          <p className="text-white/60">Starting price:</p>
          <p className="text-white">
            {formatCurrency(product.init_price)}
          </p>
        </div>
        <div className="flex justify-between">
          <p className="text-white/60">Bid increment:</p>
          <p className="text-white">
            {formatCurrency(product.step_price)}
          </p>
        </div>
        <div className="flex justify-between">
          <p className="text-white/60">Categories:</p>
          <p className="text-white">
            {product.categories?.length ? product.categories.join(", ") : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
