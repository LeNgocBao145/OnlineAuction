import useProductStore from "@/stores/productStore";
import { useState } from "react";
import { formatDate } from "@/utils/dateUtils";
import styles from "./description.module.css";
import productService from "@/services/productService";

export default function ProductDescription() {
  const MAX_DESCRIPTION_LENGTH = 500;
  const { product } = useProductStore();
  const [editing, setEditing] = useState(false);
  const [descriptionText, setDescriptionText] = useState("");

  const isSellerView = product?.user_relation === "seller" ? true : false;

  if (!product) return null;

  const handleSaveDescription = async () => {
    product.descriptions = [{ description: descriptionText , created_at: new Date().toISOString() }];
    const result = await productService.updateProduct(
      product.id, 
      {
        ...product,
        descriptions: descriptionText ? [{ description: descriptionText, created_at: new Date().toISOString() }] : []
      }
    );

    if (!result.error) {
      alert("Description updated successfully.");
    } else {
      alert("Failed to update description: " + result.error);
    }

    setEditing(false);
  };

  return (
    <div className="flex flex-col justify-around items-start w-full border border-white/10 rounded-xl bg-(--third) p-4">
      <div className="mb-4 flex justify-between items-center w-full">
        <div className="flex items-center gap-4">
          <h1 className="text-(--primary) text-3xl font-bold">
            Product Description
          </h1>
          {isSellerView && (
            <button className="text-(--primary) underline" onClick={() => setEditing(!editing)}>
              Edit Description
            </button>
          )}
        </div>
        <p className="text-white/40 font-mono text-xs uppercase tracking-widest">
          Created: {formatDate(product.created_at)}
        </p>
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
          <div className="w-full">
            {product.descriptions.map((d, idx) => (
              <div
                key={idx}
                dangerouslySetInnerHTML={{ __html: d.description }}
                className={styles.htmlContent}
              />
            ))}
          </div>
        ) : (
          <p className="text-white/70">No description.</p>
        )}
    </div>
  );
}
