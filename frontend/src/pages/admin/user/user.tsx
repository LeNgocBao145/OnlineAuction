import Nav from "@/components/ui/nav";
import AdminHeader from "../adminHeader";

import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import EditUserModal from "./editUserModal";

export default function UserManagementTab() {
    const [editingUser, setEditingUser] = useState(false);
    const [editingUserData, setEditingUserData] = useState<{ fullName: string; email: string; dob: string }>({ fullName: "", email: "", dob: "" });
    const [userData, setUserData] = useState(
        [
            {id: 1, fullName: "John Doe", email: "john.doe@example.com", dob: "1990-01-01", role: "Bidder", rating: 4.5, joinDate: "2023-01-15" },
            {id: 2, fullName: "Jane Smith", email: "jane.smith@example.com", dob: "1985-05-20", role: "Seller", rating: 4.2, joinDate: "2022-11-30" },
            {id: 3, fullName: "Alice Johnson", email: "alice.johnson@example.com", dob: "1992-07-15", role: "Seller", rating: 3.7, joinDate: "2023-03-22" },
            {id: 4, fullName: "Bob Brown", email: "bob.brown@example.com", dob: "1988-12-05", role: "Bidder", rating: 3.9, joinDate: "2023-04-10" },
            {id: 5, fullName: "Charlie Davis", email: "charlie.davis@example.com", dob: "1995-09-10", role: "Admin", rating: 4.8, joinDate: "2023-05-05" }
        ]
    );

    return (
        <>
            {editingUser && <EditUserModal 
                setEditingUser={setEditingUser}
                username={editingUserData.fullName}
                email={editingUserData.email}
                dob={editingUserData.dob}
            />}
            <Nav />
            <div className="px-[10%]">
                <AdminHeader activeTab="user" />
                <div className="p-4 border border-white/10 rounded-b-lg bg-(--third)">
                    <div className="relative lg:w-1/3 w-full">
                        <input className="border border-white/10 text-white/60 bg-(--secondary) w-full h-10 p-2 rounded-md" placeholder="Search users by name or email..." />
                        <MagnifyingGlassIcon className="w-5 h-5 text-white/60 absolute right-2 top-2.5" />
                    </div>
                    <div className="bg-(--secondary) rounded-md p-4 mt-4">
                        <div className="overflow-x-auto">
                            <div className="w-365">
                                <div className="mt-6 w-full grid grid-cols-[1fr_3fr_3fr_1fr_1fr_2fr_1fr] font-bold text-white/80 border-b border-white/10 pb-2">
                                    <p>User ID</p>
                                    <p>Full Name</p>
                                    <p>Email</p>
                                    <p>Role</p>
                                    <p>Rating</p>
                                    <p>Joined Date</p>
                                    <p>Actions</p>
                                </div>
                                <ul>
                                    {userData.length === 0 ? (
                                        <p className="text-white/60">No users found.</p>
                                    ) : (
                                    userData.map((user) => (
                                        <li key={user.id} className="h-20 border-b border-white/10 grid grid-cols-[1fr_3fr_3fr_1fr_1fr_2fr_1fr] items-center">
                                            <p className="text-white/60">{user.id}</p>
                                            <p className="text-white/60">{user.fullName}</p>
                                            <p className="text-white/60">{user.email}</p>
                                            <p className={
                                                user.role === "Bidder" ? "text-white/60" : 
                                                user.role === "Seller" ? "text-(--primary)" :
                                                "text-red-400"
                                            }>{user.role}</p>
                                            <p className={
                                                user.rating >= 4.5 ? "text-green-400" :
                                                user.rating >= 4.0 ? "text-(--primary)" :
                                                "text-red-400"
                                            }>{user.rating}</p>
                                            <p className="text-white/60">{user.joinDate}</p>
                                            <div>
                                                <button className="text-sm bg-(--primary) text-black rounded-md px-2 py-1 mr-2 hover:bg-(--primary)/10"
                                                    onClick={() => {
                                                        setEditingUser(true);
                                                        setEditingUserData({
                                                            fullName: user.fullName,
                                                            email: user.email,
                                                            dob: user.dob
                                                        });
                                                    }}
                                                >Edit</button>
                                                <button className="text-sm bg-red-500 text-white rounded-md px-2 py-1 hover:bg-red-500/10">Delete</button>
                                            </div>
                                        </li>
                                    )))}
                                </ul>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-center items-center space-x-2 mt-8">
                                <button 
                                    className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                                    First
                                </button>
                                <button 
                                    className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                                    Previous
                                </button>
                                <span className="text-white">
                                    Page <span className="text-(--primary) font-bold">1</span> of <span className="text-(--primary) font-bold">N</span>
                                </span>
                                <button 
                                    className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                                    Next
                                </button>
                                <button 
                                    className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                                    Last
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}