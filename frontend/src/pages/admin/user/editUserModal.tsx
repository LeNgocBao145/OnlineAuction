export default function EditUserModal({
    setEditingUser, username, email, dob
} : {
    setEditingUser: React.Dispatch<React.SetStateAction<boolean>>,
    username: string,
    email: string,
    dob: string
}) {
    return (
        <div className="backdrop-filter backdrop-blur-sm fixed inset-0 flex justify-center items-center z-99999">
            <div className="bg-(--third) border border-white/10 rounded-lg lg:w-1/2 w-9/10 p-4">
                <div className="flex flex-col justify-start items-center gap-4 w-full p-8">
                    <h2 className="text-(--primary) font-bold text-2xl text-center">Edit User Information</h2>
                    <p className="text-white/60 text-center">Update the user's basic information.</p>
                    <div className="w-full">
                        <label className="text-white/80 mb-2">Username <span className="text-red-500">*</span></label>
                        <input type="text" placeholder="Enter username..." value={username} className="w-full p-2 rounded-md mt-2 bg-(--secondary) border border-white/10 text-white"/>
                    </div>
                    <div className="w-full">
                        <label className="text-white/80 mb-2">Email <span className="text-red-500">*</span></label>
                        <input type="text" placeholder="Enter email..." value={email} className="w-full p-2 rounded-md mt-2 bg-(--secondary) border border-white/10 text-white"/>
                    </div>
                    <div className="w-full">
                        <label className="text-white/80 mb-2">Date of Birth <span className="text-red-500">*</span></label>
                        <input type="date" value={dob} className="w-full p-2 rounded-md mt-2 bg-(--secondary) border border-white/10 text-white"/>
                    </div>
                    <div className="w-full flex justify-between items-center gap-4">
                        <button className="bg-(--secondary) text-white rounded-md p-2 w-full" onClick={() => setEditingUser(false)}>Cancel</button>
                        <button className="bg-(--primary) text-black rounded-md p-2 w-full">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    );
}