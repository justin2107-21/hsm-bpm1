import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";

interface LoginFormProps {
  mode: "citizen" | "staff";
  title: string;
  email: string;
  password: string;
  loading: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  emailLabel?: string;
  emailPlaceholder?: string;
  buttonText?: string;
  disclaimer?: string;
}

export const LoginForm = ({
  mode,
  title,
  email,
  password,
  loading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  emailLabel,
  emailPlaceholder,
  buttonText,
  disclaimer,
}: LoginFormProps) => {
  const isCitizen = mode === "citizen";
  const defaultEmailLabel = isCitizen ? "Email (from CIE database)" : "Email";
  const defaultEmailPlaceholder = isCitizen ? "citizen@example.com" : "you@example.com";
  const defaultButtonText = isCitizen ? "Sign in as Citizen" : "Sign in as Staff";

  return (
    <Card className="glass-card border-border/70 bg-background/80 dark:bg-slate-900/80 backdrop-blur-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-heading flex items-center gap-2">
          <LogIn className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {emailLabel || defaultEmailLabel}
            </Label>
            <Input
              type="email"
              placeholder={emailPlaceholder || defaultEmailPlaceholder}
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
              className="rounded-lg"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
              className="rounded-lg"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full mt-6 rounded-lg font-medium"
            disabled={loading}
          >
            {loading
              ? `Signing you in as ${mode}...`
              : buttonText || defaultButtonText}
          </Button>
        </form>

        {/* Staff-only disclaimer */}
        {!isCitizen && (
          <p className="text-xs text-amber-600 dark:text-amber-400 text-center mt-3 pt-3 border-t border-border/50">
            Authorized personnel only
          </p>
        )}

        {/* Custom disclaimer */}
        {disclaimer && (
          <p className="text-xs text-center text-muted-foreground mt-3 pt-3 border-t border-border/50">
            {disclaimer}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
