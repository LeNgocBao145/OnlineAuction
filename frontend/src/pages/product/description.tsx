import useProductStore from "@/stores/productStore";
import { useState } from "react";
import { formatDate } from "@/utils/dateUtils";
import styles from "./description.module.css";
import productService from "@/services/productService";
import { Editor } from "@tinymce/tinymce-react";
import { set } from "zod";

export default function ProductDescription() {
  const MAX_DESCRIPTION_LENGTH = 500;
  const { product } = useProductStore();
  const [editing, setEditing] = useState(false);
  const [descriptionText, setDescriptionText] = useState("");

  const isSellerView = product?.user_relation === "seller" ? true : false;

  if (!product) return null;

  const handleSaveDescription = async () => {
    const updatedProduct = {
      ...product,
      descriptions: descriptionText
        ? [{ description: descriptionText, created_at: new Date().toISOString() }]
        : []
    };

    const result = await productService.updateProduct(
      product.id,
      updatedProduct
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
            <button className="text-(--primary) underline" onClick={() => {
              setDescriptionText(
                product.descriptions?.length
                  ? product.descriptions[0].description
                  : ""
              );
              setEditing(!editing)}
              }>
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
          <Editor
            apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
            value={descriptionText}
            onEditorChange={(content) => setDescriptionText(content)}
            init={{
              height: 600,
              menubar: false,
              plugins: [
                "lists",
                "link",
                "paste",
                "wordcount"
              ],
              toolbar:
                "undo redo | bold italic underline | bullist numlist | link | removeformat",
              content_style:
                "body { font-family:Inter, sans-serif; font-size:14px; color:white; background-color:#111; }",
              skin: "oxide-dark",
              content_css: "dark",
            }}
          />

          <button
            className="mt-3 bg-(--primary) text-black font-bold py-2 px-4 rounded-lg hover:bg-(--primary)/30 transition-colors"
            onClick={handleSaveDescription}
          >
            Save Changes
          </button>

          <p className="absolute bottom-2 right-2 text-white/70">
            {descriptionText.replace(/<[^>]*>/g, "").length} / {MAX_DESCRIPTION_LENGTH}
          </p>
        </div>
      ) : product.descriptions?.length ? (
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
