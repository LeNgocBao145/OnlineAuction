import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useRef } from "react";
import productService from "@/services/productService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/stores/authStore";
import { Editor } from "@tinymce/tinymce-react";



export default function CreateAuctionBody({ productId }: { productId?: string | number }) {
    const isEditing = !!productId;

    const [imageFiles, setImageFiles] = useState<{ file: File, url: string, name: string }[]>([]);
    const [description, setDescription] = useState<string>("");
    const [wordCount, setWordCount] = useState<number>(0);
    const editorRef = useRef<any>(null);

    const formSchema = z.object({
        productName: z.string().min(1, "Product name is required"),
        category: z.string().min(1, "Category is required"),
        startingBid: z.number().min(1, "Starting bid must be at least $1"),
        images: z.array(z.instanceof(File)).min(3, "At least 3 images are required").max(10, "No more than 10 images are allowed"),
        bidStep: z.number().min(1, "Bid step must be at least $1"),
        instantBuy: z.number().nullable().optional(),
        productDescription: z.string().min(1, "Product description is required").max(5000, "Description cannot exceed 5000 characters"),
        startTime: z.string().min(1, "Start time is required"),
        endTime: z.string().min(1, "End time is required"),
        autoExtend: z.boolean().optional()
    });


    const { register, handleSubmit, formState: { errors }, reset, trigger, setValue } = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { images: [] }
    });

    const [categories, setCategories] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAuthStore();
    const navigate = useNavigate();


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await productService.getCategories();
                setCategories(data);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        fetchCategories();

        const fetchProductData = async () => {
            if (!productId) return;
            try {
                const product = await productService.getProductById(productId);
                if (product) {
                    reset({
                        productName: product.name,
                        category: product.categories?.[0]?.id?.toString() || "",
                        startingBid: product.current_price,
                        bidStep: product.step_price || 0,
                        instantBuy: product.instant_price,
                        productDescription: product.descriptions?.[0]?.description || "",
                        startTime: product.starting_at ? new Date(product.starting_at).toISOString().slice(0, 16) : "",
                        endTime: product.expired_at ? new Date(product.expired_at).toISOString().slice(0, 16) : "",
                        autoExtend: product.isExtent
                    });
                    setDescription(product.descriptions?.[0]?.description || "");
                    // For images, we just show placeholders since we don't have the original Files
                    const allImages = [product.image, ...(product.additional_images || [])].filter(Boolean);
                    if (allImages.length > 0) {
                        setImageFiles(allImages.map((url: string, i: number) => ({
                            file: new File([], `image-${i}.jpg`), // Dummy file
                            url,
                            name: `Existing Image ${i + 1}`
                        })));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch product for editing", error);
                toast.error("Failed to load product details");
            }
        };
        fetchProductData();

        // clean up image url to prevent leaks
        return () => {
            imageFiles.forEach(img => URL.revokeObjectURL(img.url));
        };
    }, [productId]);



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

    const onSubmit = async (data: any) => {
        if (!user) {
            toast.error("You must be logged in to create an auction");
            return;
        }

        try {
            setSubmitting(true);

            // Mock image URLs for now since there's no upload service
            // In a real app, you'd upload them to S3/Cloudinary first
            const mockImages = data.images.map((_: any, index: number) =>
                `https://picsum.photos/seed/${data.productName.replace(/\s+/g, '')}${index}/300`
            );

            const payload = {
                seller: user.id,
                name: data.productName,
                category: parseInt(data.category, 10),
                images: mockImages,
                init_price: data.startingBid,
                step_price: data.bidStep,
                instant_price: data.instantBuy || null,
                start_at: new Date(data.startTime).toISOString(),
                expired_at: new Date(data.endTime).toISOString(),
                description: data.productDescription,
                isExtent: !!data.autoExtend
            };

            if (isEditing) {
                const result = await productService.updateProduct(productId, payload);
                toast.success(result.message || "Auction updated successfully!");
            } else {
                const result = await productService.addProduct(payload);
                toast.success(result.message || "Auction created successfully!");
            }
            navigate("/profile/sellings");

        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to create auction");
        } finally {
            setSubmitting(false);
        }
    }


    return (
        <form className="px-[10%] py-8" onSubmit={handleSubmit(onSubmit)}>
            <h1 className="text-3xl font-bold text-(--primary)">{isEditing ? `Edit Auction #${productId}` : "Create New Auction"}</h1>

            <div className="mt-6 border border-white/10 rounded-lg p-6 bg-(--third)">
                <h2 className="text-2xl text-white text-bold">Basic Product Information</h2>
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="productName" className="text-white/80">Product Name<span className="text-red-500">*</span></label>
                        <input type="text" id="productName" className="w-full mt-2 p-2 rounded-md bg-(--secondary) border border-white/10 text-white"
                            placeholder="Enter product name" {...register("productName")} />
                        {errors.productName && <p className="text-red-400 text-sm mt-1">{errors.productName.message as any}</p>}
                    </div>
                    <div>
                        <label htmlFor="category" className="text-white/80">Category<span className="text-red-500">*</span></label>
                        <select id="category" className="w-full mt-2 p-2 rounded-md bg-(--secondary) border border-white/10 text-white h-10" {...register("category")}>
                            <option value="">Select a category</option>
                            {categories.map((cat: any) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category.message as any}</p>}
                    </div>
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
                            placeholder="Enter starting bid price" {...register("startingBid", { valueAsNumber: true })} />


                        {errors.startingBid && <p className="text-red-400 text-sm mt-1">{errors.startingBid.message as any}</p>}
                    </div>
                    <div>
                        <label htmlFor="bidStep" className="text-white/80">Bid Step Price<span className="text-red-500">*</span></label>
                        <input type="number" id="bidStep" className="w-full mt-2 p-2 rounded-md bg-(--secondary) border border-white/10 text-white"
                            placeholder="Enter bid step price" {...register("bidStep", { valueAsNumber: true })} />

                        {errors.bidStep && <p className="text-red-400 text-sm mt-1">{errors.bidStep.message as any}</p>}
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
                    <div className="mt-2 rounded-md overflow-hidden border border-white/10">
                        <Editor
                            ref={editorRef}
                            apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                            initialValue={description}
                            init={{
                                height: 300,
                                menubar: true,
                                plugins: [
                                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                    'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
                                ],
                                toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                                // content_style: Styles for the EDITOR's content area (what user sees while editing)
                                // This helps user preview how content will look, matching the display styling in description.tsx
                                // Without this, content would look wrong in editor (e.g., paragraphs stuck together, no spacing)
                                content_style: `
                                    body { 
                                        font-family: Helvetica, Arial, sans-serif; 
                                        font-size: 14px; 
                                        background: rgb(17, 24, 39); 
                                        color: rgb(209, 213, 219);
                                        line-height: 1.6;
                                        margin: 0;
                                        padding: 10px;
                                    }
                                    .mce-content-body { 
                                        color: rgb(209, 213, 219); 
                                        background: rgb(17, 24, 39);
                                    }
                                    p {
                                        margin: 0.5em 0;
                                        display: block;
                                    }
                                    h1, h2, h3, h4, h5, h6 {
                                        margin: 1em 0 0.5em 0;
                                    }
                                    ul, ol {
                                        margin: 0.5em 0;
                                        padding-left: 2em;
                                    }
                                    li {
                                        margin: 0.25em 0;
                                    }
                                    strong, b {
                                        font-weight: bold;
                                    }
                                    em, i {
                                        font-style: italic;
                                    }
                                    hr {
                                        margin: 1em 0;
                                        border: none;
                                        border-top: 1px solid rgb(75, 85, 99);
                                    }
                                    br {
                                        display: block;
                                        content: '';
                                        margin: 0.5em 0;
                                    }
                                `,
                                skin: 'oxide-dark',
                                content_css: 'dark',
                                statusbar: true,
                                branding: false
                            }}
                            onEditorChange={(content) => {
                                // Keep the full HTML content
                                setDescription(content);
                                
                                // Extract plain text for word counting only
                                let plainText = content
                                    .replace(/<br\s*\/?>/gi, '\n')
                                    .replace(/<\/p>/gi, '\n')
                                    .replace(/<p[^>]*>/gi, '')
                                    .replace(/<[^>]*>/g, ''); // Remove remaining HTML tags
                                
                                plainText = plainText
                                    .replace(/&nbsp;/g, ' ')
                                    .replace(/&amp;/g, '&')
                                    .replace(/&lt;/g, '<')
                                    .replace(/&gt;/g, '>')
                                    .replace(/&quot;/g, '"')
                                    .replace(/&#039;/g, "'")
                                    .replace(/\n\s+/g, '\n')
                                    .replace(/\s+\n/g, '\n')
                                    .replace(/[ \t]+/g, ' ')
                                    .trim();
                                
                                // Count words from plain text only
                                const words = plainText.split(/\s+/).filter(word => word.length > 0);
                                const currentWordCount = words.length;
                                
                                // Hard limit: max 500 words
                                if (currentWordCount > 500) {
                                    const truncated = words.slice(0, 500).join(' ');
                                    setDescription(truncated);
                                    setWordCount(500);
                                    setValue("productDescription", truncated, { shouldValidate: true });
                                    if (editorRef.current) {
                                        editorRef.current.setContent(truncated);
                                    }
                                    // Only show toast if user tried to add more after reaching limit
                                    if (wordCount >= 500) {
                                        toast.error("Maximum 500 words allowed");
                                    }
                                } else {
                                    setWordCount(currentWordCount);
                                    setValue("productDescription", content, { shouldValidate: true });
                                }
                            }}
                        />
                    </div>
                    <div className="flex justify-between items-center">
                        <p className={`text-left text-sm mt-4 ${
                            wordCount === 0 ? 'text-white/60' : 
                            wordCount > 500 ? 'text-red-500' : 
                            'text-white/60'
                        }`}>
                            {wordCount} words / 500 words
                        </p>
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

                        {errors.startTime && <p className="text-red-400 text-sm mt-1">{errors.startTime.message as any}</p>}
                    </div>
                    <div>
                        <label htmlFor="endTime" className="text-white/80">Auction End Time<span className="text-red-500">*</span></label>
                        <input type="datetime-local" id="endTime" className="w-full mt-2 p-2 rounded-md bg-(--secondary) border border-white/10 text-white" {...register("endTime")} />

                        {errors.endTime && <p className="text-red-400 text-sm mt-1">{errors.endTime.message as any}</p>}
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
                <button className="bg-(--primary) text-black w-full px-6 py-2 rounded-md hover:scale-101 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}>
                    {submitting ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Auction" : "Create Auction")}
                </button>


            </div>
        </form>
    );
}