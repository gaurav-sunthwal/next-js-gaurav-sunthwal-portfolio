import React, { useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";

interface UsersTabProps {
  usersList: { id: number; username: string; createdAt: string }[];
  fetchUsers: () => Promise<void>;
}

export function UsersTab({ usersList, fetchUsers }: UsersTabProps) {
  // User registration / create states
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regMessage, setRegMessage] = useState("");
  const [regError, setRegError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // User edit details states
  const [editingUser, setEditingUser] = useState<{ id: number; username: string } | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editError, setEditError] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [isEditingUser, setIsEditingUser] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setRegMessage("");
    setIsRegistering(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: regUsername, password: regPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setRegMessage("User created successfully!");
        setRegUsername("");
        setRegPassword("");
        await fetchUsers(); // Refresh list
      } else {
        setRegError(data.error || "Failed to create user");
      }
    } catch (err) {
      setRegError("An error occurred. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError("");
    setEditMessage("");
    setIsEditingUser(true);

    try {
      const res = await fetch("/api/auth/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser.id,
          username: editUsername,
          password: editPassword || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setEditMessage("User updated successfully!");
        await fetchUsers(); // Refresh list
        setTimeout(() => {
          setEditingUser(null);
          setEditUsername("");
          setEditPassword("");
          setEditMessage("");
        }, 1500);
      } else {
        setEditError(data.error || "Failed to update user");
      }
    } catch (err) {
      setEditError("An error occurred. Please try again.");
    } finally {
      setIsEditingUser(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/auth/users?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        await fetchUsers(); // Refresh list
      } else {
        alert(data.error || "Failed to delete user");
      }
    } catch (err) {
      alert("An error occurred while deleting the user");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-on-surface">User Accounts</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Users List */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-on-surface">Registered Users</h3>
          <div className="bg-white border border-outline-variant/30 rounded-2xl divide-y divide-outline-variant/20 overflow-hidden shadow-sm">
            {usersList.map((usr) => (
              <div key={usr.id} className="p-4 flex items-center justify-between hover:bg-surface-container-lowest transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {usr.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-on-surface">{usr.username}</p>
                    <p className="text-[10px] text-on-surface-variant">
                      Created: {new Date(usr.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingUser(usr);
                      setEditUsername(usr.username);
                      setEditPassword("");
                    }}
                    className="px-3 py-1.5 text-xs h-auto"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleDeleteUser(usr.id)}
                    className="px-3 py-1.5 text-xs h-auto bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500 hover:text-white"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Create User Form */}
        <Card interactive={false} className="p-8 border border-outline-variant/30 bg-surface-container-lowest shadow-sm rounded-2xl">
          <div className="mb-6">
            <h3 className="text-lg font-bold tracking-tight text-on-surface">Create New Admin User</h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Add another administrator account to manage this portfolio.
            </p>
          </div>
          
          <form onSubmit={handleCreateUser} className="space-y-6">
            {regError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-xs font-semibold text-center">
                {regError}
              </div>
            )}
            {regMessage && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-600 rounded-xl text-xs font-semibold text-center">
                {regMessage}
              </div>
            )}
            
            <Input
              label="New Username"
              required
              value={regUsername}
              onChange={(e) => setRegUsername(e.target.value)}
              placeholder="e.g. gaurav"
            />
            
            <Input
              label="Password"
              required
              type="password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              placeholder="••••••••"
            />
            
            <Button
              type="submit"
              disabled={isRegistering}
              variant="primary"
              className="w-full py-4 h-auto rounded-xl font-semibold border-none flex justify-center items-center gap-2"
            >
              {isRegistering ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                  <span>Creating User...</span>
                </>
              ) : (
                <span>Create User</span>
              )}
            </Button>
          </form>
        </Card>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <Card interactive={false} className="w-full max-w-md bg-surface-container-lowest p-8 border border-outline-variant/30 shadow-2xl rounded-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-title-md text-title-md font-bold">Edit User Details</h3>
              <button
                onClick={() => {
                  setEditingUser(null);
                  setEditUsername("");
                  setEditPassword("");
                  setEditError("");
                  setEditMessage("");
                }}
                className="text-secondary hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleEditUser} className="space-y-6">
              {editError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-xs font-semibold text-center">
                  {editError}
                </div>
              )}
              {editMessage && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-600 rounded-xl text-xs font-semibold text-center">
                  {editMessage}
                </div>
              )}
              <Input
                label="Username"
                required
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
              />
              <Input
                label="New Password (Leave blank to keep current)"
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="••••••••"
              />
              <Button
                type="submit"
                disabled={isEditingUser}
                variant="primary"
                className="w-full py-4 h-auto rounded-xl font-semibold border-none flex justify-center items-center gap-2"
              >
                {isEditingUser ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                    <span>Updating User...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
