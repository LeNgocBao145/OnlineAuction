import AdminHeader from "../adminHeader";

import { MagnifyingGlassIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import EditUserModal from "./editUserModal";
import adminService, { type AdminUser } from "@/services/adminService";
import useAuthStore from "@/stores/authStore";

export default function UserManagementTab() {
    const { user: currentUser } = useAuthStore();
    const [editingUser, setEditingUser] = useState(false);
    const [editingUserData, setEditingUserData] = useState<AdminUser | null>(null);
    const [userData, setUserData] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [roleFilter, setRoleFilter] = useState("All Roles");
    const [sortConfig, setSortConfig] = useState<{ key: keyof AdminUser; direction: "asc" | "desc" } | null>(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, totalItems: 0, totalPages: 0 });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            // Build sort parameter for backend
            let sortParam = "id_asc";
            if (sortConfig) {
                const sortKey = `${sortConfig.key}_${sortConfig.direction}`;
                sortParam = sortKey;
            }
            const roleMap: Record<string, string[]> = {
                "All Roles": [],
                "Admin": ["admin"],
                "Seller": ["seller"],
                "Bidder": ["bidder"]
            };
            const result = await adminService.getUsers(sortParam, pagination.page, pagination.limit, roleMap[roleFilter]);
            setUserData(result.users);
            setPagination(result.pagination);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [sortConfig, pagination.page, roleFilter]);

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

    const handleSort = (key: keyof AdminUser) => {
        let direction: "asc" | "desc" = "asc";
        if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const filteredUsers = userData.filter(user =>
        (user.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            user.email.toLowerCase().includes(searchKeyword.toLowerCase())) &&
        user.id !== currentUser?.id
    );

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    return (
        <>
            {editingUser && editingUserData && <EditUserModal
                setEditingUser={setEditingUser}
                userData={editingUserData}
                onUpdate={fetchUsers}
            />}

            <div className="px-[10%]">
                <AdminHeader activeTab="user" />
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
                                <select
                                    className="bg-(--secondary) text-white/60 border border-white/10 rounded-md h-10 p-2"
                                    value={roleFilter}
                                    onChange={(e) => {
                                        setRoleFilter(e.target.value);
                                        setPagination(prev => ({ ...prev, page: 1 }));
                                    }}
                                >
                                    <option value="All Roles">All Roles</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Seller">Seller</option>
                                    <option value="Bidder">Bidder</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="bg-(--secondary) rounded-md p-4 mt-4">
                        <div className="overflow-x-auto">
                            <div className="w-365">
                                <div className="mt-6 w-full grid grid-cols-[1fr_3fr_3fr_1fr_1fr_2fr_1fr] font-bold text-white/80 border-b border-white/10 pb-2">
                                    <div onClick={() => handleSort("id")} className="cursor-pointer flex items-center gap-1">User ID {sortConfig?.key === "id" && (sortConfig.direction === "asc" ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />)}</div>
                                    <div onClick={() => handleSort("name")} className="cursor-pointer flex items-center gap-1">Full Name {sortConfig?.key === "name" && (sortConfig.direction === "asc" ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />)}</div>
                                    <div onClick={() => handleSort("email")} className="cursor-pointer flex items-center gap-1">Email {sortConfig?.key === "email" && (sortConfig.direction === "asc" ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />)}</div>
                                    <div onClick={() => handleSort("role")} className="cursor-pointer flex items-center gap-1">Role {sortConfig?.key === "role" && (sortConfig.direction === "asc" ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />)}</div>
                                    <div onClick={() => handleSort("rating")} className="cursor-pointer flex items-center gap-1">Rating {sortConfig?.key === "rating" && (sortConfig.direction === "asc" ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />)}</div>
                                    <div onClick={() => handleSort("birthdate")} className="cursor-pointer flex items-center gap-1">Birthdate {sortConfig?.key === "birthdate" && (sortConfig.direction === "asc" ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />)}</div>
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
                                                    user.rating < 0.8 ? "text-yellow-400" : "text-white/60"
                                                }>{user.rating}</p>
                                                <p className="text-white/60">{new Date(user.birthdate).toLocaleDateString()}</p>
                                                <div>
                                                    <button
                                                        disabled={user.role === "admin"}
                                                        className="text-sm bg-(--primary) text-black rounded-md px-2 py-1 mr-2 hover:bg-(--primary)/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        onClick={() => {
                                                            setEditingUserData(user);
                                                            setEditingUser(true);
                                                        }}
                                                    >Edit</button>
                                                    <button
                                                        disabled={user.role === "admin"}
                                                        className="text-sm bg-red-500 text-white rounded-md px-2 py-1 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    onClick={() => handlePageChange(1)}
                                    disabled={pagination.page === 1}
                                    className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                                    First
                                </button>
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                                    Previous
                                </button>
                                <span className="text-white">
                                    Page <span className="text-(--primary) font-bold">{pagination.page}</span> of <span className="text-(--primary) font-bold">{pagination.totalPages || 1}</span>
                                </span>
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                                    Next
                                </button>
                                <button
                                    onClick={() => handlePageChange(pagination.totalPages)}
                                    disabled={pagination.page >= pagination.totalPages}
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