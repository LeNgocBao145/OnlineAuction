import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useProductStore from "@/stores/productStore";
import useAuthStore from "@/stores/authStore";
import { formatCurrency } from "@/utils/numberUtils";

export default function PlaceBidModal(
    { setPlacingBid, productId, currentBid, stepPrice }: {
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
    const [maxPrice, setMaxPrice] = useState<number>(0);
    const [bidMode, setBidMode] = useState<'manual' | 'auto'>('manual');

    const { placeBid } = useProductStore();
    const { user } = useAuthStore();

    const bidSchema = z.object({
        accept: z.boolean().refine((val) => val === true, { message: "You must accept the terms to place a bid" })
    });

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(bidSchema)
    });

    const handleBid = async () => {

        if (!user?.id) {
            toast.error("You must be logged in to place a bid");
            return;
        }

        const minNextPrice = currentBid + stepPrice;

        const bidAmount = useCustom ? customBid : bid;
        const finalBidPrice = currentBid + bidAmount;

        if (bidMode === 'manual') {
            if (finalBidPrice < minNextPrice) {
                toast.error(`Bid amount must be at least ${formatCurrency(minNextPrice)}`);
                return;
            }
        }

        if (bidMode === 'auto') {
            if (!maxPrice || maxPrice < minNextPrice) {
                toast.error(`Max price must be at least ${formatCurrency(minNextPrice)}`);
                return;
            }
        }

        try {
            setIsSubmitting(true);
            const result = await placeBid(
                productId,
                bidMode === 'manual'
                    ? { bidAmount: finalBidPrice }
                    : { maxPrice }
            );

            if (result && 'isWinning' in result) {
                if (result.isWinning) {
                    toast.success(result.message || "Bid placed successfully! You are currently winning.");
                } else {
                    toast.warning(result.message || "Bid placed, but you were outbid.");
                }
            } else {
                toast.success("Bid placed successfully!");
            }
            setPlacingBid(false);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to place bid");
        } finally {
            setIsSubmitting(false);
        }
    }

    const finalBidPrice = currentBid + (useCustom ? customBid : bid);

    return (
        <div className="bg-(--third) border border-white/10 rounded-2xl w-full max-w-xl p-8 shadow-24 relative">
            <form onSubmit={handleSubmit(handleBid)}>
                <div className="flex justify-between items-center">
                    <h2 className="text-white text-2xl font-bold">Place Bid</h2>
                    <p className="text-white/60">Step Price: {formatCurrency(stepPrice)}</p>
                </div>

                <div className="mt-4 flex gap-6 items-center">
                    <label className="flex items-center gap-2 text-white/80">
                        <input
                            type="radio"
                            name="bidMode"
                            checked={bidMode === 'manual'}
                            onChange={() => {
                                setBidMode('manual');
                            }}
                        />
                        Manual bid
                    </label>
                    <label className="flex items-center gap-2 text-white/80">
                        <input
                            type="radio"
                            name="bidMode"
                            checked={bidMode === 'auto'}
                            onChange={() => {
                                setBidMode('auto');
                                setBid(0);
                                setCustomBid(0);
                                setUseCustom(false);
                            }}
                        />
                        Auto-bid
                    </label>
                </div>

                {bidMode === 'manual' && (
                    <>
                        <div className="flex gap-4 mt-4 justify-around items-center">
                            <div className="flex flex-col">
                                <button className="bg-(--primary) text-black font-bold p-2 rounded-md"
                                    onClick={() => setBid(bid + stepPrice)}
                                    type="button"
                                >
                                    +1 step
                                </button>
                                <p className="text-white/60 text-sm text-center">{formatCurrency(currentBid + bid + stepPrice)}</p>
                            </div>
                            <div className="flex flex-col">
                                <button className="bg-(--primary) text-black font-bold p-2 rounded-md"
                                    onClick={() => setBid(bid + stepPrice * 5)}
                                    type="button"
                                >
                                    +5 step
                                </button>
                                <p className="text-white/60 text-sm text-center">{formatCurrency(currentBid + bid + stepPrice * 5)}</p>
                            </div>
                            <div className="flex flex-col">
                                <button className="bg-(--primary) text-black font-bold p-2 rounded-md"
                                    onClick={() => setBid(bid + stepPrice * 10)}
                                    type="button"
                                >
                                    +10 step
                                </button>
                                <p className="text-white/60 text-sm text-center">{formatCurrency(currentBid + bid + stepPrice * 10)}</p>
                            </div>
                            <div className="flex flex-col">
                                <button className="bg-(--primary) text-black font-bold p-2 rounded-md"
                                    onClick={() => setBid(0)}
                                    type="button"
                                >
                                    Clear
                                </button>
                                <p className="text-white/60 text-sm text-center">-{formatCurrency(bid)}</p>
                            </div>
                        </div>
                        <div className="mt-4 flex gap-4 w-full justify-between items-center">
                            <div className="flex flex-col justify-center mt-4 w-2/3">
                                <label htmlFor="custom" className="text-white font-bold text-xl">Custom amount</label>
                                <input type="number" id="custom" min={0} onChange={(e) => setCustomBid(Number(e.target.value))}
                                    className="w-full mt-2 p-2 rounded-md bg-(--secondary) border border-white/10 text-white" />
                            </div>
                            <div className="flex items-center justify-center gap-2 w-1/3">
                                <input type="checkbox" id="choose" className="mt-4" onChange={(e) => setUseCustom(e.target.checked)} />
                                <label htmlFor="choose" className="mt-4 text-(--primary)">Use custom?</label>
                            </div>
                        </div>
                    </>
                )}

                {/* Auto-bid section */}
                {bidMode === 'auto' && (
                    <div className="mt-6 p-4 border border-white/10 rounded-lg bg-(--secondary)">
                        <div className="mt-2">
                            <label htmlFor="maxPrice" className="text-white/80 text-sm">
                                Maximum price you're willing to pay:
                            </label>
                            <input
                                type="number"
                                id="maxPrice"
                                min={currentBid + stepPrice}
                                value={maxPrice || ''}
                                onChange={(e) => setMaxPrice(Number(e.target.value))}
                                placeholder={`Min: ${formatCurrency(currentBid + stepPrice)}`}
                                className="w-full mt-2 p-2 rounded-md bg-(--third) border border-white/10 text-white"
                            />
                            <p className="text-white/60 text-xs mt-2">
                                * Auto-bid will automatically bid the minimum amount needed to win, up to your max price.
                            </p>
                            <p className="text-white/60 text-xs">
                                * If another bidder has a higher max price, bidder with earlier max bid wins on tie.
                            </p>
                        </div>
                    </div>
                )}

                <div className="mt-4 flex gap-4 w-full justify-around items-center">
                    {bidMode === 'manual' && (
                        <>
                            <p className="text-white">You added: {formatCurrency(useCustom ? customBid : bid)}</p>
                            <p className="text-(--primary) font-bold">Your bid: {formatCurrency(finalBidPrice)}</p>
                        </>
                    )}
                    {bidMode === 'auto' && maxPrice > 0 && (
                        <p className="text-green-400 font-bold">Max: {formatCurrency(maxPrice)}</p>
                    )}
                </div>

                <div className="flex items-center justify-center gap-2">
                    <input type="checkbox" id="terms" className="mt-4" {...register("accept")} />
                    <label htmlFor="terms" className="mt-4 text-red-400">I am aware that I can not retract my bid once placed.</label>
                </div>
                {errors.accept && <p className="text-red-400 text-center mt-4">{errors.accept.message}</p>}
                {bidMode === 'manual' && (
                    useCustom === true
                        ? (customBid === 0) && <p className="text-red-400 text-center mt-4">You must enter a bid amount.</p>
                        : (bid === 0) && <p className="text-red-400 text-center mt-4">You must enter a bid amount.</p>
                )}
                <button type="submit" disabled={isSubmitting} className="bg-(--primary) text-black font-bold p-2 mt-6 rounded-md w-full disabled:opacity-50">
                    {isSubmitting ? "Placing bid..." : bidMode === 'auto' ? "Place Auto-Bid" : "Confirm Bid"}
                </button>
            </form>
        </div>
    );
}