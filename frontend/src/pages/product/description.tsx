import useProductStore from "@/stores/productStore";

export default function ProductDescription() {
  const { product } = useProductStore();

  if (!product) return null;

  return (
    <div className="flex flex-col justify-around items-start w-full border border-white/10 rounded-xl bg-(--third) p-4">
      <h1 className="text-(--primary) text-3xl font-bold">
        Product Description
      </h1>
      {product.descriptions?.length ? (
        product.descriptions.map((d, idx) => (
          <p key={idx} className="text-white mt-2">
            {d.description}
          </p>
        ))
      ) : (
        <p className="text-white/70">No description yet.</p>
      )}
    </div>
  );
}
