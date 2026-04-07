import {
  LayoutDashboard,
  Stethoscope,
  ClipboardCheck,
  Syringe,
  Droplets,
  Activity,
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
  UserSearch,
  UserPlus,
  Map,
  BarChart3,
  CalendarDays,
  Users,
  PlugZap,
  ScanLine,
} from "lucide-react";
import { useMemo } from "react";
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

// Staff/Admin navigation (non-citizen)
const staffBaseSections: NavSection[] = [
  {
    label: "Navigation",
    items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }],
  },
  {
    label: "Core Modules",
    items: [
      { title: "Health Center Services", url: "/health-center", icon: Stethoscope },
      { title: "Sanitation Permit", url: "/sanitation-permit", icon: ClipboardCheck },
      { title: "Immunization Tracker", url: "/immunization", icon: Syringe },
      { title: "Wastewater & Septic", url: "/wastewater", icon: Droplets },
      { title: "Health Surveillance", url: "/surveillance", icon: Activity },
    ],
  },
];

// BHW-specific navigation
const bhwSections: NavSection[] = [
  {
    label: "Dashboard",
    items: [{ title: "BHW Dashboard", url: "/", icon: LayoutDashboard }],
  },
  {
    label: "Citizen Services",
    items: [
      { title: "Citizen Search", url: "/staff/search-citizens", icon: UserSearch },
      { title: "Assisted Request", url: "/assisted-requests", icon: FileText },
    ],
  },
  {
    label: "Health Programs",
    items: [
      { title: "Vaccination Requests", url: "/health-programs/vaccination-requests", icon: Syringe },
      { title: "Nutrition Monitoring", url: "/health-programs/nutrition-monitoring", icon: HeartPulse },
    ],
  },
  {
    label: "Community Reports",
    items: [
      { title: "Disease Case Reporting", url: "/bhw/community-reports", icon: ShieldAlert },
      { title: "Sanitation Complaints", url: "/bhw/complaints", icon: MessageSquare },
    ],
  },
  {
    label: "Barangay Health Data",
    items: [{ title: "Health Overview", url: "/bhw/barangay-health", icon: BarChart3 }],
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
      { title: "Reports & Complaints", url: "/citizen/disease-reporting", icon: MessageSquare },
      { title: "My Establishments", url: "/citizen/establishments", icon: Building2 },
    ],
  },
  {
    label: "Business Services",
    items: [
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
  "/health-center": ["Clerk_User", "Captain_User"],
  "/sanitation-permit": ["BSI_User", "Clerk_User", "Captain_User"],
  "/immunization": ["Clerk_User", "Captain_User"],
  "/wastewater": ["BSI_User", "Clerk_User"],
  "/surveillance": ["BHW_User", "Clerk_User", "Captain_User", "SysAdmin_User"],
};

export function AppSidebar() {
  const { currentRole, hasEstablishments } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const isCitizen = currentRole === "Citizen_User" || currentRole === "BusinessOwner_User";

  const sections = useMemo(() => {
    let navSections: NavSection[];

    if (isCitizen) {
      navSections = citizenSections.filter(
        (s) => !s.showIf || s.showIf(currentRole, hasEstablishments || currentRole === "BusinessOwner_User"),
      );
    } else if (currentRole === "BHW_User") {
      navSections = bhwSections;
    } else if (currentRole === "Clerk_User") {
      navSections = [
        { label: "Dashboard", items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }] },
        {
          label: "Citizen Services",
          items: [
            { title: "Citizen Search", url: "/staff/search-citizens", icon: UserSearch },
          ],
        },
        {
          label: "Consultations",
          items: [
            { title: "Consultation Records", url: "/health-center", icon: FileText },
          ],
        },
        {
          label: "Health Assessments",
          items: [
            { title: "Citizen Health Assessment", url: "/staff/assessments", icon: Search },
          ],
        },
        {
          label: "Vaccination Services",
          items: [
            { title: "Vaccination Analytics", url: "/immunization", icon: FileText },
            { title: "Vaccination Scheduling", url: "/staff/requests", icon: CalendarDays },
          ],
        },
        {
          label: "Sanitation Permit Processing",
          items: [
            { title: "Document Verification", url: "/staff/permit-verification", icon: ClipboardCheck },
            { title: "Permit Applications", url: "/sanitation-permit", icon: FileCheck },
          ],
        },
        {
          label: "Surveillance",
          items: [
            { title: "Disease Monitoring & Reporting", url: "/surveillance", icon: ShieldAlert },
          ],
        },

      ];
    } else if (currentRole === "BSI_User") {
      navSections = [
        { label: "Dashboard", items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }] },
        {
          label: "Inspection Management",
          items: [
            { title: "Assigned Inspections", url: "/inspector/assigned-inspections", icon: ClipboardCheck },
            { title: "Inspection Schedule", url: "/inspector/inspection-schedule", icon: CalendarDays },
          ],
        },
        {
          label: "Establishments",
          items: [
            { title: "Establishment List", url: "/inspector/establishments", icon: Building2 },
            { title: "Inspection Reports", url: "/inspector/inspection-reports", icon: Search },
          ],
        },
        {
          label: "Complaints Management",
          items: [
            { title: "Complaint Inspections", url: "/inspector/complaint-inspections", icon: MessageSquare },
          ],
        },
        {
          label: "Compliance & Notices",
          items: [
            { title: "Correction Notices", url: "/inspector/correction-notices", icon: Award },
            { title: "Compliance Monitoring", url: "/inspector/compliance-monitoring", icon: Search },
          ],
        },
        { label: "History", items: [{ title: "Inspection History", url: "/inspector/inspection-history", icon: FileText }] },
      ];
    } else if (currentRole === "Captain_User") {
      navSections = [
        { label: "Dashboard", items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }] },
        {
          label: "Sanitation Permit Authority",
          items: [
            { title: "Permit Applications", url: "/sanitation-permit", icon: FileCheck },
            { title: "Inspection Reports", url: "/citizen/inspections", icon: Search },
          ],
        },
        {
          label: "Health Surveillance",
          items: [
            { title: "Disease Case Monitoring", url: "/surveillance", icon: ShieldAlert },
            { title: "Disease Mapping Dashboard", url: "/surveillance/map", icon: Map },
          ],
        },
        {
          label: "Vaccination & Immunization",
          items: [
            { title: "Vaccination & Immunization", url: "/immunization", icon: Syringe },
          ],
        },
        {
          label: "Health Center Operations",
          items: [
            { title: "Health Center Reports", url: "/health-center", icon: Stethoscope },
          ],
        },
      ];
    } else if (currentRole === "LGUAdmin_User") {
      navSections = [
        { label: "Dashboard", items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }] },
        {
          label: "Municipal Overview",
          items: [
            { title: "Real-Time Service Requests", url: "/lgu/requests", icon: FileText },
            { title: "Citizen Search", url: "/staff/search-citizens", icon: UserSearch },
          ],
        },
        {
          label: "Health Monitoring",
          items: [
            { title: "Disease Mapping Dashboard", url: "/surveillance/map", icon: Map },
            { title: "Vaccination Coverage", url: "/lgu/vaccination", icon: Syringe },
          ],
        },
        {
          label: "Sanitation Monitoring",
          items: [
            { title: "Active Inspections", url: "/lgu/inspections", icon: ClipboardCheck },
            { title: "Establishment Compliance", url: "/lgu/compliance", icon: Building2 },
          ],
        },
        { label: "Reports & Analytics", items: [{ title: "Municipal Analytics", url: "/lgu/analytics", icon: BarChart3 }] },
      ];
    } else if (currentRole === "SysAdmin_User") {
      navSections = [
        { label: "Dashboard", items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }] },
        {
          label: "User Management",
          items: [
            { title: "View Users", url: "/sys/users", icon: UserSearch },
            { title: "Create / Edit Users", url: "/sys/users", icon: UserPlus },
            { title: "Assign Roles", url: "/sys/users", icon: Users },
            { title: "User Activity Logs", url: "/sys/logs", icon: FileText },
            { title: "Citizen Search", url: "/staff/search-citizens", icon: UserSearch },
          ],
        },
        {
          label: "System Overview",
          items: [
            { title: "System Health", url: "/sys/monitoring", icon: Activity },
            { title: "Active Requests", url: "/sys/requests", icon: FileText },
            { title: "Integration Status", url: "/sys/integrations", icon: PlugZap },
          ],
        },
        {
          label: "Database Management",
          items: [
            { title: "Database Health & Backups", url: "/sys/database", icon: BarChart3 },
            { title: "Audit Logs", url: "/sys/logs", icon: Search },
          ],
        },
      ];
    } else {
      navSections = staffBaseSections.map((s) => ({
        ...s,
        items: s.items.filter((item) => {
          const allowed = staffRoleFilter[item.url];
          return !allowed || allowed.includes(currentRole);
        }),
      }));
    }

    return navSections;
  }, [currentRole, hasEstablishments, isCitizen]);

  return (
    <Sidebar collapsible="icon" className="sidebar-gradient border-r-0">
      <SidebarContent className="overflow-y-auto scrollbar-none">
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
          <SidebarGroup key={section.label} className="py-1">
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-wider py-1">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/" || item.url === "/surveillance"}
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

      {/* Settings and Logout moved to top bar profile menu */}
    </Sidebar>
  );
}
