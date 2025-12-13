import { useState } from "react";

import { ArrowRightIcon } from "@heroicons/react/24/solid";
import AskQuestionModal from "./modal/askQuestion";

export default function ProductQuestions() {
    const [askingQuestion, setAskingQuestion] = useState(false);
    const [questions, setQuestions] = useState([
        {question: "Is this product still available?", answer: "Yes, it is available.", askedBy: "User123", askedAt: "2024-06-01 10:00", answeredAt: "2024-06-01 12:00"},
        {question: "What is the condition of the item?", answer: "It's brand new.", askedBy: "Buyer456", askedAt: "2024-06-02 09:30", answeredAt: "2024-06-02 10:00"},
        {question: "Can you provide more pictures?", answer: "Sure, I will upload more images soon.", askedBy: "Shopper789" , askedAt: "2024-06-03 14:15", answeredAt: "2024-06-03 15:00"},
    ]);

    return (
        <div className="flex flex-col justify-center items-center px-[10%] gap-4 mt-4 border border-white/10 rounded-xl bg-(--third) w-full p-4">
            {askingQuestion && <AskQuestionModal setAskingQuestion={setAskingQuestion} profileName="Amongus" profilePicture="/path/to/profile.jpg" />}

            <div className="w-full flex flex-row justify-between items-center">
                <h1 className="font-bold font-inter text-(--primary) text-3xl">Questions & Answers</h1>
                <button onClick={() => setAskingQuestion(true)} className="text-(--primary) underline">Ask a question?</button>
            </div>
            {questions.map((q, index) => (
                <div key={index} className="w-9/10 border-t border-white/10 pb-4 pt-4">
                    <div>
                        <p className="text-(--primary) font-bold text-2xl">{q.askedBy}<span className="text-white/30 text-sm ml-2">{q.askedAt}</span></p>
                        <p className="text-white/80 mt-2">{q.question}</p>
                    </div>
                    <div className="flex flex-row items-start mt-4 gap-4">
                        <ArrowRightIcon className="w-6 h-6 text-white/50 transform -translate-y-1/2 mt-4 z-0"/>
                        <div>
                            <p className="text-(--primary) font-bold text-2xl">Seller<span className="text-white/30 text-sm ml-2">{q.answeredAt}</span></p>
                            <p className="text-white/80">{q.answer}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}