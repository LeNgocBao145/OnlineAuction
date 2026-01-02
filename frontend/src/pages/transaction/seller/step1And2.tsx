import { useState } from "react";
import { toast } from "sonner";
import transactionService, { type StepBoxProps } from "@/services/transactionService";

export default function Step1And2Box({ productId, transaction, onSuccess }: StepBoxProps) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    if (confirming) return;

    try {
      setConfirming(true);
      await transactionService.sellerConfirm(productId);
      toast.success("Delivery successfully");
      await onSuccess();
    } catch (e) {
      console.error("Confirm error:", e);
      toast.error("Confirm failed");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="border border-white/10 rounded-lg p-4 bg-(--third)">
      <h2 className="text-(--primary) text-xl font-bold mb-4">
        Step 1 & 2: Bidder sends payment and seller confirms
      </h2>

      <div className="grid lg:grid-cols-[1fr_2fr] grid-cols-1 gap-4">
        <img
          src={transaction?.delivery_invoice_image || ""}
          alt="Uploaded payment receipt"
          className="mt-4 w-full aspect-square rounded-md border border-white/10"
        />

        <div className="mt-4 flex flex-col gap-2">
          <p className="text-white/60">
            Shipping Address: <span className="text-white">{transaction?.delivery_address}</span>
          </p>
        </div>

        <p className="text-red-400 col-span-full">
          Warning: Please verify the payment details before confirming. This action cannot be undone.
        </p>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={confirming}
          className="bg-(--primary) text-black px-4 py-2 rounded-md col-span-full hover:bg-(--primary)/80 disabled:opacity-60"
        >
          {confirming ? "Confirming..." : "Confirm Payment Received"}
        </button>
      </div>
    </div>
  );
}