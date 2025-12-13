import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ChevronRightIcon } from "@heroicons/react/24/solid";

export default function HeaderCategory() {
    const [allCategories, setAllCategories] = useState(["Electronics", "Fashion", "Home & Garden", "Sports", "Toys"]);
    const [allSubCategories, setAllSubCategories] = useState<{ [key: string]: string[] }>({
        "Electronics": ["Mobile Phones", "Laptops", "Cameras"],
        "Fashion": ["Men's Clothing", "Women's Clothing", "Accessories"],
        "Home & Garden": ["Furniture", "Kitchen", "Garden Tools"],
        "Sports": ["Outdoor", "Indoor", "Fitness"],
        "Toys": ["Action Figures", "Puzzles", "Board Games"]
    });
    const [selectedCategory, setSelectedCategory] = useState<string | null>("Electronics");

    const navigate = useNavigate();

    return (
        <div className='absolute top-[100px] mt-1 left-1/6 w-2/3 h-auto bg-(--secondary) z-9999 flex rounded-lg'>
            <div className="w-5/20 p-4 border-r-4 border-white/60">
            {allCategories.map((category, index) => (
                <div key={index} 
                     className='text-white/80 hover:bg-(--primary) rounded-lg mb-2 cursor-pointer flex justify-between items-center px-2'
                     onMouseEnter={() => setSelectedCategory(category)}
                >
                    {category}
                    <ChevronRightIcon className="w-4 h-4 inline-block ml-2" />
                </div>
            ))}
            </div>
            <div className="w-15/20 p-4">
            {selectedCategory && allSubCategories[selectedCategory] && (
                <div>
                    <h3 className="text-(--primary) font-bold mb-4">{selectedCategory} Subcategories</h3>
                    <ul>
                        {allSubCategories[selectedCategory].map((subCategory, index) => (
                            <li key={index} className='text-white/80 hover:text-(--primary) mb-2 cursor-pointer' onClick={() => navigate(`/category/${selectedCategory}/${subCategory}`)}>
                                {subCategory}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            </div>
        </div>
    );
};