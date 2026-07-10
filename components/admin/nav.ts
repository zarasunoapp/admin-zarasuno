import {
  LayoutDashboard,
  Building2,
  FolderTree,
  Tags,
  UserSquare2,
  BookOpen,
  Coins,
  Ticket,
  Users,
  Receipt,
  Layers,
  Star,
  Home,
  Bell,
  HelpCircle,
  ShieldCheck,
  FileText,
  MessageSquare,
  Settings,
  Wallet,
  BarChart3,
} from "lucide-react";

export type NavItem = { label: string; href: string; icon?: any };
export type NavGroup = { label: string; icon?: any; items: NavItem[] };
export type NavEntry = NavItem | NavGroup;

export const NAV: NavEntry[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  {
    label: "Book Parameter",
    icon: FolderTree,
    items: [
      { label: "Publisher", href: "/admin/publishers", icon: Building2 },
      { label: "Category", href: "/admin/categories", icon: Tags },
      { label: "Subcategory", href: "/admin/subcategories", icon: FolderTree },
      { label: "Author", href: "/admin/authors", icon: UserSquare2 },
      { label: "Book", href: "/admin/books", icon: BookOpen },
    ],
  },
  { label: "Product Coins", href: "/admin/product-coins", icon: Coins },
  { label: "Promocode", href: "/admin/promocodes", icon: Ticket },
  { label: "User", href: "/admin/users", icon: Users },
  { label: "Sales", href: "/admin/sales", icon: Receipt },
  { label: "Collection", href: "/admin/collections", icon: Layers },
  { label: "Featured Books", href: "/admin/featured-books", icon: Star },
  { label: "Home Screen", href: "/admin/home-screen", icon: Home },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "FAQ", href: "/admin/faqs", icon: HelpCircle },
  { label: "Privacy Policy", href: "/admin/privacy", icon: ShieldCheck },
  { label: "Term Condition", href: "/admin/terms", icon: FileText },
  { label: "Feedback", href: "/admin/feedback", icon: MessageSquare },
  { label: "Settings", href: "/admin/settings", icon: Settings },
  { label: "Payments", href: "/admin/payments/manual", icon: Wallet },
  {
    label: "Reports",
    icon: BarChart3,
    items: [
      { label: "Consumption", href: "/admin/reports/consumption" },
      { label: "Statistics", href: "/admin/reports/statistics" },
      { label: "Purchase", href: "/admin/reports/purchase" },
      { label: "Promocode", href: "/admin/reports/promocode" },
      { label: "Top Selling", href: "/admin/reports/top-selling" },
      { label: "Language", href: "/admin/reports/language" },
      { label: "Package", href: "/admin/reports/package" },
    ],
  },
];
