import {
  LayoutDashboard,
  Stethoscope,
  ClipboardCheck,
  Syringe,
  Droplets,
  Activity,
  Settings,
  LogOut,
  QrCode,
  HeartPulse,
  ShieldAlert,
  Building2,
  FileCheck,
  Search,
  Award,
  CreditCard,
  FileText,
  MessageSquare,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth, type UserRole } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  label: string;
  items: NavItem[];
  showIf?: (role: UserRole, hasEstablishments: boolean) => boolean;
}

// Staff/Admin navigation
const staffSections: NavSection[] = [
  {
    label: "Navigation",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
      { title: "Health Center Services", url: "/health-center", icon: Stethoscope },
      { title: "Sanitation Permit", url: "/sanitation-permit", icon: ClipboardCheck },
      { title: "Immunization Tracker", url: "/immunization", icon: Syringe },
      { title: "Wastewater & Septic", url: "/wastewater", icon: Droplets },
      { title: "Health Surveillance", url: "/surveillance", icon: Activity },
    ],
  },
];

// Citizen navigation sections
const citizenSections: NavSection[] = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "Citizen Services",
    items: [
      { title: "My QR Citizen ID", url: "/citizen/qr", icon: QrCode },
      { title: "Health Services", url: "/citizen/health", icon: HeartPulse },
      { title: "Vaccination & Nutrition", url: "/citizen/vaccination", icon: Syringe },
      { title: "Disease Reporting", url: "/citizen/disease-reporting", icon: ShieldAlert },
      { title: "Sanitation Complaints", url: "/citizen/sanitation-complaints", icon: MessageSquare },
    ],
  },
  {
    label: "Business Services",
    showIf: (_role, hasEstablishments) => hasEstablishments,
    items: [
      { title: "My Establishments", url: "/citizen/establishments", icon: Building2 },
      { title: "Sanitary Permit", url: "/citizen/sanitary-permit", icon: FileCheck },
      { title: "Inspection Status", url: "/citizen/inspections", icon: Search },
      { title: "Certificates", url: "/citizen/certificates", icon: Award },
      { title: "Payments", url: "/citizen/payments", icon: CreditCard },
    ],
  },
  {
    label: "Requests & Tracking",
    items: [
      { title: "My Service Requests", url: "/citizen/requests", icon: FileText },
    ],
  },
];

// Role-based filtering for staff nav
const staffRoleFilter: Record<string, UserRole[]> = {
  "/": ["BHW_User", "BSI_User", "Clerk_User", "Captain_User", "SysAdmin_User"],
  "/health-center": ["BHW_User", "Clerk_User", "Captain_User"],
  "/sanitation-permit": ["BSI_User", "Clerk_User", "Captain_User"],
  "/immunization": ["BHW_User", "Clerk_User", "Captain_User"],
  "/wastewater": ["BSI_User", "Clerk_User"],
  "/surveillance": ["BHW_User", "Clerk_User", "Captain_User", "SysAdmin_User"],
};

export function AppSidebar() {
  const { currentRole, hasEstablishments, signOut } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const isCitizen = currentRole === "Citizen_User" || currentRole === "BusinessOwner_User";

  const sections = isCitizen
    ? citizenSections
        .filter((s) => !s.showIf || s.showIf(currentRole, hasEstablishments || currentRole === "BusinessOwner_User"))
    : staffSections.map((s) => ({
        ...s,
        items: s.items.filter((item) => {
          const allowed = staffRoleFilter[item.url];
          return !allowed || allowed.includes(currentRole);
        }),
      }));

  return (
    <Sidebar collapsible="icon" className="sidebar-gradient border-r-0">
      <SidebarContent>
        {!collapsed && (
          <div className="px-4 py-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg health-gradient flex items-center justify-center shrink-0">
                <Activity className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-sidebar-foreground leading-tight">Government Service</p>
                <p className="text-xs font-semibold text-sidebar-foreground/70 leading-tight">Management</p>
              </div>
            </div>
          </div>
        )}

        {sections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-wider">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
                        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/settings"
                className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
              >
                <Settings className="mr-2 h-4 w-4" />
                {!collapsed && <span className="text-sm">Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 cursor-pointer"
              onClick={signOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && <span className="text-sm">Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
