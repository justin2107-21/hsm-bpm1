import { ReactNode } from "react";
import { Activity } from "lucide-react";

interface AuthLayoutProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}

export const AuthLayout = ({
  title = "Health & Sanitation Management",
  subtitle = "Unified health, sanitation, and surveillance portal for Quezon City.",
  children,
}: AuthLayoutProps) => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-col justify-center items-center px-8 py-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-sm space-y-8 text-center">
          {/* Logo */}
          <div>
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto shadow-2xl">
              <Activity className="h-10 w-10 text-white" />
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold font-heading text-white tracking-tight">
              {title}
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="pt-8 border-t border-slate-700/50">
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-center justify-center gap-2">
                <div className="h-1 w-1 rounded-full bg-emerald-400"></div>
                <span>Real-time Health Monitoring</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="h-1 w-1 rounded-full bg-emerald-400"></div>
                <span>Sanitation Compliance Tracking</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="h-1 w-1 rounded-full bg-emerald-400"></div>
                <span>Disease Surveillance System</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex flex-col justify-center items-center px-4 py-12 lg:px-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center space-y-3 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto shadow-xl">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-semibold font-heading text-foreground">
                {title}
              </h1>
              <p className="text-xs text-muted-foreground">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Form Content */}
          {children}
        </div>
      </div>
    </div>
  );
};
