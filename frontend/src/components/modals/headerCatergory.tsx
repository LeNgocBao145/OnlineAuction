import React, { useState, useEffect, useMemo } from "react";
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

interface TreeCategory extends Category {
    children: TreeCategory[];
}

export default function HeaderCategory() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [activePath, setActivePath] = useState<number[]>([]);
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

    // Build recursive tree structure
    const categoryTree = useMemo(() => {
        const buildTree = (parentId: number | null = null): TreeCategory[] => {
            return categories
                .filter(c => c.parent === parentId)
                .map(c => ({
                    ...c,
                    children: buildTree(c.id)
                }));
        };
        return buildTree(null);
    }, [categories]);

    const handleCategoryClick = async (category: Category) => {
        await filterProducts({
            category: category.id,
            page: 1,
            limit: 9
        });
        navigate("/search");
    };

    const handleMouseEnter = (level: number, id: number) => {
        const newPath = activePath.slice(0, level);
        newPath[level] = id;
        setActivePath(newPath);
    };

    // Render a column of categories at a specific level
    const renderCategoryColumn = (level: number, currentChildren: TreeCategory[]): React.ReactNode => {
        if (!currentChildren || currentChildren.length === 0) return null;

        const activeId = activePath[level];
        const nextChildren = currentChildren.find(c => c.id === activeId)?.children || [];

        return (
            <>
                <div className="flex-1 p-4 border-r border-white/10 min-w-[200px] max-h-[500px] overflow-y-auto custom-scrollbar">
                    <h3 className="text-(--primary) text-xs font-bold uppercase tracking-wider mb-4 px-2 opacity-50">
                        {level === 0 ? "Categories" : "Subcategories"}
                    </h3>
                    {currentChildren.map((category) => (
                        <div
                            key={category.id}
                            className={`group h-10 rounded-md mb-1 cursor-pointer flex justify-between items-center px-3 transition-all duration-200
                                ${activeId === category.id
                                    ? 'bg-(--primary) text-black font-bold'
                                    : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                            onMouseEnter={() => handleMouseEnter(level, category.id)}
                            onClick={() => handleCategoryClick(category)}
                        >
                            <span className="truncate">{category.name}</span>
                            {category.children.length > 0 && (
                                <ChevronRightIcon className={`w-4 h-4 transition-transform ${activeId === category.id ? 'translate-x-1' : 'opacity-40'}`} />
                            )}
                        </div>
                    ))}
                </div>
                {nextChildren.length > 0 && renderCategoryColumn(level + 1, nextChildren)}
            </>
        );
    };

    return (
        <div
            className='absolute top-[100px] mt-1 lg:left-[10%] left-[3%] lg:w-[80%] w-[94%] bg-(--secondary) z-9999 flex rounded-xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200'
            onMouseLeave={() => setActivePath([])}
        >
            {loading ? (
                <div className="w-full h-40 flex items-center justify-center text-white/40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-(--primary) mr-3"></div>
                    Loading categories...
                </div>
            ) : categoryTree.length === 0 ? (
                <div className="w-full h-40 flex items-center justify-center text-white/40 italic">
                    No categories found
                </div>
            ) : (
                <div className="flex w-full h-[500px]">
                    {renderCategoryColumn(0, categoryTree)}

                    {/* Placeholder content for when no subcategories are hovered in later levels */}
                    {activePath.length === 0 && (
                        <div className="flex-grow flex flex-col items-center justify-center text-white/20 p-8 text-center bg-black/10">
                            <div className="mb-4 text-4xl">📁</div>
                            <p className="text-sm font-medium">Explore our vast collection of products</p>
                            <p className="text-xs">Hover over a category to see more details</p>
                        </div>
                    )}

                    {activePath.length > 0 && !categoryTree.find(c => c.id === activePath[0])?.children.length && (
                        <div className="flex-grow flex flex-col items-center justify-center text-white/20 p-8 text-center bg-black/10">
                            <p className="text-sm italic">No further subcategories</p>
                            <button
                                className="mt-4 text-(--primary) hover:underline text-sm font-bold"
                                onClick={() => {
                                    const cat = categoryTree.find(c => c.id === activePath[0]);
                                    if (cat) handleCategoryClick(cat);
                                }}
                            >
                                View all {categoryTree.find(c => c.id === activePath[0])?.name}
                            </button>
                        </div>
                    )}
                </div>
            )}

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