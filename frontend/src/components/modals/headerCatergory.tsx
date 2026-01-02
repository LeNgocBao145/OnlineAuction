import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import api from "@/lib/axios";
import useSearchStore from "@/stores/searchStore";

interface Category {
    id: number;
    name: string;
    parent: number | null;
    parent_name: string | null;
}

export default function HeaderCategory() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedParent, setSelectedParent] = useState<number | null>(null);
    const navigate = useNavigate();
    const { filterProducts } = useSearchStore();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/categories');
                setCategories(res.data?.data || []);
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const parentCategories = categories.filter(c => c.parent === null);
    const childCategories = categories.filter(c => c.parent === selectedParent && selectedParent !== null);

    const handleCategoryClick = async (category: Category) => {
        await filterProducts({
            category: category.id,
            page: 1,
            limit: 9
        });
        navigate("/search");
    };

    return (
        <div className='absolute top-[100px] mt-1 lg:left-[10%] left-[3%] lg:w-[80%] w-[94%] h-[500px] bg-(--secondary) z-9999 flex rounded-xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200'>
            {/* Left Column: Parent Categories */}
            <div className="lg:w-1/4 w-2/5 p-4 border-r border-white/10 overflow-y-auto custom-scrollbar bg-black/5">
                <h3 className="text-(--primary) text-xs font-bold uppercase tracking-wider mb-4 px-2 opacity-50">Categories</h3>
                {loading ? (
                    <div className="text-white/40 px-2 flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-(--primary)"></div>
                        Loading...
                    </div>
                ) : parentCategories.length === 0 ? (
                    <div className="text-white/40 px-2 italic">No categories</div>
                ) : (
                    parentCategories.map((category) => (
                        <div
                            key={category.id}
                            className={`h-11 rounded-lg mb-1 cursor-pointer flex justify-between items-center px-4 transition-all duration-200
                                ${selectedParent === category.id ? 'bg-(--primary) text-black font-bold scale-[1.02]' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                            onMouseEnter={() => setSelectedParent(category.id)}
                            onClick={() => handleCategoryClick(category)}
                        >
                            <span className="truncate">{category.name}</span>
                            <ChevronRightIcon className={`w-4 h-4 transition-transform ${selectedParent === category.id ? 'translate-x-1' : 'opacity-40'}`} />
                        </div>
                    ))
                )}
            </div>

            {/* Right Column: Subcategories */}
            <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
                {selectedParent ? (
                    <>
                        <div className="flex justify-between items-center mb-6 pb-2 border-b border-white/5">
                            <h3 className="text-xl font-bold text-white">
                                {parentCategories.find(c => c.id === selectedParent)?.name}
                            </h3>
                            <button
                                className="text-(--primary) hover:underline text-sm font-medium"
                                onClick={() => handleCategoryClick(parentCategories.find(c => c.id === selectedParent)!)}
                            >
                                View all items
                            </button>
                        </div>

                        {childCategories.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                {childCategories.map((category) => (
                                    <div
                                        key={category.id}
                                        className='group bg-white/2 border border-white/5 text-white/80 hover:text-black hover:bg-(--primary) hover:border-(--primary) cursor-pointer py-4 px-4 rounded-xl transition-all duration-200 flex items-center justify-between shadow-sm'
                                        onClick={() => handleCategoryClick(category)}
                                    >
                                        <span className="font-medium">{category.name}</span>
                                        <ChevronRightIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-white/20 text-center py-20">
                                <p className="text-lg italic">No subcategories found</p>
                                <p className="text-sm">This category doesn't have any specific sub-groups yet.</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-white/20 text-center space-y-4">
                        <div className="p-4 bg-white/5 rounded-full">
                            <ChevronRightIcon className="w-12 h-12 rotate-180 opacity-20" />
                        </div>
                        <div>
                            <p className="text-lg font-bold">Welcome to Categories</p>
                            <p className="text-sm">Hover over a category on the left to see more details.</p>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
}