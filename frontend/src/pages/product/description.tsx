import useProductStore from "@/stores/productStore";
import { useState } from "react";

export default function ProductDescription() {
  const MAX_DESCRIPTION_LENGTH = 500;
  const { product } = useProductStore();
  const [editing, setEditing] = useState(false);
  const [descriptionText, setDescriptionText] = useState("");

  const isSellerView = false; // INTEGRATE THIS

  if (!product) return null;

  const handleSaveDescription = () => {
    // Logic to save the updated description
    // This could involve calling an API or updating the store
    setEditing(false);
  };

  return (
    <div className="flex flex-col justify-around items-start w-full border border-white/10 rounded-xl bg-(--third) p-4">
      <div className="mb-4">
        <h1 className="text-(--primary) text-3xl font-bold">
          Product Description
        </h1>
        {isSellerView && (
          <button className="text-(--primary) underline ml-4">
            Edit Description
          </button>
        )}
      </div>
      {editing ? (
        <div className="w-full relative">
          <textarea
            className="w-full h-40 bg-(--secondary) text-white p-2 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-(--primary)"
            defaultValue={product.descriptions?.map((d) => d.description).join("\n") || ""}
            onChange={(e) => setDescriptionText(e.target.value)}
            maxLength={MAX_DESCRIPTION_LENGTH}
          />
          <button className="mt-2 bg-(--primary) text-black font-bold py-2 px-4 rounded-lg hover:bg-(--primary)/30 transition-colors"
            onClick={handleSaveDescription}
            >
            Save Changes
          </button>
          <p className="absolute bottom-2 right-2 text-white/70">{descriptionText.length} / {MAX_DESCRIPTION_LENGTH}</p>
        </div>
      ) :
      product.descriptions?.length ? (
        product.descriptions.map((d, idx) => (
          <p key={idx} className="text-white mt-2">
            {d.description}
          </p>
        ))
      ) : (
        <p className="text-white/70">No description.</p>
      )}
    </div>
  );
}
