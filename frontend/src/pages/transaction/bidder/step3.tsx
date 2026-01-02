

export default function Step3Box() {
    return (
        <div className="border border-white/10 rounded-lg p-4 bg-(--third)">
            <h2 className="text-(--primary) text-xl font-bold mb-4">Step 3: Confirm Product Delivery</h2>
            <p className="text-white">This action <span className="font-bold text-red-500">can not</span> be undone. Please confirm that you have received the product.</p>
            <button className="mt-4 bg-green-400 text-white font-bold py-2 px-4 rounded-md">
                Confirm Delivery
            </button>
        </div>
    );
}
            