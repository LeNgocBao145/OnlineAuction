import { useState } from "react";
import { toast } from "sonner";
import adminService, { type AdminCategory } from "@/services/adminService";

export default function EditCategoryModal({
    setEditingCategory, categoryData, onUpdate
} : {
    setEditingCategory: React.Dispatch<React.SetStateAction<boolean>>,
    categoryData: AdminCategory,
    onUpdate: () => void
}) {
    const [name, setName] = useState(categoryData.name);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error("Category name is required");
            return;
        }
        try {
            setIsSubmitting(true);
            await adminService.updateCategory(categoryData.id, name);
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
                    <div className="w-full flex justify-between items-center gap-4">
                        <button className="bg-(--secondary) text-white rounded-md p-2 w-full" onClick={() => setEditingCategory(false)}>Cancel</button>
                        <button 
                            className="bg-(--primary) text-black rounded-md p-2 w-full disabled:opacity-50"
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