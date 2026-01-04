import { FaStar } from "react-icons/fa";
import { type StepBoxProps } from "@/services/transactionService";
import { useMemo, useState } from "react";
import { formatTimeLeft } from "@/utils/timeUtils";
import transactionService from "@/services/transactionService";
import { toast } from "sonner";
import { generateAvatarFromName } from "@/utils/avatarUtils";
import { formatCurrency } from "@/utils/numberUtils";

export default function Step4Box({ productId, transaction, onSuccess }: StepBoxProps) {
  const reviewTextCountLimit = 500;

  const [reviewText, setReviewText] = useState("");
  const [liked, setLiked] = useState<boolean | null>(null);

  // submit review
  const [isSubmitting, setIsSubmitting] = useState(false);

  // cancel (giữ lại)
  const [confirming, setConfirming] = useState(false);

  const canSubmit = useMemo(() => {
    return liked !== null && !isSubmitting;
  }, [liked, isSubmitting]);

  const handleSubmitReview = async () => {
    if (liked === null) {
      toast.error("Bạn hãy chọn Positive hoặc Negative trước.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        liked,
        comment: reviewText,
      };
      await transactionService.submitReview(Number(productId), payload);
      toast.success("Gửi đánh giá thành công!");
      await onSuccess?.();
    } catch (err) {
      console.error(err);
      toast.error("Gửi đánh giá thất bại. Thử lại nhé.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <div>
      <h2 className="text-(--primary) text-2xl font-bold">Final rating</h2>
      <p className="text-white/60">
        Evaluate how satisfied you are with the transaction and the product received.
      </p>

      <div className="mt-4 grid lg:grid-cols-[1fr_3fr_2fr_2fr] items-center grid-cols-2 gap-4 border border-white/10 p-4 rounded-lg bg-(--third)">
        <img
          // giữ safe để không bị "" như lỗi trước (nếu bạn chưa có url pfp thì để undefined)
          src={generateAvatarFromName(transaction?.bidder_name) ?? ""}
          className="border-(--primary) border h-30 w-30 rounded-full flex justify-center items-center text-white"
          alt="buyer-pfp"
        />
        <div>
          <p className="text-white text-2xl font-bold">{transaction?.bidder_name}</p>
          <p className="text-white/60">Winner</p>
        </div>
        <div>
          <p className="text-(--primary) text-2xl font-bold">{formatCurrency(transaction?.current_price)}</p>
          <p className="text-white/60">Winning bid</p>
        </div>
        <div>
          <p className="text-white text-2xl font-bold">
            {formatTimeLeft(transaction?.expired_at || 0)}
          </p>
          <p className="text-white/60">Ended on</p>
        </div>
      </div>

      <div className="mt-6 border border-white/10 p-4 rounded-lg bg-(--third)">
        <h2 className="text-(--primary) text-xl font-bold mb-4">Your Rating</h2>

        <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
          <button
            type="button"
            onClick={() => setLiked(true)}
            className={[
              "border border-green-500 text-green-500 font-bold h-20 py-2 px-4 rounded-md",
              liked === true ? "bg-green-500/60" : "bg-green-500/30 hover:bg-green-500/50",
            ].join(" ")}
          >
            +1 Positive
            <FaStar className="inline-block ml-2 text-green-500" />
          </button>

          <button
            type="button"
            onClick={() => setLiked(false)}
            className={[
              "border border-red-500 text-red-500 font-bold h-20 py-2 px-4 rounded-md",
              liked === false ? "bg-red-500/60" : "bg-red-500/30 hover:bg-red-500/50",
            ].join(" ")}
          >
            -1 Negative
            <FaStar className="inline-block ml-2 text-red-500" />
          </button>
        </div>
      </div>

      <div className="relative mt-6 border border-white/10 p-4 rounded-lg bg-(--third)">
        <h2 className="text-(--primary) text-xl font-bold mb-4">Your Review</h2>

        <textarea
          className="relative w-full p-2 border resize-none border-white/10 rounded-lg bg-(--secondary) text-white"
          rows={5}
          placeholder="Write your review here..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          maxLength={reviewTextCountLimit}
        />

        <p className="text-white/60 absolute right-6 bottom-6">
          {reviewText.length}/{reviewTextCountLimit}
        </p>
      </div>

      {/* giữ cancel */}
      <div className="mt-6 border border-white/10 p-4 rounded-lg bg-(--third)">
        <h2 className="text-(--primary) text-xl font-bold">Cancel Transaction</h2>
        <p className="text-white/60">
          If you encounter any issues with the transaction, you can choose to cancel it. Confirm
          your reason with the seller.
        </p>
        <button
          type="button"
          onClick={handleCancel}
          disabled={confirming}
          className={[
            "text-white font-bold py-2 px-4 rounded-md mt-2",
            confirming ? "bg-red-500/50 cursor-not-allowed" : "bg-red-500",
          ].join(" ")}
        >
          {confirming ? "Cancelling..." : "Cancel Transaction"}
        </button>
      </div>

      <div>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmitReview}
          className={[
            "w-full text-black font-bold py-2 px-4 rounded-md mt-4",
            canSubmit ? "bg-(--primary)" : "bg-white/20 cursor-not-allowed",
          ].join(" ")}
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </div>
  );
}