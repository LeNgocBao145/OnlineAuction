import { useMemo, useState } from "react";
import useProductStore from "@/stores/productStore";

export default function ProductImages() {
  const { product } = useProductStore();
  const images = useMemo(() => {
    if (!product) return [] as string[];
    return [product.image, ...(product.additional_images || [])].filter(
      Boolean
    );
  }, [product]);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!product || images.length === 0) return null;

  return (
    <div className="w-full h-[600px] flex flex-col items-center justify-center gap-4">
      <div className="w-full h-3/4 bg-(--third) border border-white/10 rounded-xl flex items-center justify-center">
        <img
          className="h-95/100 aspect-video rc text-(--primary) flex justify-center items-center bg-white/10 object-cover rounded-xl"
          src={images[selectedImageIndex]}
          alt="Product"
        />
      </div>
      <div className="w-full h-1/4 bg-(--third) border border-white/10 rounded-xl flex items-center justify-center">
        <ul className="overflow-x-visible overflow-y-hidden w-full h-full flex items-center p-4">
          {images.map((imgSrc, index) => (
            <li
              key={index}
              className={`h-full aspect-square mx-2 cursor-pointer border rounded-lg ${
                index === selectedImageIndex
                  ? "border-(--primary)"
                  : "border-transparent"
              }`}
              onClick={() => setSelectedImageIndex(index)}
            >
              <img
                className="h-full aspect-square object-cover rounded-lg text-(--primary) flex justify-center items-center bg-white/10"
                src={imgSrc}
                alt={`Thumbnail ${index + 1}`}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
