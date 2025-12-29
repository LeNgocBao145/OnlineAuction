import Nav from "@/components/ui/nav";
import AdminHeader from "../adminHeader";

import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import { useState } from "react";

export default function RequestsManagementTab() {
    const [requestsData, setRequestsData] = useState(
        [
            {id: 1, fullName: "John Doe", email: "john.doe@example.com", rating: 4.5, requestDate: "2023-06-15", status: "Accepted" },
            {id: 2, fullName: "Jane Smith", email: "jane.smith@example.com", rating: 4.7, requestDate: "2023-06-16", status: "Pending" },
            {id: 3, fullName: "Alice Johnson", email: "alice.johnson@example.com", rating: 4.8, requestDate: "2023-06-17", status: "Rejected" },
            {id: 4, fullName: "Bob Brown", email: "bob.brown@example.com", rating: 4.6, requestDate: "2023-06-18", status: "Accepted" },
            {id: 5, fullName: "Charlie Davis", email: "charlie.davis@example.com", rating: 4.9, requestDate: "2023-06-19", status: "Pending" }
        ]
    );

    const [currentFilter, setCurrentFilter] = useState("All Status");

    const filteredRequestsData = currentFilter === "All Status" ? requestsData : requestsData.filter(request => request.status === currentFilter);

    return (
        <>
            <Nav />
            <div className="px-[10%]">
                <AdminHeader activeTab="requests" />
                <div className="p-4 border border-white/10 rounded-b-lg bg-(--third)">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                        <div className="relative lg:w-2/3 w-full flex gap-4">
                            <input className="border border-white/10 text-white/60 bg-(--secondary) w-full h-10 p-2 rounded-md" placeholder="Search users by name or email..." />
                            <MagnifyingGlassIcon className="w-5 h-5 text-white/60 absolute right-32 top-2.5" />
                            <div>
                                <select className="bg-(--secondary) text-white/60 border border-white/10 rounded-md h-10 p-2" value={currentFilter} onChange={(e) => setCurrentFilter(e.target.value)}>
                                    <option value="All Status">All Status</option>
                                    <option value="Accepted">Accepted</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Pending">Pending</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="bg-(--secondary) rounded-md p-4 mt-4">
                        <div className="overflow-x-auto">
                            <div className="w-365">
                                <div className="mt-6 grid grid-cols-[1fr_3fr_3fr_1fr_1fr_2fr] font-bold text-white/80 border-b border-white/10 pb-2">
                                    <p>Request ID</p>
                                    <p>Full Name</p>
                                    <p>Email</p>
                                    <p>Rating</p>
                                    <p>Request Date</p>
                                    <p>Actions</p>
                                </div>
                                <ul>
                                    {filteredRequestsData.length === 0 ? (
                                        <p className="text-white/60">No users found.</p>
                                    ) : (
                                    filteredRequestsData.map((request) => (
                                        <li key={request.id} className="h-20 border-b border-white/10 grid grid-cols-[1fr_3fr_3fr_1fr_1fr_2fr] items-center">
                                            <p className="text-white/60">{request.id}</p>
                                            <p className="text-white/60">{request.fullName}</p>
                                            <p className="text-white/60">{request.email}</p>
                                            <p className="text-(--primary)">{request.rating}</p>
                                            <p className="text-white/60">{request.requestDate}</p>
                                            {request.status === "Accepted" ? <p className="text-green-400">{request.status}</p> :
                                            request.status === "Rejected" ? <p className="text-red-400">{request.status}</p> :
                                            <div className="flex gap-2">
                                                <button className="text-sm bg-green-500 text-black rounded-md px-2 py-1 hover:bg-green-500/10">Accept</button>
                                                <button className="text-sm bg-red-500 text-white rounded-md px-2 py-1 hover:bg-red-500/10">Deny</button>
                                            </div>
                                            }
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
