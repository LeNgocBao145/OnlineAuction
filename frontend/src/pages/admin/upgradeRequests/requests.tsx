import Nav from "@/components/ui/nav";
import AdminHeader from "../adminHeader";

import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import adminService, { type UpgradeRequest, type PaginationInfo } from "@/services/adminService";

export default function RequestsManagementTab() {
    const [requestsData, setRequestsData] = useState<UpgradeRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentFilter, setCurrentFilter] = useState("All Status");
    const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 10, totalItems: 0, totalPages: 0 });

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const stateMap: Record<string, string[]> = {
                "All Status": [],
                "Accepted": ["success"],
                "Rejected": ["failed"],
                "Pending": ["pending"]
            };
            const result = await adminService.getUpgradeRequests({
                keyword: searchKeyword,
                states: stateMap[currentFilter],
                page: pagination.page,
                limit: pagination.limit
            });
            setRequestsData(result.requests);
            setPagination(result.pagination);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to fetch requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [currentFilter, pagination.page]);

    const handleApprove = async (requestId: number) => {
        try {
            await adminService.approveRequest(requestId);
            toast.success("Request approved successfully");
            fetchRequests();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to approve request");
        }
    };

    const handleReject = async (requestId: number) => {
        try {
            await adminService.rejectRequest(requestId);
            toast.success("Request rejected successfully");
            fetchRequests();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to reject request");
        }
    };

    const getStatusDisplay = (state: string) => {
        switch (state) {
            case "success": return "Accepted";
            case "failed": return "Rejected";
            case "pending": return "Pending";
            default: return state;
        }
    };

    return (
        <>
            <Nav />
            <div className="px-[10%]">
                <AdminHeader activeTab="requests" />
                <div className="p-4 border border-white/10 rounded-b-lg bg-(--third)">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                        <div className="relative lg:w-2/3 w-full flex gap-4">
                            <input 
                                className="border border-white/10 text-white/60 bg-(--secondary) w-full h-10 p-2 rounded-md" 
                                placeholder="Search users by name or email..." 
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                            />
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
                                <div className="mt-6 grid grid-cols-[1fr_3fr_3fr_1fr_2fr_2fr] font-bold text-white/80 border-b border-white/10 pb-2">
                                    <p>Request ID</p>
                                    <p>Full Name</p>
                                    <p>Email</p>
                                    <p>Rating</p>
                                    <p>Request Date</p>
                                    <p>Actions</p>
                                </div>
                                <ul>
                                    {loading ? (
                                        <p className="text-white/60 py-4">Loading...</p>
                                    ) : requestsData.length === 0 ? (
                                        <p className="text-white/60 py-4">No requests found.</p>
                                    ) : (
                                    requestsData.map((request) => (
                                        <li key={request.id} className="h-20 border-b border-white/10 grid grid-cols-[1fr_3fr_3fr_1fr_2fr_2fr] items-center">
                                            <p className="text-white/60">{request.id}</p>
                                            <p className="text-white/60">{request.name}</p>
                                            <p className="text-white/60">{request.email}</p>
                                            <p className="text-(--primary)">{request.rating}</p>
                                            <p className="text-white/60">{new Date(request.created_at).toLocaleDateString()}</p>
                                            {request.state === "success" ? <p className="text-green-400">{getStatusDisplay(request.state)}</p> :
                                            request.state === "failed" ? <p className="text-red-400">{getStatusDisplay(request.state)}</p> :
                                            <div className="flex gap-2">
                                                <button 
                                                    className="text-sm bg-green-500 text-black rounded-md px-2 py-1 hover:bg-green-500/10"
                                                    onClick={() => handleApprove(request.id)}
                                                >Accept</button>
                                                <button 
                                                    className="text-sm bg-red-500 text-white rounded-md px-2 py-1 hover:bg-red-500/10"
                                                    onClick={() => handleReject(request.id)}
                                                >Deny</button>
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
