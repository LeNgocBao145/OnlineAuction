import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useRef } from "react";
import productService from "@/services/productService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/stores/authStore";
import { Editor } from "@tinymce/tinymce-react";


import { getImageUrl } from "@/utils/productUtils";

const toLocalISO = (dateStr?: string) => {
    if (!dateStr) return "";
    let s = dateStr.trim();
    if (s.includes(' ') && !s.includes('T')) s = s.replace(' ', 'T');
    if (!s.includes('Z') && !s.includes('+') && !s.match(/-\d{2}:?\d{2}$/)) s += 'Z';

    const d = new Date(s);
    if (isNaN(d.getTime())) return "";

    const offset = d.getTimezoneOffset() * 60000;
    const local = new Date(d.getTime() - offset);
    return local.toISOString().slice(0, 16);
};

export default function CreateProdBody({ productId }: { productId?: string | number }) {
    const isEditing = !!productId;

    const [imageFiles, setImageFiles] = useState<{ file: File, url: string, name: string, originalName?: string }[]>([]);
    const [coverImageIndex, setCoverImageIndex] = useState<number>(0);
    const [description, setDescription] = useState<string>("");
    const [wordCount, setWordCount] = useState<number>(0);
    const [showAppend, setShowAppend] = useState<boolean>(false);
    const [appendText, setAppendText] = useState<string>("");
    const editorRef = useRef<any>(null);
    const appendEditorRef = useRef<any>(null);
    const descriptionDebounceRef = useRef<number | null>(null);
    const appendDebounceRef = useRef<number | null>(null);
    const descriptionRef = useRef<string>("");
    const lastRangeRef = useRef<any>(null);
    const appendTextRef = useRef<string>("");
    const appendLastRangeRef = useRef<any>(null);
    const [appendSaving, setAppendSaving] = useState<boolean>(false);

    const formSchema = z.object({
        productName: z.string().min(1, "Product name is required"),
        categories: z.array(z.string()).min(1, "At least one category is required"),
        startingBid: z.number().min(1, "Starting bid must be at least $1"),
        images: z.array(z.instanceof(File)).min(3, "At least 3 images are required").max(10, "No more than 10 images are allowed"),
        bidStep: z.number().min(1, "Bid step must be at least $1"),
        instantBuy: z.number().nullable().optional(),
        productDescription: isEditing
            ? z.string().optional()
            : z.string().min(1, "Product description is required").max(5000, "Description cannot exceed 5000 characters"),
        startTime: z.string().min(1, "Start time is required"),
        endTime: z.string().min(1, "End time is required"),
        autoExtend: z.boolean().optional()
    });


    const { register, handleSubmit, formState: { errors }, reset, trigger, setValue, watch } = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { images: [], instantBuy: null }
    });

    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [originalData, setOriginalData] = useState<any>(null);
    const { user } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        register("images");
    }, [register]);

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
    }, []);

    useEffect(() => {
        const fetchProductData = async () => {
            if (!productId) return;
            try {
                const product = await productService.getProductById(productId);
                if (product) {
                    // additional_images now contains ALL images including cover
                    // Only fall back to product.image if additional_images is empty
                    const allImages = (product.additional_images && product.additional_images.length > 0)
                        ? product.additional_images
                        : [product.image].filter(Boolean);
                    const mappedImages = allImages.map((url: string, i: number) => ({
                        file: new File([], `image-${i}.jpg`, { type: 'image/jpeg' }),
                        url: getImageUrl(url) || "",
                        name: `Existing Image ${i + 1}`,
                        originalName: url
                    }));

                    const categoryIds = (product.categories || []).map((cat: any) => cat.id?.toString());
                    setSelectedCategories(categoryIds);

                    reset({
                        productName: product.name,
                        categories: categoryIds,
                        startingBid: product.current_price,
                        bidStep: product.step_price || 0,
                        instantBuy: product.instant_price ?? null,
                        productDescription: product.descriptions?.[0]?.description || "",
                        startTime: toLocalISO(product.starting_at),
                        endTime: toLocalISO(product.expired_at),
                        autoExtend: product.isExtent,
                        images: mappedImages.map(img => img.file)
                    });
                    setDescription(product.descriptions?.[0]?.description || "");
                    setImageFiles(mappedImages);
                    setValue("images", mappedImages.map(img => img.file));

                    setOriginalData({
                        productName: product.name,
                        categories: categoryIds,
                        startingBid: product.current_price,
                        bidStep: product.step_price || 0,
                        instantBuy: product.instant_price,
                        productDescription: product.descriptions?.[0]?.description || "",
                        startTime: toLocalISO(product.starting_at),
                        endTime: toLocalISO(product.expired_at),
                        autoExtend: product.isExtent,
                        images: mappedImages.map(img => img.originalName || img.name),
                        coverImageIndex: 0
                    });
                }
            } catch (error) {
                console.error("Failed to fetch product for editing", error);
                toast.error("Failed to load product details");
            }
        };
        fetchProductData();
    }, [productId]);

    useEffect(() => {
        return () => {
            imageFiles.forEach(img => {
                if (img.url && img.url.startsWith('blob:')) {
                    URL.revokeObjectURL(img.url);
                }
            });
        };
    }, [imageFiles]);

    useEffect(() => {
        if (!isEditing || !originalData) {
            setHasChanges(false);
            return;
        }

        const subscription = watch((formData) => {
            const currentImages = imageFiles.map(img => img.originalName || img.name);
            const originalImages = originalData.images || [];

            const imagesChanged =
                currentImages.length !== originalImages.length ||
                currentImages.some((img, idx) => img !== originalImages[idx]) ||
                coverImageIndex !== originalData.coverImageIndex;

            const fieldsChanged =
                formData.productName !== originalData.productName ||
                JSON.stringify(selectedCategories.sort()) !== JSON.stringify((originalData.categories || []).sort()) ||
                formData.startingBid !== originalData.startingBid ||
                formData.bidStep !== originalData.bidStep ||
                formData.instantBuy !== originalData.instantBuy ||
                formData.startTime !== originalData.startTime ||
                formData.endTime !== originalData.endTime ||
                formData.autoExtend !== originalData.autoExtend ||
                description !== originalData.productDescription;

            setHasChanges(imagesChanged || fieldsChanged);
        });

        return () => subscription.unsubscribe();
    }, [isEditing, originalData, imageFiles, coverImageIndex, description, selectedCategories, watch]);

    useEffect(() => {
        if (!isEditing || !originalData) return;

        if (coverImageIndex !== originalData.coverImageIndex) {
            setHasChanges(true);
        }
    }, [coverImageIndex, isEditing, originalData]);

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

            const formData = new FormData();
            formData.append("seller", user.id.toString());
            formData.append("name", data.productName);
            formData.append("categories", JSON.stringify(selectedCategories));
            formData.append("init_price", data.startingBid.toString());
            formData.append("step_price", data.bidStep.toString());
            if (data.instantBuy) formData.append("instant_price", data.instantBuy.toString());
            formData.append("start_at", new Date(data.startTime).toISOString());
            formData.append("expired_at", new Date(data.endTime).toISOString());

            if (!isEditing) {
                formData.append("description", data.productDescription);
            } else if (appendText && appendText.replace(/<[^>]*>/g, '').trim()) {
                const mergedDescription = (description || "") + appendText;
                formData.append("description", mergedDescription);
            }

            formData.append("isExtent", data.autoExtend ? "true" : "false");
            formData.append("coverImageIndex", coverImageIndex.toString());

            const imagesOrder: string[] = [];
            imageFiles.forEach(img => {
                if (img.originalName) {
                    imagesOrder.push(`existing:${img.originalName}`);
                } else {
                    imagesOrder.push("new");
                    formData.append("images", img.file);
                }
            });
            formData.append("imagesOrder", JSON.stringify(imagesOrder));

            if (isEditing) {
                const result = await productService.updateProduct(productId, formData);
                toast.success(result.message || "Auction updated successfully!");
            } else {
                const result = await productService.addProduct(formData);
                toast.success(result.message || "Auction created successfully!");
            }
            navigate("/profile/sellings");

        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to create auction");
        } finally {
            setSubmitting(false);
        }
    }

    const handleAppendSave = async () => {
        if (!productId) return;
        if (!appendText || !appendText.replace(/<[^>]*>/g, '').trim()) {
            toast.error('Nothing to append');
            return;
        }

        try {
            setAppendSaving(true);

            const result = await productService.addDescription(productId, appendText);
            toast.success(result.message || 'Description appended');

            try {
                const updatedProduct = await productService.getProductById(productId);
                const latestDesc = updatedProduct?.descriptions?.[0]?.description || "";
                setDescription(latestDesc);
                setOriginalData((prev: any) => prev ? { ...prev, productDescription: latestDesc } : prev);
            } catch (e) {
                console.warn('Failed to refetch product after appending description', e);
            }

            setAppendText('');
            setShowAppend(false);
            setHasChanges(false);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to append description');
        } finally {
            setAppendSaving(false);
        }
    };


    return (
        <form className="px-[10%] py-8" onSubmit={handleSubmit(onSubmit)} noValidate>
            <h1 className="text-3xl font-bold text-(--primary)">{isEditing ? `Edit Auction #${productId}` : "Create New Auction"}</h1>

            <div className="mt-6 border border-white/10 rounded-lg p-6 bg-(--third)">
                <h2 className="text-2xl text-white text-bold">Basic Product Information</h2>
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="lg:col-span-2">
                        <label htmlFor="productName" className="text-white/80">Product Name<span className="text-red-500">*</span></label>
                        <div className="flex items-start gap-2">
                            <input type="text" id="productName" className="flex-1 mt-2 p-2 rounded-md bg-(--secondary) border border-white/10 text-white"
                                placeholder="Enter product name" {...register("productName")} />
                        </div>
                        {errors.productName && <p className="text-red-400 text-sm mt-1">{errors.productName.message as any}</p>}

                    </div>
                    <div className="lg:col-span-2">
                        <label className="text-white/80">Categories<span className="text-red-500">*</span></label>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-4 rounded-md bg-(--secondary) border border-white/10">
                            {categories.map((cat: any) => (
                                <label key={cat.id} className="flex items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        value={cat.id}
                                        checked={selectedCategories.includes(cat.id.toString())}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            const newSelected = e.target.checked
                                                ? [...selectedCategories, value]
                                                : selectedCategories.filter(id => id !== value);
                                            setSelectedCategories(newSelected);
                                            setValue("categories", newSelected);
                                            trigger("categories");
                                        }}
                                        className="form-checkbox h-4 w-4 text-(--primary) bg-(--third) border-white/20 rounded"
                                    />
                                    <span className="text-white/90 text-sm">{cat.name}</span>
                                </label>
                            ))}
                        </div>
                        {errors.categories && <p className="text-red-400 text-sm mt-1">{errors.categories.message as any}</p>}
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
                        <div className="space-y-4">
                            <p className="text-white/80 text-sm">Select an image to be the cover image (The one displayed first):</p>
                            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {imageFiles.map((img, index) => (
                                    <li key={index} className="relative group">
                                        <div className={`relative p-1 rounded-md border-2 transition-all ${coverImageIndex === index ? 'border-(--primary)' : 'border-transparent'}`}>
                                            <img
                                                src={img.url}
                                                alt={img.name}
                                                className="w-full aspect-square object-cover rounded-md"
                                            />
                                            {coverImageIndex === index && (
                                                <div className="absolute top-2 left-2 bg-(--primary) text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-lg">
                                                    COVER
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-white/60 text-xs mt-1 text-center truncate px-1">{img.name}</p>

                                        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button type="button"
                                                onClick={() => setCoverImageIndex(index)}
                                                title="Set as cover"
                                                className={`h-7 w-7 flex items-center justify-center bg-black/80 text-white rounded shadow-lg hover:bg-(--primary) hover:text-black transition-colors ${coverImageIndex === index ? 'hidden' : ''}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                            <button type="button"
                                                onClick={() =>
                                                    setImageFiles((prev) => {
                                                        const newImageFiles = prev.filter((_, i) => i !== index);
                                                        setValue("images", newImageFiles.map(img => img.file));
                                                        trigger("images");
                                                        if (coverImageIndex === index) setCoverImageIndex(0);
                                                        else if (coverImageIndex > index) setCoverImageIndex(coverImageIndex - 1);
                                                        return newImageFiles;
                                                    })}
                                                title="Remove image"
                                                className="h-7 w-7 flex items-center justify-center bg-black/80 text-white rounded shadow-lg hover:bg-red-500 transition-colors">
                                                &times;
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
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
                            placeholder="Enter instant buy price" {...register("instantBuy", {
                                setValueAs: (v) => {
                                    if (v === "" || v === null || v === undefined) return null;
                                    const parsed = parseFloat(v);
                                    return isNaN(parsed) ? null : parsed;
                                }
                            })} />
                    </div>
                </div>
            </div>
            {!isEditing ? (
                <div className="mt-6 border border-white/10 rounded-lg p-6 bg-(--third)">
                    <h2 className="text-2xl text-white text-bold">Product Description</h2>
                    <div className="mt-4">
                        <label htmlFor="productDescription" className="text-white/80">Description<span className="text-red-500">*</span></label>
                        <div className="mt-2 rounded-md overflow-hidden border border-white/10">
                            <Editor
                                key="create-editor"
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
                                    content_style: `
                                        body { 
                                            font-family: Helvetica, Arial, sans-serif; 
                                            font-size: 14px; 
                                            background: rgb(17, 24, 39); 
                                            color: rgb(209, 213, 219);
                                            line-height: 1.6;
                                            margin: 0;
                                            padding: 10px;
                                            direction: ltr;
                                        }
                                        .mce-content-body { 
                                            color: rgb(209, 213, 219); 
                                            background: rgb(17, 24, 39);
                                            direction: ltr;
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
                                    forced_root_block_attrs: { dir: 'ltr' },
                                    setup: (editor: any) => {
                                        const log = (e: any) => {
                                            try {
                                                const rng = editor.selection && editor.selection.getRng && editor.selection.getRng();
                                                const start = rng ? rng.startOffset : null;
                                                console.log('TinyMCE event', e.type, { key: e.key, data: e.data, isComposing: e.isComposing, selStart: start, text: editor.getContent({ format: 'text' }).slice(0, 200) });
                                            } catch (err) {
                                                console.log('TinyMCE logging error', err);
                                            }
                                        };
                                        ['keydown', 'input', 'compositionstart', 'compositionupdate', 'compositionend'].forEach(evt => editor.on(evt, log));
                                    },
                                    statusbar: true,
                                    branding: false
                                }}
                                onEditorChange={(content) => {
                                    // preserve selection range to restore after any React updates
                                    try {
                                        const rng = editorRef.current?.selection?.getRng?.();
                                        lastRangeRef.current = rng ? (rng.cloneRange ? rng.cloneRange() : rng) : null;
                                    } catch (e) {
                                        lastRangeRef.current = null;
                                    }

                                    // keep content in a ref to avoid causing React re-renders on every keystroke
                                    descriptionRef.current = content;

                                    // debounce updating react-hook-form value (keeps form in sync without frequent re-renders)
                                    if (descriptionDebounceRef.current) window.clearTimeout(descriptionDebounceRef.current);
                                    descriptionDebounceRef.current = window.setTimeout(() => {
                                        setValue("productDescription", descriptionRef.current, { shouldValidate: true });
                                        // restore selection shortly after form update
                                        setTimeout(() => {
                                            try {
                                                const rng = lastRangeRef.current;
                                                if (rng && editorRef.current?.selection?.setRng) editorRef.current.selection.setRng(rng);
                                            } catch (e) { /* ignore */ }
                                        }, 0);
                                    }, 300) as unknown as number;

                                    let plainText = content
                                        .replace(/<br\s*\/?>(?:\s*)/gi, '\n')
                                        .replace(/<\/p>/gi, '\n')
                                        .replace(/<p[^>]*>/gi, '')
                                        .replace(/<[^>]*>/g, '');

                                    plainText = plainText
                                        .replace(/&nbsp;/g, ' ')
                                        .replace(/&amp;/g, '&')
                                        .replace(/&lt;/g, '<')
                                        .replace(/&gt;/g, '>')
                                        .replace(/&quot;/g, "\"")
                                        .replace(/&#039;/g, "'")
                                        .replace(/\n\s+/g, '\n')
                                        .replace(/\s+\n/g, '\n')
                                        .replace(/[ \t]+/g, ' ')
                                        .trim();

                                    const words = plainText.split(/\s+/).filter(word => word.length > 0);
                                    const currentWordCount = words.length;

                                    if (currentWordCount > 500) {
                                        const truncated = words.slice(0, 500).join(' ');
                                        // update both ref and state for truncation case
                                        descriptionRef.current = truncated;
                                        setDescription(truncated);
                                        setWordCount(500);
                                        // immediate set for truncation
                                        setValue("productDescription", truncated, { shouldValidate: true });
                                        if (editorRef.current) {
                                            editorRef.current.setContent(truncated);
                                            // restore selection after truncation
                                            try {
                                                const rng = lastRangeRef.current;
                                                if (rng && editorRef.current.selection && editorRef.current.selection.setRng) {
                                                    setTimeout(() => editorRef.current.selection.setRng(rng), 0);
                                                }
                                            } catch (e) { /* ignore */ }
                                        }
                                        if (wordCount >= 500) {
                                            toast.error("Maximum 500 words allowed");
                                        }
                                    } else {
                                        setWordCount(currentWordCount);
                                    }
                                }}
                                onBlur={() => {
                                    setDescription(descriptionRef.current);
                                    setValue("productDescription", descriptionRef.current, { shouldValidate: true });
                                }}
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <p className={`text-left text-sm mt-4 ${wordCount === 0 ? 'text-white/60' :
                                wordCount > 500 ? 'text-red-500' :
                                    'text-white/60'
                                }`}>
                                {wordCount} words / 500 words
                            </p>
                            {errors.productDescription && <p className="text-red-400 text-sm mt-1">{errors.productDescription.message}</p>}
                        </div>
                    </div>
                </div>
            ) : (
                isEditing && (
                    <div className="mt-6 border border-white/10 rounded-lg p-6 bg-(--third)">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl text-white text-bold">Product Description</h2>
                            <button
                                type="button"
                                onClick={() => setShowAppend(prev => !prev)}
                                className={`px-3 py-2 rounded-md text-sm font-medium ${showAppend ? 'bg-white/10 text-(--primary)' : 'bg-(--primary) text-black'}`}>
                                {showAppend ? 'Close Append' : 'Append Description'}
                            </button>
                        </div>

                        {showAppend ? (
                            <div className="mt-4">
                                <label className="text-white/80">Content to append</label>
                                <div className="mt-2 rounded-md overflow-hidden border border-white/10">
                                    <Editor
                                        key="append-editor"
                                        ref={appendEditorRef}
                                        apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                                        initialValue={appendText}
                                        init={{
                                            height: 300,
                                            menubar: true,
                                            plugins: [
                                                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                                                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                                'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
                                            ],
                                            toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                                            content_style: `body { font-family: Helvetica, Arial, sans-serif; font-size: 14px; background: rgb(17, 24, 39); color: rgb(209, 213, 219); padding:10px; direction: ltr; }`,
                                            skin: 'oxide-dark',
                                            content_css: 'dark',
                                            statusbar: true,
                                            branding: false
                                        }}
                                        onEditorChange={(content) => {
                                            // preserve selection for append editor
                                            try {
                                                const rng = appendEditorRef.current?.selection?.getRng?.();
                                                appendLastRangeRef.current = rng ? (rng.cloneRange ? rng.cloneRange() : rng) : null;
                                            } catch (e) {
                                                appendLastRangeRef.current = null;
                                            }

                                            // keep content in ref to avoid re-renders
                                            appendTextRef.current = content;

                                            if (appendDebounceRef.current) window.clearTimeout(appendDebounceRef.current);
                                            appendDebounceRef.current = window.setTimeout(() => { }, 300) as unknown as number;
                                        }}
                                        onBlur={() => {
                                            // commit append content on blur
                                            setAppendText(appendTextRef.current);
                                            try {
                                                const rng = appendLastRangeRef.current;
                                                if (rng && appendEditorRef.current?.selection?.setRng) appendEditorRef.current.selection.setRng(rng);
                                            } catch (e) { /* ignore */ }
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-white/60 text-sm mt-4">Content you add here will be appended to the current description when you update the auction.</p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleAppendSave}
                                            disabled={appendSaving}
                                            className="bg-(--primary) text-black px-4 py-2 rounded-md font-medium disabled:opacity-50"
                                        >
                                            {appendSaving ? 'Saving...' : 'Add'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4">
                                <p className="text-white/70">Existing description will remain unchanged. Click "Append Description" to add more content.</p>
                            </div>
                        )}
                    </div>
                )
            )}
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
                        window.history.back();
                    }}
                >
                    Cancel
                </button>
                <button className="bg-(--primary) text-black w-full px-6 py-2 rounded-md hover:scale-101 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting || (isEditing && !hasChanges)}>
                    {submitting ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Auction" : "Create Auction")}
                </button>


            </div>
        </form>
    );
}