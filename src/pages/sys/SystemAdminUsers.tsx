import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Search, Users } from "lucide-react";

const SystemAdminUsers = () => {
  const [search, setSearch] = useState("");

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
        <h1 className="text-2xl font-bold font-heading">User Management</h1>
        <p className="text-sm text-muted-foreground">View all system users and their assigned roles</p>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> System Users ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 max-w-md"
            />
          </div>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No users found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Email</TableHead>
                  <TableHead className="text-xs">Role</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="text-sm font-medium">{u.full_name || "—"}</TableCell>
                    <TableCell className="text-sm">{u.email || "—"}</TableCell>
                    <TableCell><StatusBadge status={u.role} /></TableCell>
                    <TableCell className="text-sm hidden md:table-cell">
                      {new Date(u.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemAdminUsers;
