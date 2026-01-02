import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";

export default function CreateAuctionBody() {
    const [imageFiles, setImageFiles] = useState<{ file: File, url: string, name: string }[]>([]);
    const [description, setDescription] = useState<string>("");

    const formSchema = z.object({
        productName: z.string().min(1, "Product name is required"),
        startingBid: z.number().min(1, "Starting bid must be at least $1"),
        images: z.array(z.instanceof(File)).min(3, "At least 3 images are required").max(10, "No more than 10 images are allowed"),
        bidStep: z.number().min(1, "Bid step must be at least $1"),
        instantBuy: z.number().min(0).optional(),
        productDescription: z.string().min(1, "Product description is required").max(500, "Description cannot exceed 500 characters"),
        startTime: z.string().min(1, "Start time is required"),
        endTime: z.string().min(1, "End time is required"),
        autoExtend: z.boolean().optional()
    });

    const { register, handleSubmit, formState: { errors }, reset, trigger, setValue } = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { images: [] }
    });

    useEffect(() => {
        // clean up image url to prevent leaks
        return () => {
            imageFiles.forEach(img => URL.revokeObjectURL(img.url));
        };
    }, [imageFiles]);

    const maxImages = 10;
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newFiles = Array.from(files).map((file) => ({
                file,
                url: URL.createObjectURL(file),
                name: file.name,
            }));

            setImageFiles((prev) => {
                const combined = [...prev, ...newFiles];
                setValue("images", combined.map(img => img.file));
                trigger("images");
                return combined.slice(-maxImages);
            });
        }
    };

    const onSubmit = (data: any) => {
        console.log("Form Data:", data);
    }

    return (
        <form className="px-[10%] py-8" onSubmit={handleSubmit(onSubmit)}>
            <h1 className="text-3xl font-bold text-(--primary)">Create New Auction</h1>
            <div className="mt-6 border border-white/10 rounded-lg p-6 bg-(--third)">
                <h2 className="text-2xl text-white text-bold">Basic Product Information</h2>
                <div className="mt-4">
                    <label htmlFor="productName" className="text-white/80">Product Name<span className="text-red-500">*</span></label>
                    <input type="text" id="productName" className="w-full mt-2 p-2 rounded-md bg-(--secondary) border border-white/10 text-white" 
                    placeholder="Enter product name" {...register("productName")}/>

                    {errors.productName && <p className="text-red-400 text-sm mt-1">{errors.productName.message}</p>}
                </div>
                <div className="mt-4">
                    <label className="text-white/80">Product Images (At least 3. Up to 10)</label>
                    <label htmlFor="productImages" className="mt-4 text-white/80 border border-white/10 w-full h-30 flex flex-col justify-center items-center rounded-md"
                        onDrop={(e) => {
                            e.preventDefault();
                            handleImageUpload({ target: { files: e.dataTransfer.files } } as any);
                        }}
                        onDragOver={(e) => e.preventDefault()}>
                        <span>Drag and Drop images here or click to browse</span>
                        <span className="text-white/60 text-sm mt-1">Accepted formats: <span className="text-(--primary)">.jpg, .jpeg, .png</span></span>
                    </label>
                    <input type="file" id="productImages" className="hidden" multiple accept="image/jpg,image/jpeg,image/png"
                        onChange={(e) => { handleImageUpload(e); }}
                    />
                </div>
                <div className="mt-4 border-t border-white/10 pt-4 w-full">
                    {imageFiles && imageFiles.length > 0 ? (
                        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {imageFiles.map((img, index) => (
                                <li key={index} className="relative group">
                                    <img
                                        src={img.url}
                                        alt={img.name}
                                        className="w-full aspect-square object-cover rounded-md border border-white/10"
                                    />
                                    <p className="text-white/60 text-xs mt-1 text-center truncate">{img.name}</p>

                                    <button type="button"
                                        onClick={() =>
                                            setImageFiles((prev) => {
                                                const newImageFiles = prev.filter((_, i) => i !== index);
                                                setValue("images", newImageFiles.map(img => img.file));
                                                trigger("images");
                                                return newImageFiles;
                                            })}
                                        className="absolute h-8 w-8 top-1 right-1 bg-black/60 text-white text-xs rounded px-2 opacity-0 group-hover:opacity-100 transition">
                                        &times;
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-white/60 text-center text-sm">No images uploaded yet.</p>
                    )}
                </div>
                {errors.images && <p className="text-red-400 text-sm text-center mt-4">{errors.images.message}</p>}
            </div>
            <div className="mt-6 border border-white/10 rounded-lg p-6 bg-(--third)">
                <h2 className="text-2xl text-white text-bold">Auction Pricings</h2>
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="startingBid" className="text-white/80">Starting Bid Price<span className="text-red-500">*</span></label>
                        <input type="number" id="startingBid" className="w-full mt-2 p-2 rounded-md bg-(--secondary) border border-white/10 text-white" 
                        placeholder="Enter starting bid price" {...register("startingBid")} />

                        {errors.startingBid && <p className="text-red-400 text-sm mt-1">{errors.startingBid.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="bidStep" className="text-white/80">Bid Step Price<span className="text-red-500">*</span></label>
                        <input type="number" id="bidStep" className="w-full mt-2 p-2 rounded-md bg-(--secondary) border border-white/10 text-white" 
                        placeholder="Enter starting bid price" {...register("bidStep")} />

                        {errors.bidStep && <p className="text-red-400 text-sm mt-1">{errors.bidStep.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="instantBuy" className="text-white/80">Instant Buy Price (Optional)</label>
                        <input type="number" id="instantBuy" className="w-full mt-2 p-2 rounded-md bg-(--secondary) border border-white/10 text-white"
                            placeholder="Enter instant buy price" {...register("instantBuy", { valueAsNumber: true })} />
                    </div>
                </div>
            </div>
            <div className="mt-6 border border-white/10 rounded-lg p-6 bg-(--third)">
                <h2 className="text-2xl text-white text-bold">Product Description</h2>
                <div className="mt-4">
                    <label htmlFor="productDescription" className="text-white/80">Description<span className="text-red-500">*</span></label>
                    <textarea id="productDescription" rows={6} className="w-full mt-2 p-2 rounded-md bg-(--secondary) border border-white/10 text-white resize-none" 
                    placeholder="Enter product description" maxLength={500} {...register("productDescription")} onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                    <div className="flex justify-between items-center">
                        <p className="text-white/60 text-left text-sm mt-4">{description.length} / 500</p>
                        {errors.productDescription && <p className="text-red-400 text-sm mt-1">{errors.productDescription.message}</p>}
                    </div>
                </div>
            </div>
            <div className="mt-6 border border-white/10 rounded-lg p-6 bg-(--third)">
                <h2 className="text-2xl text-white text-bold">Auction Timing and Duration</h2>
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="startTime" className="text-white/80">Auction Start Time<span className="text-red-500">*</span></label>
                        <input type="datetime-local" id="startTime" className="w-full mt-2 p-2 rounded-md bg-(--secondary) border border-white/10 text-white" {...register("startTime")} />

                        {errors.startTime && <p className="text-red-400 text-sm mt-1">{errors.startTime.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="endTime" className="text-white/80">Auction End Time<span className="text-red-500">*</span></label>
                        <input type="datetime-local" id="endTime" className="w-full mt-2 p-2 rounded-md bg-(--secondary) border border-white/10 text-white" {...register("endTime")} />

                        {errors.endTime && <p className="text-red-400 text-sm mt-1">{errors.endTime.message}</p>}
                    </div>
                    <div className="lg:col-span-2 mt-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-white text-lg font-semibold">Auction Auto-Extend (Optional)</h3>
                            <label htmlFor="autoExtend" className="inline-flex items-center mt-2">
                                <input type="checkbox" id="autoExtend" className="form-checkbox h-5 w-5 text-(--primary) bg-(--secondary) border border-white/10 rounded" {...register("autoExtend")} />
                                <span className="ml-2 text-(--primary)">Enable Auto-Extend</span>
                            </label>
                        </div>
                        <p className="text-white/80">If selected, auction time will be extended automaically by
                            <span className="text-red-400"> 10 minutes </span>
                            if a bid is placed within the last
                            <span className="text-red-400"> 5 minutes </span>
                            of the auction.</p>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6 w-full">
                <button className="bg-(--third) text-white border w-full border-white/10 px-6 py-2 rounded-md hover:scale-101 transition-transform"
                    type="button"
                    onClick={() => {
                        reset();
                        setImageFiles([]);
                        setDescription("");
                    }}>
                    Clear
                </button>
                <button className="bg-(--third) text-white border w-full border-white/10 px-6 py-2 rounded-md hover:scale-101 transition-transform"
                    type="button"
                    onClick={() => {
                        // Navigate back to seller's product page
                        window.history.back();
                    }}
                >
                    Cancel
                </button>
                <button className="bg-(--primary) text-black w-full px-6 py-2 rounded-md hover:scale-101 transition-transform">
                    Create Auction
                </button>
            </div>
        </form>
    );
}