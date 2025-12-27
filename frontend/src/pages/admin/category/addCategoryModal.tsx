import { useState } from "react";

export default function AddCategoryModal({
    setAddingCategory
} : {
    setAddingCategory: React.Dispatch<React.SetStateAction<boolean>>
}) {
    const [categoryData, setCategoryData] = useState([
        {id: 1, name: "Electronics"},
        {id: 2, name: "Books"},
        {id: 3, name: "Fashion"},
        {id: 4, name: "Home"},
        {id: 5, name: "Toys"}
    ]);

    return (
        <div className="backdrop-filter backdrop-blur-sm fixed inset-0 flex justify-center items-center z-99999">
            <div className="bg-(--third) border border-white/10 rounded-lg lg:w-1/2 w-9/10 p-4">
                <div className="flex flex-col justify-start items-center gap-4 w-full p-8">
                    <h2 className="text-(--primary) font-bold text-2xl text-center">Create New Category</h2>
                    <p className="text-white/60 text-center">Add new parent category or a child category to an existing category.</p>
                    <div className="w-full">
                        <label className="text-white/80 mb-2">Category Name <span className="text-red-500">*</span></label>
                        <input type="text" placeholder="Enter category name..." className="w-full p-2 rounded-md mt-2 bg-(--secondary) border border-white/10 text-white"/>
                    </div>
                    <div className="w-full">
                        <label className="text-white/80 mb-2">Is Subcategory?</label>
                        <input type="checkbox" id="isSubcategory" name="isSubcategory" className="ml-2"/>
                        <select className="w-full p-2 rounded-md mt-2 bg-(--secondary) border border-white/10 text-white">
                            <option value="">Select Parent Category</option>
                            {categoryData.map((category) => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full flex justify-between items-center gap-4">
                        <button className="bg-(--secondary) text-white rounded-md p-2 w-full" onClick={() => setAddingCategory(false)}>Cancel</button>
                        <button className="bg-(--primary) text-black rounded-md p-2 w-full">Add Category</button>
                    </div>
                </div>
            </div>
        </div>
    );
}