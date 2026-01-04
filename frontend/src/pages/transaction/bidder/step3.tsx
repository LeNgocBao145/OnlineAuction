import { useState } from "react";
import transactionService, { type StepBoxProps } from "@/services/transactionService";
import { toast } from "sonner";

export default function Step3Box({ productId, transaction, onSuccess }: StepBoxProps) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirmDelivery = async () => {
    if (confirming) return;

    try {
      setConfirming(true);
      await transactionService.bidderConfirm(productId);

      toast.success("Đã xác nhận nhận hàng thành công");
        await onSuccess();
    } catch (e) {
      console.error("Confirm delivery error:", e);
      toast.error("Xác nhận nhận hàng thất bại");
    } finally {
      setConfirming(false);
    }
  };

  // Optional: nếu bạn muốn chặn UI khi chưa có transaction
  if (!transaction) {
    return (
      <div className="border border-white/10 rounded-lg p-4 bg-(--third)">
        <p className="text-white/70">Loading transaction...</p>
      </div>
    );
  }

  return (
    <div className="border border-white/10 rounded-lg p-4 bg-(--third)">
      <button
        type="button"
        onClick={handleConfirmDelivery}
        disabled={confirming}
        className="mt-4 bg-green-400 text-white font-bold py-2 px-4 rounded-md disabled:opacity-60"
      >
        {confirming ? "Confirming..." : "Confirm Delivery"}
      </button>

      <p className="text-white/60 mt-4">
        Please confirm that you have successfully received the product.
      </p>
    </div>
  );
}
