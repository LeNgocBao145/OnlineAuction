import Nav from "@/components/ui/nav";
import AdminHeader from "../adminHeader";
import AddCategoryModal from "./addCategoryModal";

import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import { useState } from "react";
import EditCategoryModal from "./editCategoryModal";

export default function CategoryManagementTab() {
    const [addingCategory, setAddingCategory] = useState(false);
    const [editingCategory, setEditingCategory] = useState(false);
    const [editingCategoryData, setEditingCategoryData] = useState<{ name: string }>({ name: "" });
    const [categoryData, setCategoryData] = useState(
        [
            {id: 1, name: "Electronics", totalProducts: 120, createdDate: "2022-05-10", status: "Active" },
            {id: 2, name: "Books", totalProducts: 80, createdDate: "2021-11-22", status: "Hidden" },
            {id: 3, name: "Fashion", totalProducts: 150, createdDate: "2023-01-15", status: "Active" },
            {id: 4, name: "Home", totalProducts: 60, createdDate: "2022-08-30", status: "Active" },
            {id: 5, name: "Toys", totalProducts: 90, createdDate: "2021-12-05", status: "Hidden" }
        ]
    );

    const [currentFilter, setCurrentFilter] = useState("All Status");

    const filteredCategoryData = currentFilter === "All Status" ? categoryData : categoryData.filter(category => category.status === currentFilter);

    return (
        <>
            {addingCategory && <AddCategoryModal setAddingCategory={setAddingCategory} />}
            {editingCategory && <EditCategoryModal 
                setEditingCategory={setEditingCategory}
                username={editingCategoryData.name}
            />}
            <Nav />
            <div className="px-[10%]">
                <AdminHeader activeTab="category" />
                <div className="p-4 border border-white/10 rounded-b-lg bg-(--third)">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                        <div className="relative lg:w-2/3 w-full flex gap-4">
                            <input className="border border-white/10 text-white/60 bg-(--secondary) w-full h-10 p-2 rounded-md" placeholder="Search product by name..." />
                            <MagnifyingGlassIcon className="w-5 h-5 text-white/60 absolute right-32 top-2.5" />
                            <div>
                                <select className="bg-(--secondary) text-white/60 border border-white/10 rounded-md h-10 p-2" value={currentFilter} onChange={(e) => setCurrentFilter(e.target.value)}>
                                    <option value="All Status">All Status</option>
                                    <option value="Active">Active</option>
                                    <option value="Hidden">Hidden</option>
                                </select>
                            </div>
                        </div>
                        <button className="bg-(--primary) p-4 font-bold text-black rounded-md"
                        onClick={() => setAddingCategory(true)}
                        >+ Create New Category</button>
                    </div>
                    <div className="bg-(--secondary) rounded-md p-4 mt-4">
                        <div className="overflow-x-auto">
                            <div className="w-365">
                                <div className="mt-6 grid grid-cols-[1fr_3fr_1fr_2fr_1fr_2fr] font-bold text-white/80 border-b border-white/10 pb-2">
                                    <p>Product ID</p>
                                    <p>Name</p>
                                    <p>Total Products</p>
                                    <p>Created Date</p>
                                    <p>Status</p>
                                    <p>Actions</p>
                                </div>
                                <ul>
                                    {filteredCategoryData.length === 0 ? (
                                        <p className="text-white/60">No users found.</p>
                                    ) : (
                                    filteredCategoryData.map((category) => (
                                        <li key={category.id} className="h-20 border-b border-white/10 grid grid-cols-[1fr_3fr_1fr_2fr_1fr_2fr] items-center">
                                            <p className="text-white/60">{category.id}</p>
                                            <p className="text-white/60">{category.name}</p>
                                            <p className="text-white/60">{category.totalProducts}</p>
                                            <p className="text-(--primary)">{category.createdDate}</p>
                                            <p className={category.status === "Active" ? "text-green-500" : "text-red-500"}>{category.status}</p>
                                            <div className="flex gap-2">
                                                <button onClick={() => {
                                                    setCategoryData(categoryData.map(cat => {
                                                        if (cat.id === category.id) {
                                                            return {...cat, status: cat.status === "Active" ? "Hidden" : "Active"};
                                                        };
                                                        return cat;
                                                    }));
                                                }}>
                                                    {category.status === "Active" ?
                                                        <EyeIcon className="w-6 h-6 text-white/60 hover:text-(--primary)" /> :
                                                        <EyeSlashIcon className="w-6 h-6 text-white/60 hover:text-(--primary)" />
                                                    }
                                                </button>
                                                <button className="text-sm bg-(--primary) text-black rounded-md px-2 py-1 hover:bg-(--primary)/10" 
                                                onClick={() => {
                                                    setEditingCategoryData({ name: category.name });
                                                    setEditingCategory(true);
                                                }}>Edit</button>
                                                <button className="text-sm bg-red-500 text-white rounded-md px-2 py-1 hover:bg-red-500/10">Delete</button>
                                            </div>
                                        </li>
                                    )))}
                                </ul>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-center items-center space-x-2 mt-8">
                                <button 
                                    className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                                    First
                                </button>
                                <button 
                                    className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                                    Previous
                                </button>
                                <span className="text-white">
                                    Page <span className="text-(--primary) font-bold">1</span> of <span className="text-(--primary) font-bold">N</span>
                                </span>
                                <button 
                                    className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                                    Next
                                </button>
                                <button 
                                    className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                                    Last
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
