import { useState } from "react";

export default function ProductDescription() {
    const [productDescription, setProductDescription] = useState<string>("write something really long here to test the description box. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");

    return (
        <div className="flex flex-col justify-around items-start w-full border border-white/10 rounded-xl bg-(--third) p-4">
            <h1 className="text-(--primary) text-3xl font-bold">Product Description</h1>
            <p className="text-white">{productDescription}</p>
        </div>
    );
}