import { useState, useEffect } from "react";
import { toast } from "sonner";
import adminService, { type AdminCategory } from "@/services/adminService";

export default function EditCategoryModal({
    setEditingCategory, categoryData, onUpdate
}: {
    setEditingCategory: React.Dispatch<React.SetStateAction<boolean>>,
    categoryData: AdminCategory,
    onUpdate: () => void
}) {
    const [name, setName] = useState(categoryData.name);
    const [parentId, setParentId] = useState<number | null>(categoryData.parent || null);
    const [categories, setCategories] = useState<AdminCategory[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const result = await adminService.getCategories("name_asc", 1, 100);
                // Filter out the current category to prevent self-referencing cyclic dependency
                const otherCategories = result.categories.filter(cat => cat.id !== categoryData.id);
                setCategories(otherCategories);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            } finally {
                setIsLoadingCategories(false);
            }
        };
        fetchCategories();
    }, [categoryData.id]);

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error("Category name is required");
            return;
        }
        try {
            setIsSubmitting(true);
            await adminService.updateCategory(categoryData.id, name, parentId);
            toast.success("Category updated successfully");
            onUpdate();
            setEditingCategory(false);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to update category");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="backdrop-filter backdrop-blur-sm fixed inset-0 flex justify-center items-center z-99999">
            <div className="bg-(--third) border border-white/10 rounded-lg lg:w-1/2 w-9/10 p-4">
                <div className="flex flex-col justify-start items-center gap-4 w-full p-8">
                    <h2 className="text-(--primary) font-bold text-2xl text-center">Edit Category Information</h2>
                    <p className="text-white/60 text-center">Update the category's basic information.</p>

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
                            {categories.filter(c => c.parent === null).map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        {isLoadingCategories && <p className="text-xs text-white/40 mt-1">Loading categories...</p>}
                    </div>

                    <div className="w-full flex justify-between items-center gap-4 mt-4">
                        <button className="bg-(--secondary) text-white rounded-md p-2 w-full" onClick={() => setEditingCategory(false)}>Cancel</button>
                        <button
                            className="bg-(--primary) text-black rounded-md p-2 w-full disabled:opacity-50 font-bold"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}