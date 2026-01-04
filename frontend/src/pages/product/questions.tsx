import { useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import AskQuestionModal from "./modal/askQuestion";
import useProductStore from "@/stores/productStore";
import useAuthStore from "@/stores/authStore";
import { getAvatarUrl } from "@/utils/avatarUtils";
import { formatDate } from "@/utils/dateUtils";
import { maskName } from "@/utils/maskUtils";
import { FaPlus } from "react-icons/fa";
import { toast } from "sonner";

export default function ProductQuestions() {
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [answeringQuestion, setAnsweringQuestion] = useState(false);
  const [replyingQuestionId, setReplyingQuestionId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { product, answerQuestion } = useProductStore();
  const { user } = useAuthStore();
  const questions = product?.qa || [];
  const userAvatar = getAvatarUrl(user?.avatar || null, user?.name || "You");

  const handleSubmitAnswer = async (questionId: number | string) => {
    if (!replyText.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    try {
      setIsSubmitting(true);
      await answerQuestion(product?.id || "", questionId, replyText);
      toast.success("Reply submitted successfully!");
      setReplyingQuestionId(null);
      setReplyText("");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to submit reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center gap-4 mt-4 border border-white/10 rounded-xl bg-(--third) w-full p-6">
      {askingQuestion && (
        <AskQuestionModal
          setAskingQuestion={setAskingQuestion}
          productId={product?.id || ""}
          profileName={user?.name || "You"}
          profilePicture={userAvatar}
        />
      )}

      {answeringQuestion && (
        <AnswerQuestionModal
          setAnsweringQuestion={setAnsweringQuestion}
          productId={product?.id || ""}
          askerName={"Questioner"}
          question={"Sample question"}
          profileName={user?.name || "You"}
          profilePicture={userAvatar}
        />
      )}

      <div className="w-full flex flex-row justify-between items-center">
        <h1 className="font-bold font-inter text-(--primary) text-3xl">
          Questions & Answers
        </h1>
        {user?.id !== product?.seller_id && (
          <button
            onClick={() => setAskingQuestion(true)}
            className="text-(--primary) underline"
          >
            Ask a question?
          </button>
        )}
      </div>

      {questions.length === 0 ? (
        <p className="text-white/60 w-full">No Q&A yet.</p>
      ) : (
        questions.map((q, index) => (
          <div
            key={index}
            className="w-9/10 border-t border-white/10 pb-4 pt-4"
          >
            <div>
              <div className="flex flex-row justify-between items-start">
                <div className="flex-1">
                  <p className="text-(--primary) font-bold text-lg">
                    {maskName(q.questioner_name)}
                    <span className="text-white/30 text-sm ml-2">
                      {formatDate(q.asked_at)}
                    </span>
                  </p>
                  <p className="text-white/80 mt-1 text-sm">{q.question}</p>
                </div>
                {user?.id === product?.seller_id && !q.answer && (
                  <button
                    onClick={() => setReplyingQuestionId(replyingQuestionId === q.id ? null : q.id)}
                    className="text-black flex items-center gap-2 font-bold px-3 py-1 rounded-lg whitespace-nowrap cursor-pointer border border-(--primary) bg-(--primary) hover:opacity-90 ml-4"
                  >
                    <FaPlus className="text-sm" />
                    Reply
                  </button>
                )}
              </div>
            </div>
            {q.answer && (
              <div className="flex flex-row items-start mt-4 gap-4">
                <ArrowRightIcon className="w-6 h-6 text-white/50 transform -translate-y-1/2 mt-4 z-0" />
                <div className="flex-1">
                  <p className="text-(--primary) font-bold text-lg">
                    {q.answerer_name ? q.answerer_name : "Seller"}
                    <span className="text-white/30 text-sm ml-2">
                      {q.answered_at ? formatDate(q.answered_at) : "-"}
                    </span>
                  </p>
                  <p className="text-white/80 text-sm">{q.answer}</p>
                </div>
              </div>
            )}

            {replyingQuestionId === q.id && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply here..."
                  className="w-full bg-(--secondary) text-white/80 rounded-lg p-3 border border-white/10 focus:border-(--primary) outline-none resize-none"
                  rows={4}
                />
                <div className="flex gap-2 mt-3 justify-end">
                  <button
                    onClick={() => setReplyingQuestionId(null)}
                    className="px-4 py-2 rounded-lg border border-white/20 text-white/60 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSubmitAnswer(q.id)}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-lg bg-(--primary) text-black font-bold hover:opacity-90 disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Reply"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
