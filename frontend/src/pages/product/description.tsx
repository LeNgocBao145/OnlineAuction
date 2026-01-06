import useProductStore from "@/stores/productStore";
import { useState } from "react";
import { formatDate } from "@/utils/dateUtils";
import styles from "./description.module.css";
import productService from "@/services/productService";
import { Editor } from "@tinymce/tinymce-react";
import { toast } from "sonner";

export default function ProductDescription() {
  const MAX_DESCRIPTION_LENGTH = 500;
  const { product, fetchProduct } = useProductStore();
  const [editing, setEditing] = useState(false);
  const [descriptionText, setDescriptionText] = useState("");

  const isSellerView = product?.user_relation === "seller" ? true : false;

  if (!product) return null;

  const handleSaveDescription = async () => {
    if (!descriptionText || !descriptionText.replace(/<[^>]*>/g, '').trim()) {
      toast.error('Nothing to append');
      return;
    }

    try {
      await productService.addDescription(product.id, descriptionText);
      // refresh product to show newly created description record
      await fetchProduct(product.id);
      toast.success('Description appended successfully.');
    } catch (err: any) {
      toast.error('Failed to append description: ' + (err?.response?.data?.message || err?.message || String(err)));
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
          </div>
          <div className="flex items-center gap-4">
            {isSellerView && (
              <button
                className="ml-4 bg-(--primary) hover:bg-(--primary)/90 text-black rounded-xl font-bold border border-(--primary) transition-all flex items-center justify-center gap-2 px-4 py-2 shadow-[0_0_8px_rgba(255,215,0,0.15)]"
                onClick={() => {
                  setDescriptionText("");
                  setEditing(true);
                }}
              >
                Append Description
              </button>
            )}
          </div>
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
            Add
          </button>

          <p className="absolute bottom-2 right-2 text-white/70">
            {descriptionText.replace(/<[^>]*>/g, "").length} / {MAX_DESCRIPTION_LENGTH}
          </p>
        </div>
      ) : product.descriptions?.length ? (
          <div className="w-full">
            {product.descriptions.map((d, idx) => (
              <div key={idx} className="mb-6 border-b border-white/5 pb-4">
                <div className="flex justify-between items-start gap-4">
                  <div
                    className={styles.htmlContent}
                    dangerouslySetInnerHTML={{ __html: d.description }}
                  />
                  <p className="text-white/40 font-mono text-xs uppercase tracking-widest ml-4">
                    Created: {formatDate(d.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/70">No description.</p>
        )}
    </div>
  );
}
