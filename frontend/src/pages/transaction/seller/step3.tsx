import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";
import transactionService, { type StepBoxProps } from "@/services/transactionService";

export default function Step3Box({ productId, transaction, onSuccess }: StepBoxProps) {
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
      {/* ===== WAITING BOX ===== */}
      <div className="border border-white/10 rounded-lg p-4 bg-(--third)">
        <div className="flex items-center gap-2">
            <FaSpinner
            className="animate-spin text-(--primary)"
            size={20}
            />
            <p className="text-white">
            Awaiting confirmation from the buyer...
            </p>
        </div>
      </div>


      {/* ===== CANCEL BOX ===== */}
      <div className="mt-4 border border-white/10 rounded-lg p-4 bg-(--third)">
        <h2 className="text-(--primary) text-lg font-bold">
          Cancel Transaction
        </h2>

        <p className="text-white/60 mt-1">
          If the buyer does not respond or any issue occurs, you may cancel this
          transaction after confirmation with the counterparty.
        </p>

        <button
          type="button"
          onClick={handleCancel}
          disabled={confirming}
          className={[
            "mt-3 px-4 py-2 rounded-md font-bold text-white transition",
            confirming
              ? "bg-red-500/40 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600",
          ].join(" ")}
        >
          {confirming ? "Cancelling..." : "Cancel Transaction"}
        </button>
      </div>
    </>
  );
}
