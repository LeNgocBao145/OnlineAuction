import { useState } from "react";
import { toast } from "sonner";
import adminService from "@/services/adminService";

export default function AddCategoryModal({
    setAddingCategory,
    onCreated
} : {
    setAddingCategory: React.Dispatch<React.SetStateAction<boolean>>,
    onCreated: () => void
}) {
    const [name, setName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error("Category name is required");
            return;
        }
        try {
            setIsSubmitting(true);
            await adminService.createCategory(name);
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
                    <div className="w-full flex justify-between items-center gap-4">
                        <button className="bg-(--secondary) text-white rounded-md p-2 w-full" onClick={() => setAddingCategory(false)}>Cancel</button>
                        <button 
                            className="bg-(--primary) text-black rounded-md p-2 w-full disabled:opacity-50"
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