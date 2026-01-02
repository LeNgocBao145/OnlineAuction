import { useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import AskQuestionModal from "./modal/askQuestion";
import useProductStore from "@/stores/productStore";
import useAuthStore from "@/stores/authStore";
import { getAvatarUrl } from "@/utils/avatarUtils";
import { formatDate } from "@/utils/dateUtils";
import AnswerQuestionModal from "./modal/answeringQuestion";

export default function ProductQuestions() {
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [answeringQuestion, setAnsweringQuestion] = useState(false);
  const {product} = useProductStore();
  const { user } = useAuthStore();
  const questions = product?.qa || [];
  const userAvatar = getAvatarUrl(user?.avatar || null, user?.name || "You");

  return (
    <div className="flex flex-col justify-center items-center px-[10%] gap-4 mt-4 border border-white/10 rounded-xl bg-(--third) w-full p-4">
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
        <button
          onClick={() => setAskingQuestion(true)}
          className="text-(--primary) underline"
        >
          Ask a question?
        </button>
        {user.relation === "seller" && (
          <button
            onClick={() => setAnsweringQuestion(true)}
            className="text-(--primary) underline"
          >
            Answer questions
          </button>
        )}
      </div>

      {questions.length === 0 ? (
        <p className="text-white/60 w-full">No Q&A yet.</p>
      ) : (
        questions.map((q, index) => (
          <div key={index} className="w-9/10 border-t border-white/10 pb-4 pt-4">
            <div>
              <p className="text-(--primary) font-bold text-2xl">
                {q.questioner_name}
                <span className="text-white/30 text-sm ml-2">
                  {formatDate(q.asked_at)}
                </span>
              </p>
              <p className="text-white/80 mt-2">{q.question}</p>
            </div>
            {q.answer && (
            <div className="flex flex-row items-start mt-4 gap-4">
              <ArrowRightIcon className="w-6 h-6 text-white/50 transform -translate-y-1/2 mt-4 z-0" />
              <div>
                <p className="text-(--primary) font-bold text-2xl">
                  {q.answerer_name || "Seller"}
                  <span className="text-white/30 text-sm ml-2">
                    {formatDate(q.answered_at) || "-"}
                  </span>
                </p>
                <p className="text-white/80">{q.answer}</p>
              </div>
            </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}