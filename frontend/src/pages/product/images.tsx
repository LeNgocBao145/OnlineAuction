import { useState } from "react";

export default function ProductImages() {
    const [productImages, setProductImages] = useState<string[]>([
        "/images/sample-product-1.jpg",
        "/images/sample-product-2.jpg",
        "/images/sample-product-3.jpg"
    ]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    return (
        <div className="w-full h-[600px] flex flex-col items-center justify-center gap-4">
            <div className="w-full h-3/4 bg-(--third) border border-white/10 rounded-xl flex items-center justify-center">
                <img className="h-95/100 aspect-video rc text-(--primary) flex justify-center items-center bg-white/10" src={productImages[selectedImageIndex]} alt="Product Image" />
            </div>
            <div className="w-full h-1/4 bg-(--third) border border-white/10 rounded-xl flex items-center justify-center">
                <ul className="overflow-x-visible overflow-y-hidden w-full h-full flex items-center p-4">
                    {productImages.map((imgSrc, index) => (
                        <li key={index}
                            className={`h-full aspect-square mx-2 cursor-pointer border rounded-lg ${
                                index === selectedImageIndex ? 'border-(--primary)' : 'border-transparent'
                            }`}
                            onClick={() => setSelectedImageIndex(index)}
                        >
                            <img className="h-full aspect-square object-cover rounded-lg text-(--primary) flex justify-center items-center bg-white/10" src={imgSrc} alt={`Thumbnail ${index + 1}`} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}