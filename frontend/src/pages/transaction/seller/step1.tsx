import { useState } from "react";
import transactionService, { type StepBoxProps } from "@/services/transactionService";
import { toast } from "sonner";

export default function Step1({ productId, transaction, onSuccess }: StepBoxProps) {
  const [confirming, setConfirming] = useState(false);

  const handleCancel = async () => {
    if (confirming) return;

    try {
      setConfirming(true);
      await transactionService.cancel(productId);
      toast.success("Cancel successfully");
      await onSuccess?.();
    } catch (e) {
      console.error("Cancel error:", e);
      toast.error("Cancel failed");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <>
      {/* ===== STEP 1 BOX ===== */}
      <div className="border border-white/10 rounded-lg p-4 bg-(--third)">
        <div className="grid lg:grid-cols-[1fr_2fr] grid-cols-1 gap-4">
          <div className="mt-4 w-full h-[300px] rounded-md border border-white/10 flex items-center justify-center text-white/40">
            No invoice image
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <p className="text-white/60">
              Bidder: <span className="text-white">-</span>
            </p>
            <p className="text-white/60">
              Shipping Address: <span className="text-white">-</span>
            </p>
          </div>

          <p className="text-red-500 col-span-full">
            <strong>Warning:</strong>{" "}
            <span className="text-white/60">
              Please verify the payment details before confirming, this action cannot be undone.
            </span>
          </p>

          <button
            type="button"
            disabled
            className="bg-(--primary) text-black px-4 py-2 rounded-md col-span-full disabled:opacity-60"
          >
            Confirm
          </button>
        </div>
      </div>

      {/* ===== CANCEL BOX (RIÊNG, GIỮ MÀU CŨ) ===== */}
      <div className="mt-6 border border-white/10 p-4 rounded-lg bg-(--third)">
        <h2 className="text-(--primary) text-xl font-bold">
          Cancel Transaction
        </h2>

        <p className="text-white/60 mt-1">
          If you encounter any issues with the transaction, you can choose to cancel it.
          Please confirm your reason with the seller.
        </p>

        <button
          type="button"
          onClick={handleCancel}
          disabled={confirming}
          className={[
            "mt-3 font-bold py-2 px-4 rounded-md text-white transition",
            confirming
              ? "bg-red-500/50 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600",
          ].join(" ")}
        >
          {confirming ? "Cancelling..." : "Cancel Transaction"}
        </button>
      </div>
    </>
  );
}

  