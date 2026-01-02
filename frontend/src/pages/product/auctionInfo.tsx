import useProductStore from "@/stores/productStore";
import { formatCurrency } from "@/utils/numberUtils";
import { formatDate } from "@/utils/dateUtils";

export default function AuctionInfo() {
  const { product } = useProductStore();

  if (!product) return null;

  return (
    <div className="flex flex-col gap-4 w-full mt-4">
      <div className="p-6 bg-(--third) border border-white/10 rounded-xl w-full shadow-xl">
        <h2 className="text-white text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="w-2 h-8 bg-white/20 rounded-full"></span>
          Auction Details
        </h2>

        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">Created at</p>
            <p className="text-white/90 font-medium">{formatDate(product.created_at)}</p>
          </div>

          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">Ends at</p>
            <p className="text-(--primary) font-mono font-bold tracking-tight">{formatDate(product.expired_at)}</p>
          </div>

          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">Starting price</p>
            <p className="text-white font-bold">{formatCurrency(product.init_price)}</p>
          </div>

          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">Bid increment</p>
            <p className="text-white font-bold">{formatCurrency(product.step_price)}</p>
          </div>

          <div className="flex justify-between items-start">
            <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mt-1">Categories</p>
            <div className="flex flex-wrap justify-end gap-1 max-w-[60%]">
              {product.categories?.length ? product.categories.map((cat: any, i: number) => (
                <span key={i} className="bg-white/5 px-2 py-1 rounded text-xs text-white/70 border border-white/10">
                  {typeof cat === 'object' ? cat.name : cat}
                </span>
              )) : <span className="text-white/30">—</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
