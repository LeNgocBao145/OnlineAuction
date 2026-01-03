import React, {useState} from "react";
import { toast } from "sonner";
import useProductStore from "@/stores/productStore";
import useAuthStore from "@/stores/authStore";
import { getAvatarUrl } from "@/utils/avatarUtils";

export default function AskQuestionModal(
    {setAskingQuestion, productId, profileName, profilePicture}: {
        setAskingQuestion: React.Dispatch<React.SetStateAction<boolean>>, 
        productId: string | number,
        profileName: string, 
        profilePicture: string
    }
) {
    const [question, setQuestion] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { askQuestion } = useProductStore();
    const { user } = useAuthStore();

    const handleSubmit = async () => {
        if (!user?.id) {
            toast.error("You must be logged in to ask a question");
            return;
        }

        if (!question.trim()) {
            toast.error("Please enter a question");
            return;
        }

        try {
            setIsSubmitting(true);
            await askQuestion(productId, question);
            toast.success("Question asked successfully!");
            setAskingQuestion(false);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to ask question");
        } finally {
            setIsSubmitting(false);
        }
    }

    const avatarUrl = getAvatarUrl(profilePicture, profileName);

    return (
        <div className="backdrop-filter backdrop-blur-sm fixed inset-0 flex justify-center items-center z-99999">
            <div className="bg-(--third) border border-white/10 rounded-lg lg:w-1/2 w-full h-1/2 p-4">
                <div className="flex justify-end items-center">
                    <button className="bg-(--primary) text-black rounded-md p-2" onClick={() => setAskingQuestion(false)}>Close</button>
                </div>
                <div className="flex justify-start items-center gap-4 w-full p-8">
                    <img src={avatarUrl} alt={`${profileName}'s profile`} className="w-24 h-24 border-2 border-(--primary) rounded-full"/>
                    <p className="text-(--primary) font-bold text-2xl wrap-break-word">{profileName.length > 20 ? profileName.slice(0, 20) + "..." : profileName}</p>
                </div>
                <textarea placeholder="Type your question here..." maxLength={300} onChange={(e) => {setQuestion(e.target.value)}} className="resize-none p-2 rounded-lg w-full h-1/3 border border-(--primary) text-white"/>
                <div className="flex justify-between items-center mt-4 px-2">
                    <p className="text-white/60 text-sm">{question.length} / 300</p>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="bg-(--primary) text-black font-bold rounded-md p-2 disabled:opacity-50">
                        {isSubmitting ? "Submitting..." : "Submit Question"}
                    </button>
                </div>
            </div>
        </div>
    );
}