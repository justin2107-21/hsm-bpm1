import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Users, UserPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const SystemAdminUsers = () => {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState("");
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const queryClient = useQueryClient();

  const availableRoles = [
    "No Role",
    "Citizen_User",
    "BHW_User",
    "BSI_User",
    "Clerk_User",
    "Captain_User",
    "Health_Officer",
    "LGUAdmin_User",
    "SysAdmin_User",
    "BusinessOwner_User",
  ];

  const getRoleColor = (role: string) => {
    const roleColors: Record<string, string> = {
      "No Role": "bg-gray-500/20 text-gray-400 border-gray-500/30",
      "Citizen_User": "bg-blue-500/20 text-blue-400 border-blue-500/30",
      "BHW_User": "bg-green-500/20 text-green-400 border-green-500/30",
      "BSI_User": "bg-orange-500/20 text-orange-400 border-orange-500/30",
      "Clerk_User": "bg-purple-500/20 text-purple-400 border-purple-500/30",
      "Captain_User": "bg-red-500/20 text-red-400 border-red-500/30",
      "Health_Officer": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      "LGUAdmin_User": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      "SysAdmin_User": "bg-pink-500/20 text-pink-400 border-pink-500/30",
      "BusinessOwner_User": "bg-amber-500/20 text-amber-400 border-amber-500/30",
    };
    return roleColors[role] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const { data: profiles = [] } = useQuery({
    queryKey: ["sys_admin_profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["sys_admin_roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .limit(500);
      if (error) throw error;
      return data;
    },
  });

  const usersWithRoles = useMemo(() => {
    return profiles.map((p) => {
      const userRole = roles.find((r) => r.user_id === p.user_id);
      return { ...p, role: userRole?.role || "No Role" };
    });
  }, [profiles, roles]);

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      // First, delete existing role if any
      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      // If new role is "No Role", we're done
      if (newRole === "No Role") return;

      // Insert new role
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role: newRole,
        });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sys_admin_roles"] });
      toast.success("User role updated successfully");
      setIsModalOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error("Failed to update user role: " + (error as any).message);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Delete user roles first
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (roleError) throw roleError;

      // Delete user profile
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", userId);

      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sys_admin_profiles"] });
      queryClient.invalidateQueries({ queryKey: ["sys_admin_roles"] });
      toast.success("User deleted successfully");
      setIsModalOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error("Failed to delete user: " + (error as any).message);
    },
  });

  const addUserMutation = useMutation({
    mutationFn: async ({ email, password, fullName }: { email: string; password: string; fullName: string }) => {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) throw new Error("Failed to create user");

      // Create profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          user_id: authData.user.id,
          full_name: fullName || email.split("@")[0],
          email,
        });

      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sys_admin_profiles"] });
      toast.success("New user created successfully");
      setIsAddUserModalOpen(false);
      setNewUserEmail("");
      setNewUserPassword("");
    },
    onError: (error) => {
      toast.error("Failed to create user: " + (error as any).message);
    },
  });

  const handleUserRowClick = (user: any) => {
    setSelectedUser(user);
    setEditingRole(user.role);
    setIsModalOpen(true);
  };

  const handleSaveRole = () => {
    if (!selectedUser || editingRole === selectedUser.role) {
      setIsModalOpen(false);
      return;
    }
    updateRoleMutation.mutate({
      userId: selectedUser.user_id,
      newRole: editingRole,
    });
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    if (window.confirm(`Are you sure you want to delete ${selectedUser.full_name}? This action cannot be undone.`)) {
      deleteUserMutation.mutate(selectedUser.user_id);
    }
  };

  const handleAddUser = () => {
    if (!newUserEmail || !newUserPassword) {
      toast.error("Email and password are required");
      return;
    }
    if (newUserPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    addUserMutation.mutate({
      email: newUserEmail,
      password: newUserPassword,
      fullName: newUserEmail.split("@")[0],
    });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return usersWithRoles;
    return usersWithRoles.filter(
      (u) =>
        u.full_name.toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [usersWithRoles, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Users Management</h1>
        <p className="text-sm text-muted-foreground">View, manage, and monitor all system users and their assigned roles</p>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> System Users ({filtered.length})
            </CardTitle>
            <Button
              onClick={() => setIsAddUserModalOpen(true)}
              size="sm"
              className="gap-1"
            >
              <UserPlus className="h-4 w-4" />
              Add New User
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 flex-1"
            />
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No users found.</p>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs">User ID</TableHead>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Email</TableHead>
                    <TableHead className="text-xs">Role</TableHead>
                    <TableHead className="text-xs">Created</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((u) => (
                    <TableRow
                      key={u.id}
                      className="hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleUserRowClick(u)}
                    >
                      <TableCell className="text-xs font-mono text-muted-foreground">{u.user_id.substring(0, 8)}...</TableCell>
                      <TableCell className="text-sm font-medium">{u.full_name || "—"}</TableCell>
                      <TableCell className="text-sm">{u.email || "—"}</TableCell>
                      <TableCell>
                        <Badge className={`${getRoleColor(u.role)} border text-xs`}>
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(u.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs">
                          Active
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md glass-card border-border">
          <DialogHeader>
            <DialogTitle>User Details & Role Management</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 py-4">
              {/* User Information */}
              <div className="space-y-3 pb-4 border-b border-border">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Full Name</label>
                  <p className="text-sm font-medium mt-1">{selectedUser.full_name || "—"}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Email Address</label>
                  <p className="text-sm font-medium mt-1">{selectedUser.email || "—"}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">User ID</label>
                  <p className="text-xs font-mono text-muted-foreground mt-1">{selectedUser.user_id}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Account Created</label>
                  <p className="text-sm text-muted-foreground mt-1">{new Date(selectedUser.created_at).toLocaleString()}</p>
                </div>
              </div>

              {/* Role Management */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Assign or Change Role</label>
                <Select value={editingRole} onValueChange={setEditingRole}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role === "No Role" ? "— No Role —" : role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">Current role:</span>
                  <Badge className={`${getRoleColor(selectedUser.role)} border text-xs`}>
                    {selectedUser.role}
                  </Badge>
                </div>
              </div>

              {/* Change Indicator */}
              {editingRole !== selectedUser.role && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-300 space-y-2">
                  <p>Role will change from:</p>
                  <div className="flex gap-2 items-center">
                    <Badge className={`${getRoleColor(selectedUser.role)} border text-xs`}>
                      {selectedUser.role}
                    </Badge>
                    <span>→</span>
                    <Badge className={`${getRoleColor(editingRole)} border text-xs`}>
                      {editingRole}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2 justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
              className="gap-1"
            >
              <Trash2 className="h-4 w-4" />
              {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveRole}
                disabled={updateRoleMutation.isPending || editingRole === selectedUser?.role}
              >
                {updateRoleMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New User Modal */}
      <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
        <DialogContent className="sm:max-w-md glass-card border-border">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Email Address</label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Password</label>
              <Input
                type="password"
                placeholder="At least 6 characters"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">Password must be at least 6 characters long</p>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-300">
              <p>• User account will be created in Supabase Auth</p>
              <p>• User profile will be created in the system</p>
              <p>• You can assign roles after creation</p>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddUserModalOpen(false);
                setNewUserEmail("");
                setNewUserPassword("");
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddUser}
              disabled={addUserMutation.isPending || !newUserEmail || !newUserPassword}
              className="flex-1"
            >
              {addUserMutation.isPending ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SystemAdminUsers;
