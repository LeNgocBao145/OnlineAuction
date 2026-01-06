import { useEffect, useMemo, useRef, useState } from "react";
import useProductStore from "@/stores/productStore";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { getImageUrl } from "@/utils/productUtils";

const SLIDE_INTERVAL = 3000;

export default function ProductImages() {
  const { product } = useProductStore();
  const images = useMemo(() => {
    if (!product) return [] as string[];
    const allImages = (product.additional_images && product.additional_images.length > 0)
      ? product.additional_images
      : [product.image].filter(Boolean);
    return allImages.map(img => getImageUrl(img)).filter(Boolean) as string[];
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

  const handlePrevImage = () => {
    const newIndex = selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1;
    handleSelectImage(newIndex);
  };

  const handleNextImage = () => {
    const newIndex = (selectedImageIndex + 1) % images.length;
    handleSelectImage(newIndex);
  };

  if (!product || images.length === 0) return null;

  return (
    <div className="w-full min-h-[600px] flex flex-col items-center justify-center gap-4">
      <div className="w-full flex-1 bg-(--third) border border-white/10 rounded-xl flex items-center justify-center relative group">
        {/* Left Arrow */}
        {images.length > 1 && (
          <button
            onClick={handlePrevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 
                       flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200
                       border border-white/20 hover:border-(--primary) cursor-pointer"
            aria-label="Previous image"
          >
            <FaChevronLeft className="w-4 h-4" />
          </button>
        )}

        <img
          key={selectedImageIndex}
          className="slide-in h-95/100 aspect-video rc text-(--primary) flex justify-center items-center bg-white/10 object-cover rounded-xl"
          src={images[selectedImageIndex]}
          alt="Product"
        />

        {/* Right Arrow */}
        {images.length > 1 && (
          <button
            onClick={handleNextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 
                       flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200
                       border border-white/20 hover:border-(--primary) cursor-pointer"
            aria-label="Next image"
          >
            <FaChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded-full text-white/80 text-sm">
            {selectedImageIndex + 1} / {images.length}
          </div>
        )}
      </div>
      <div className="w-full h-24 lg:h-1/4 bg-(--third) border border-white/10 rounded-xl flex items-center justify-center">
        <ul className="overflow-x-visible overflow-y-hidden w-full h-full flex items-center p-4">
          {images.map((imgSrc, index) => (
            <li
              key={index}
              className={`h-full aspect-square mx-2 cursor-pointer border rounded-lg ${index === selectedImageIndex
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
