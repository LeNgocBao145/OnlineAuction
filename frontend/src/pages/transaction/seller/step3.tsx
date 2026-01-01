import { FaSpinner } from "react-icons/fa";
import { type StepBoxProps } from "@/services/transactionService";

export default function Step3Box({ productId, transaction, onSuccess }: StepBoxProps) {
    return (
        <div className="relative border border-white/10 rounded-lg p-4 bg-(--third)">
            <h2 className="text-(--primary) text-xl font-bold mb-4">Step 3: Buyer Confirm Product Delivery</h2>
            <FaSpinner className="absolute top-14 left-2 animate-spin text-(--primary) mb-4" size={32} />
            <p className="text-white ml-8">Awaiting confirmation from the buyer...</p>
        </div>
    );
}
            