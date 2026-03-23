import { useAuth, ROLE_LABELS } from "@/contexts/AuthContext";
import { Bell, Search, Moon, Sun, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
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
import { useNotifications } from "@/contexts/NotificationContext";
import { ScrollArea } from "@/components/ui/scroll-area";

const TopBar = () => {
  const { currentRole, userName, signOut } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });
  const [searchOpen, setSearchOpen] = useState(false);

  // Initialize from persisted theme state and keep in sync with document class
  useEffect(() => {
    const stored = window.localStorage.getItem("healthguard-theme");
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const resolved = stored === "dark" || (!stored && prefersDark);
    setIsDark(resolved);
    document.documentElement.classList.toggle("dark", resolved);
  }, []);

  const toggleDark = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      window.localStorage.setItem("healthguard-theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 gap-3 shrink-0">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <h1 className="text-base md:text-lg font-black font-sans tracking-wide uppercase 
               bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 relative">
              <Bell className="h-4 w-4 text-muted-foreground" />
              {unreadCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {notifications.length > 0 && (
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={markAllAsRead}>
                      Mark all read
                    </Button>
                  )}
                  {notifications.length > 0 && (
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={clearNotifications}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
            <ScrollArea className="h-[300px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
                  <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map(notif => (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 cursor-pointer hover:bg-muted/50 ${!notif.read ? 'bg-muted/30' : ''}`}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                          notif.type === 'success' ? 'bg-green-500' :
                          notif.type === 'error' ? 'bg-red-500' :
                          notif.type === 'warning' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium">{notif.title}</p>
                          {notif.description && (
                            <p className="text-xs text-muted-foreground mt-1">{notif.description}</p>
                          )}
                          <p className="text-[10px] text-muted-foreground/60 mt-1">
                            {notif.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

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
