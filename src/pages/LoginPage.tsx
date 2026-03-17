import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, LogIn, Moon, Sun } from "lucide-react";
import { toast } from "sonner";

const LoginPage = () => {
  const { signIn, signInAsCitizen } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<"staff" | "citizen">("staff");
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const stored = window.localStorage.getItem("healthguard-theme");
    if (stored === "light" || stored === "dark") return stored;
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    window.localStorage.setItem("healthguard-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const authFunction = loginMode === "citizen" ? signInAsCitizen : signIn;
    const { error } = await authFunction(email, password);

    if (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 bg-[radial-gradient(circle_at_top,_#e5e7eb,_#f9fafb)] dark:bg-[radial-gradient(circle_at_top,_#020617,_#0f172a)] transition-colors">
      <div className="absolute top-4 right-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-full border-border/70 bg-background/60 backdrop-blur-md"
          onClick={toggleTheme}
          aria-label="Toggle night mode"
        >
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-sky-500 flex items-center justify-center mx-auto shadow-xl">
            <Activity className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold font-heading text-foreground tracking-tight">
              HealthGuard Hub
            </h1>
            <p className="text-sm text-muted-foreground">
              Unified health, sanitation, and surveillance portal for Quezon City.
            </p>
          </div>
        </div>

        <Card className="glass-card border-border/70 bg-background/80 dark:bg-slate-900/80 backdrop-blur-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-heading flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <LogIn className="h-4 w-4 text-primary" /> Sign in to continue
              </span>
            </CardTitle>
            <div className="flex gap-2 mt-3">
              <Button
                type="button"
                variant={loginMode === "staff" ? "default" : "outline"}
                size="sm"
                onClick={() => setLoginMode("staff")}
                className="flex-1"
              >
                Staff Login
              </Button>
              <Button
                type="button"
                variant={loginMode === "citizen" ? "default" : "outline"}
                size="sm"
                onClick={() => setLoginMode("citizen")}
                className="flex-1"
              >
                Citizen Login
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">
                  {loginMode === "citizen" ? "Email (from CIE database)" : "Email"}
                </Label>
                <Input
                  type="email"
                  placeholder={loginMode === "citizen" ? "citizen@example.com" : "you@example.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Password</Label>
                <Input
                  type="password"
                  placeholder={loginMode === "citizen" ? "Any password (demo)" : "••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full mt-1" disabled={loading}>
                {loading
                  ? `Signing you in as ${loginMode === "citizen" ? "citizen" : "staff"}...`
                  : `Sign In as ${loginMode === "citizen" ? "Citizen" : "Staff"}`
                }
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-[11px] text-center text-muted-foreground max-w-sm mx-auto">
          By signing in, you acknowledge that access to citizen and health records is restricted to authorized
          government personnel and registered citizens of Quezon City.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
