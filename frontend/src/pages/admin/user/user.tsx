import Nav from "@/components/ui/nav";
import AdminHeader from "../adminHeader";

import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import EditUserModal from "./editUserModal";
import adminService, { type AdminUser } from "@/services/adminService";

export default function UserManagementTab() {
    const [editingUser, setEditingUser] = useState(false);
    const [editingUserData, setEditingUserData] = useState<AdminUser | null>(null);
    const [userData, setUserData] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState("");

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const users = await adminService.getUsers();
            setUserData(users);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (userId: number) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            await adminService.deleteUser(userId);
            toast.success("User deleted successfully");
            fetchUsers();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to delete user");
        }
    };

    const filteredUsers = userData.filter(user => 
        user.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        user.email.toLowerCase().includes(searchKeyword.toLowerCase())
    );

    return (
        <>
            {editingUser && editingUserData && <EditUserModal 
                setEditingUser={setEditingUser}
                userData={editingUserData}
                onUpdate={fetchUsers}
            />}
            <Nav />
            <div className="px-[10%]">
                <AdminHeader activeTab="user" />
                <div className="p-4 border border-white/10 rounded-b-lg bg-(--third)">
                    <div className="relative lg:w-1/3 w-full">
                        <input 
                            className="border border-white/10 text-white/60 bg-(--secondary) w-full h-10 p-2 rounded-md" 
                            placeholder="Search users by name or email..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                        />
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
                                    {loading ? (
                                        <p className="text-white/60 py-4">Loading...</p>
                                    ) : filteredUsers.length === 0 ? (
                                        <p className="text-white/60 py-4">No users found.</p>
                                    ) : (
                                    filteredUsers.map((user) => (
                                        <li key={user.id} className="h-20 border-b border-white/10 grid grid-cols-[1fr_3fr_3fr_1fr_1fr_2fr_1fr] items-center">
                                            <p className="text-white/60">{user.id}</p>
                                            <p className="text-white/60">{user.name}</p>
                                            <p className="text-white/60">{user.email}</p>
                                            <p className={
                                                user.role === "bidder" ? "text-white/60" : 
                                                user.role === "seller" ? "text-(--primary)" :
                                                "text-red-400"
                                            }>{user.role}</p>
                                            <p className={
                                                user.rating >= 4.5 ? "text-green-400" :
                                                user.rating >= 4.0 ? "text-(--primary)" :
                                                "text-red-400"
                                            }>{user.rating}</p>
                                            <p className="text-white/60">{new Date(user.created_at).toLocaleDateString()}</p>
                                            <div>
                                                <button className="text-sm bg-(--primary) text-black rounded-md px-2 py-1 mr-2 hover:bg-(--primary)/10"
                                                    onClick={() => {
                                                        setEditingUserData(user);
                                                        setEditingUser(true);
                                                    }}
                                                >Edit</button>
                                                <button 
                                                    className="text-sm bg-red-500 text-white rounded-md px-2 py-1 hover:bg-red-500/10"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                >Delete</button>
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