import { useState, useEffect } from "react";
import { toast } from "sonner";
import adminService, { type AdminCategory } from "@/services/adminService";

export default function AddCategoryModal({
    setAddingCategory,
    onCreated
}: {
    setAddingCategory: React.Dispatch<React.SetStateAction<boolean>>,
    onCreated: () => void
}) {
    const [name, setName] = useState("");
    const [parentId, setParentId] = useState<number | null>(null);
    const [categories, setCategories] = useState<AdminCategory[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Fetch all categories for the dropdown (simplified, without pagination for now as categories list is usually small)
                const result = await adminService.getCategories("name_asc", 1, 100);
                setCategories(result.categories);
            } catch (error) {
                console.error("Failed to fetch categories", error);
                toast.error("Failed to load existing categories");
            } finally {
                setIsLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error("Category name is required");
            return;
        }
        try {
            setIsSubmitting(true);
            await adminService.createCategory(name, parentId);
            toast.success("Category created successfully");
            onCreated();
            setAddingCategory(false);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to create category");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="backdrop-filter backdrop-blur-sm fixed inset-0 flex justify-center items-center z-99999">
            <div className="bg-(--third) border border-white/10 rounded-lg lg:w-1/2 w-9/10 p-4">
                <div className="flex flex-col justify-start items-center gap-4 w-full p-8">
                    <h2 className="text-(--primary) font-bold text-2xl text-center">Create New Category</h2>
                    <p className="text-white/60 text-center">Add a new category to the system.</p>

                    <div className="w-full">
                        <label className="text-white/80 mb-2">Category Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            placeholder="Enter category name..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 rounded-md mt-2 bg-(--secondary) border border-white/10 text-white"
                        />
                    </div>

                    <div className="w-full">
                        <label className="text-white/80 mb-2">Is Subcategory Of? (Optional)</label>
                        <select
                            className="w-full p-2 rounded-md mt-2 bg-(--secondary) border border-white/10 text-white"
                            value={parentId || ""}
                            onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
                            disabled={isLoadingCategories}
                        >
                            <option value="">-- None (Root Category) --</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        {isLoadingCategories && <p className="text-xs text-white/40 mt-1">Loading categories...</p>}
                    </div>

                    <div className="w-full flex justify-between items-center gap-4 mt-4">
                        <button className="bg-(--secondary) text-white rounded-md p-2 w-full" onClick={() => setAddingCategory(false)}>Cancel</button>
                        <button
                            className="bg-(--primary) text-black rounded-md p-2 w-full disabled:opacity-50 font-bold"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Adding..." : "Add Category"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}