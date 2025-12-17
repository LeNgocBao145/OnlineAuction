import React, {useState} from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useProductStore from "@/stores/productStore";
import useAuthStore from "@/stores/authStore";

export default function PlaceBidModal(
    {setPlacingBid, productId, currentBid, stepPrice} : {
        setPlacingBid: React.Dispatch<React.SetStateAction<boolean>>, 
        productId: string | number,
        currentBid: number, 
        stepPrice: number
    }
) {
    const [bid, setBid] = useState<number>(0);
    const [useCustom, setUseCustom] = useState<boolean>(false);
    const [customBid, setCustomBid] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { placeBid } = useProductStore();
    const { user } = useAuthStore();

    const bidSchema = z.object({
        accept: z.boolean().refine((val) => val === true, { message: "You must accept the terms to place a bid" })
    });

    const {register, handleSubmit, formState: { errors }} = useForm({
        resolver: zodResolver(bidSchema)
    });

    const handleBid = async () => {
        if (!user?.id) {
            toast.error("You must be logged in to place a bid");
            return;
        }

        const bidAmount = useCustom ? customBid : bid;
        const finalBidPrice = currentBid + bidAmount;

        if (finalBidPrice <= currentBid) {
            toast.error("Bid amount must be greater than current bid");
            return;
        }

        try {
            setIsSubmitting(true);
            console.log("Bid amount:", finalBidPrice);
            await placeBid(productId, user.id, finalBidPrice);
            toast.success("Bid placed successfully!");
            setPlacingBid(false);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to place bid");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="absolute bg-(--third) border border-white/10 rounded-lg w-96/100 p-4 top-120 left-2/100">
            <form onSubmit={handleSubmit(handleBid)}>
                <div className="flex justify-between items-center">
                    <h2 className="text-white text-2xl font-bold">Quick Bid</h2>
                    <p className="text-white/60">Step Price: ${stepPrice}</p>
                </div>
                <div className="flex gap-4 mt-4 justify-around items-center">
                    <div className="flex flex-col">
                        <button className="bg-(--primary) text-black font-bold p-2 rounded-md"
                            onClick={() => setBid(bid + stepPrice)}
                            type="button"
                        >
                            +1 step
                        </button>
                        <p className="text-white/60">Value: ${currentBid + bid + stepPrice}</p>
                    </div>
                    <div className="flex flex-col"> 
                        <button className="bg-(--primary) text-black font-bold p-2 rounded-md"
                            onClick={() => setBid(bid + stepPrice * 5)}
                            type="button"
                        >
                            +5 step
                        </button>
                        <p className="text-white/60">Value: ${currentBid + bid + stepPrice * 5}</p>
                    </div>
                    <div className="flex flex-col">
                        <button className="bg-(--primary) text-black font-bold p-2 rounded-md"
                            onClick={() => setBid(bid + stepPrice * 10)}
                            type="button"
                        >
                            +10 step
                        </button>
                        <p className="text-white/60">Value: ${currentBid + bid + stepPrice * 10}</p>
                    </div>
                    <div className="flex flex-col">
                        <button className="bg-(--primary) text-black font-bold p-2 rounded-md"
                            onClick={() => setBid(0)}
                            type="button"
                        >
                            Clear
                        </button>
                        <p className="text-white/60">Value: -${bid}</p>
                    </div>
                </div>
                <div className="mt-4 flex gap-4 w-full justify-between items-center">
                    <div className="flex flex-col justify-center mt-4 w-2/3">
                        <label htmlFor="custom" className="text-white font-bold text-2xl">Custom amount</label>
                        <input type="number" id="custom" min={0} onChange={(e) => setCustomBid(Number(e.target.value))}
                        className="w-full mt-2 p-2 rounded-md bg-(--secondary) border border-white/10 text-white"/>
                    </div>
                    <div className="flex items-center justify-center gap-2 w-1/3">
                        <input type="checkbox" id="choose" className="mt-4" onChange={(e) => setUseCustom(e.target.checked)}/>
                        <label htmlFor="choose" className="mt-4 text-(--primary)">Use custom?</label>
                    </div>
                </div>
                <div className="mt-4 flex gap-4 w-full justify-around items-center">
                <p className="text-white">You added: ${useCustom ? customBid : bid}</p>
                <p className="text-(--primary) font-bold">Your bid is: ${currentBid + (useCustom ? customBid : bid)}</p>
                </div>
                <div className=" flex items-center justify-center gap-2">
                    <input type="checkbox" id="terms" className="mt-4" {...register("accept")}/>
                    <label htmlFor="terms" className="mt-4 text-red-400">I am aware that I can not retract my bid once placed.</label>
                </div>
                {errors.accept && <p className="text-red-400 text-center mt-4">{errors.accept.message}</p>}
                {useCustom === true ? 
                    (customBid === 0) && <p className="text-red-400 text-center mt-4">You must enter a bid amount.</p>
                    : (bid === 0) && <p className="text-red-400 text-center mt-4">You must enter a bid amount.</p>}
                <button type="submit" disabled={isSubmitting} className="bg-(--primary) text-black font-bold p-2 mt-8 rounded-md w-full disabled:opacity-50">
                    {isSubmitting ? "Placing bid..." : "Confirm"}
                </button>
            </form>
        </div>
    );
}    