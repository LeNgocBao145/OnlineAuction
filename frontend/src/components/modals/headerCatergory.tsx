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
        <div className='absolute top-[100px] mt-1 lg:left-1/6 left-3/100 lg:w-2/3 w-95/100 h-auto bg-(--secondary) z-9999 flex rounded-lg'>
            <div className="lg:w-5/20 w-7/20 p-4 border-r border-white/20">
                <h3 className="text-(--primary) font-bold mb-3">Categories</h3>
                {loading ? (
                    <div className="text-white/60">Loading...</div>
                ) : parentCategories.length === 0 ? (
                    <div className="text-white/60">No categories</div>
                ) : (
                    parentCategories.map((category) => (
                        <div 
                            key={category.id} 
                            className={`h-10 rounded-lg mb-1 cursor-pointer flex justify-between items-center px-3 transition-colors 
                                ${selectedParent === category.id ? 'bg-(--primary) text-black' : 'text-white/80'}`}
                            onMouseEnter={() => setSelectedParent(category.id)}
                            onClick={() => handleCategoryClick(category)}
                        >
                            {category.name}
                            <ChevronRightIcon className="w-4 h-4" />
                        </div>
                    ))
                )}
            </div>
            <div className="lg:w-15/20 w-13/20 p-4">
                {selectedParent && childCategories.length > 0 ? (
                    <>
                        <h3 className="text-(--primary) font-bold mb-3">
                            {parentCategories.find(c => c.id === selectedParent)?.name}
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                            {childCategories.map((category) => (
                                <div 
                                    key={category.id} 
                                    className='text-white/80 hover:text-(--black) hover:bg-(--primary) cursor-pointer py-2 px-2 rounded transition-colors'
                                    onClick={() => handleCategoryClick(category)}
                                >
                                    {category.name}
                                </div>
                            ))}
                        </div>
                    </>
                ) : selectedParent ? (
                    <div className="text-white/60">No subcategories</div>
                ) : (
                    <div className="text-white/60">Hover over a category to see subcategories</div>
                )}
            </div>
        </div>
    );
}