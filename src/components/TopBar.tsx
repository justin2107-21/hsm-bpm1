import { useAuth, ROLE_LABELS } from "@/contexts/AuthContext";
import { Bell, Search, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const TopBar = () => {
  const { currentRole, userName, signOut } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const toggleDark = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 gap-3 shrink-0">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <h1 className="text-sm font-extrabold font-heading text-foreground hidden md:block tracking-wide uppercase">
          Health & Sanitation Management
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {searchOpen ? (
          <Input
            placeholder="Search..."
            className="w-48 h-8 text-sm"
            autoFocus
            onBlur={() => setSearchOpen(false)}
          />
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSearchOpen(true)}>
            <Search className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}

        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleDark}>
          {isDark ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1 hover:bg-accent transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {(userName || ROLE_LABELS[currentRole])
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-xs font-medium truncate max-w-[120px]">
                  {userName || ROLE_LABELS[currentRole]}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {ROLE_LABELS[currentRole]}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel className="text-xs">
              Signed in as
              <div className="font-medium truncate">{userName || ROLE_LABELS[currentRole]}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => (window.location.href = "/settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopBar;
