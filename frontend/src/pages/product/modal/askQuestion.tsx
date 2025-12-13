import React, {useState} from "react";

export default function AskQuestionModal(
    {setAskingQuestion, profileName, profilePicture}: {setAskingQuestion: React.Dispatch<React.SetStateAction<boolean>>, profileName: string, profilePicture: string}
) {
    const [question, setQuestion] = useState("");

    const handleSubmit = () => {
        console.log("Question submitted:", question);
        setAskingQuestion(false);
    }

    return (
        <div className="backdrop-filter backdrop-blur-sm fixed inset-0 flex justify-center items-center z-99999">
            <div className="bg-(--third) border border-white/10 rounded-lg w-1/2 h-1/2 p-4">
                <div className="flex justify-end items-center">
                    <button className="bg-(--primary) text-black rounded-md p-2" onClick={() => setAskingQuestion(false)}>Close</button>
                </div>
                <div className="flex justify-start items-center gap-4 w-full p-8">
                    <img src={profilePicture} alt={`${profileName}'s profile`} className="w-24 h-24 border-2 border-(--primary) rounded-full"/>
                    <p className="text-(--primary) font-bold text-2xl">{profileName}</p>
                </div>
                <textarea placeholder="Type your question here..." maxLength={300} onChange={(e) => {setQuestion(e.target.value)}} className="resize-none p-2 rounded-lg w-full h-1/3 border border-(--primary) text-white"/>
                <div className="flex justify-between items-center mt-4 px-2">
                    <p className="text-white/60 text-sm">{question.length} / 300</p>
                    <button onClick={handleSubmit} className="bg-(--primary) text-black font-bold rounded-md p-2">Submit Question</button>
                </div>
            </div>
        </div>
    );
}