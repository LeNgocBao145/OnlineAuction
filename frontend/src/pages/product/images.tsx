import { useEffect, useMemo, useRef, useState } from "react";
import useProductStore from "@/stores/productStore";

const SLIDE_INTERVAL = 3000;

export default function ProductImages() {
  const { product } = useProductStore();
  const images = useMemo(() => {
    if (!product) return [] as string[];
    return [product.image, ...(product.additional_images || [])].filter(
      Boolean
    );
  }, [product]);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset khi product / images đổi
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [images.length]);

  // Auto slide
  useEffect(() => {
    if (images.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setSelectedImageIndex((prev) => (prev + 1) % images.length);
    }, SLIDE_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [images.length]);

  const handleSelectImage = (index: number) => {
    setSelectedImageIndex(index);

    // Reset timer khi user click
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setSelectedImageIndex((prev) => (prev + 1) % images.length);
      }, SLIDE_INTERVAL);
    }
  };
  if (!product || images.length === 0) return null;

  return (
    <div className="w-full h-[600px] flex flex-col items-center justify-center gap-4">
      <div className="w-full h-3/4 bg-(--third) border border-white/10 rounded-xl flex items-center justify-center">
        <img
          key={selectedImageIndex}
          className="slide-in h-95/100 aspect-video rc text-(--primary) flex justify-center items-center bg-white/10 object-cover rounded-xl"
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
              onClick={() => handleSelectImage(index)}
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
