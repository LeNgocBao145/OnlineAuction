import Nav from "@/components/ui/nav";
import AdminHeader from "../adminHeader";
import AddCategoryModal from "./addCategoryModal";

import { MagnifyingGlassIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import EditCategoryModal from "./editCategoryModal";
import adminService, { type AdminCategory } from "@/services/adminService";

export default function CategoryManagementTab() {
    const [addingCategory, setAddingCategory] = useState(false);
    const [editingCategory, setEditingCategory] = useState(false);
    const [editingCategoryData, setEditingCategoryData] = useState<AdminCategory | null>(null);
    const [categoryData, setCategoryData] = useState<AdminCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: keyof AdminCategory; direction: "asc" | "desc" } | null>(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, totalItems: 0, totalPages: 0 });

    const fetchCategories = async () => {
        try {
            setLoading(true);
            // Build sort parameter for backend
            let sortParam = "id_asc";
            if (sortConfig) {
                const sortKey = `${sortConfig.key}_${sortConfig.direction}`;
                sortParam = sortKey;
            }
            const result = await adminService.getCategories(sortParam, pagination.page, pagination.limit);
            setCategoryData(result.categories);
            setPagination(result.pagination);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to fetch categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [sortConfig, pagination.page]);

    const handleDeleteCategory = async (categoryId: number) => {
        if (!confirm("Are you sure you want to delete this category?")) return;
        try {
            await adminService.deleteCategory(categoryId);
            toast.success("Category deleted successfully");
            fetchCategories();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to delete category");
        }
    };

    const handleSort = (key: keyof AdminCategory) => {
        let direction: "asc" | "desc" = "asc";
        if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const filteredCategoryData = categoryData.filter(category =>
        category.name.toLowerCase().includes(searchKeyword.toLowerCase())
    );

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    return (
        <>
            {addingCategory && <AddCategoryModal setAddingCategory={setAddingCategory} onCreated={fetchCategories} />}
            {editingCategory && editingCategoryData && <EditCategoryModal
                setEditingCategory={setEditingCategory}
                categoryData={editingCategoryData}
                onUpdate={fetchCategories}
            />}
            <Nav />
            <div className="px-[10%]">
                <AdminHeader activeTab="category" />
                <div className="p-4 border border-white/10 rounded-b-lg bg-(--third)">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                        <div className="relative lg:w-2/3 w-full flex gap-4">
                            <input
                                className="border border-white/10 text-white/60 bg-(--secondary) w-full h-10 p-2 rounded-md"
                                placeholder="Search category by name..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                            />
                            <MagnifyingGlassIcon className="w-5 h-5 text-white/60 absolute right-4 top-2.5" />
                        </div>
                        <button className="bg-(--primary) p-4 font-bold text-black rounded-md"
                            onClick={() => setAddingCategory(true)}
                        >+ Create New Category</button>
                    </div>
                    <div className="bg-(--secondary) rounded-md p-4 mt-4">
                        <div className="overflow-x-auto">
                            <div className="w-365">
                                <div className="mt-6 grid grid-cols-[1fr_3fr_2fr_2fr] font-bold text-white/80 border-b border-white/10 pb-2">
                                    <div onClick={() => handleSort("id")} className="cursor-pointer flex items-center gap-1">Category ID {sortConfig?.key === "id" && (sortConfig.direction === "asc" ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />)}</div>
                                    <div onClick={() => handleSort("name")} className="cursor-pointer flex items-center gap-1">Name {sortConfig?.key === "name" && (sortConfig.direction === "asc" ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />)}</div>
                                    <div onClick={() => handleSort("product_count")} className="cursor-pointer flex items-center gap-1">Total Products {sortConfig?.key === "product_count" && (sortConfig.direction === "asc" ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />)}</div>
                                    <p>Actions</p>
                                </div>
                                <ul>
                                    {loading ? (
                                        <p className="text-white/60 py-4">Loading...</p>
                                    ) : filteredCategoryData.length === 0 ? (
                                        <p className="text-white/60 py-4">No categories found.</p>
                                    ) : (
                                        filteredCategoryData.map((category) => (
                                            <li key={category.id} className="h-20 border-b border-white/10 grid grid-cols-[1fr_3fr_2fr_2fr] items-center">
                                                <p className="text-white/60">{category.id}</p>
                                                <p className="text-white/60">{category.name}</p>
                                                <p className="text-white/60">{category.product_count || 0}</p>
                                                <div className="flex gap-2">
                                                    <button className="text-sm bg-(--primary) text-black rounded-md px-2 py-1 hover:bg-(--primary)/10"
                                                        onClick={() => {
                                                            setEditingCategoryData(category);
                                                            setEditingCategory(true);
                                                        }}>Edit</button>
                                                    <button
                                                        className="text-sm bg-red-500 text-white rounded-md px-2 py-1 hover:bg-red-500/10"
                                                        onClick={() => handleDeleteCategory(category.id)}
                                                    >Delete</button>
                                                </div>
                                            </li>
                                        )))}
                                </ul>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-center items-center space-x-2 mt-8">
                                <button
                                    onClick={() => handlePageChange(1)}
                                    disabled={pagination.page === 1}
                                    className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                                    First
                                </button>
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                                    Previous
                                </button>
                                <span className="text-white">
                                    Page <span className="text-(--primary) font-bold">{pagination.page}</span> of <span className="text-(--primary) font-bold">{pagination.totalPages || 1}</span>
                                </span>
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                                    Next
                                </button>
                                <button
                                    onClick={() => handlePageChange(pagination.totalPages)}
                                    disabled={pagination.page >= pagination.totalPages}
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
