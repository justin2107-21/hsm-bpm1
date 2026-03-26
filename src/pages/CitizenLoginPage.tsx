import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { toast } from "sonner";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CitizenLoginPage = () => {
  const { signInAsCitizen } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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

    const { error } = await signInAsCitizen(email, password);

    if (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen transition-colors">
      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-full border-border/70 bg-background/60 backdrop-blur-md hover:bg-background/80"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
      </div>

      {/* Layout */}
      <AuthLayout>
        <LoginForm
          mode="citizen"
          title="Citizen Login"
          email={email}
          password={password}
          loading={loading}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={handleLogin}
          emailLabel="Email (from CIE database)"
          emailPlaceholder="citizen@example.com"
          buttonText="Sign in as Citizen"
          disclaimer="By signing in, you acknowledge that access to citizen and health records is restricted to authorized government personnel and registered citizens of Quezon City."
        />
      </AuthLayout>
    </div>
  );
};
