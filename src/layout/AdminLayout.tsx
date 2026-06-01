import { useState } from "react"
import { Outlet, Link, useLocation } from "react-router-dom"
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Tag, 
  Settings, 
  LogOut, 
  Menu,
  Search,
  Bell,
  PackageCheck,
  PlayCircle
} from "lucide-react"
import { cn } from "../utils/utils"
import { useAuth } from "../context/AuthContext"
import { ThemeProvider, useTheme } from "../context/ThemeContext"
import { Moon, Sun } from "lucide-react"

function AdminLayoutContent() {
  const location = useLocation()
  const { logout, user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const navItems = [
    { label: "Overview", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Products", icon: ShoppingBag, path: "/dashboard/products" },
    { label: "Categories", icon: Tag, path: "/dashboard/categories" },
    { label: "Collections", icon: Tag, path: "/dashboard/collections" },
    { label: "Inventory", icon: PackageCheck, path: "/dashboard/inventory" },
    { label: "Orders", icon: Users, path: "/dashboard/orders" },
    { label: "Offers", icon: Tag, path: "/dashboard/offers" },
    { label: "Trending", icon: Tag, path: "/dashboard/trending" },
    { label: "Coupons", icon: Tag, path: "/dashboard/coupons" },
    { label: "Live & Reels", icon: PlayCircle, path: "/dashboard/videos" },
    { label: "Settings", icon: Settings, path: "/dashboard/settings" },
  ]

  const handleLogout = async () => {
    await logout()
  }

  const SidebarContent = () => (
    <>
      <div className="h-20 flex items-center px-8 border-b border-charcoal/10 dark:border-dark-border shrink-0">
        <Link to="/" className="text-xl font-serif tracking-widest text-charcoal dark:text-dark-text flex items-center gap-2">
          MADHUS
          <span className="text-[10px] uppercase tracking-wider text-charcoal dark:text-dark-text bg-secondary/50 dark:bg-dark-pill px-2 py-0.5 rounded-sm font-sans font-semibold">Admin</span>
        </Link>
      </div>
      
      <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
              location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/dashboard')
                ? "bg-charcoal text-primary dark:bg-dark-pill dark:text-dark-text shadow-md" 
                : "text-charcoal/70 dark:text-dark-muted hover:bg-secondary/20 dark:hover:bg-dark-surfaceHover hover:text-charcoal dark:hover:text-dark-text"
            )}
          >
            <item.icon className={cn("w-5 h-5", location.pathname === item.path ? "text-primary dark:text-dark-text" : "text-charcoal/50 dark:text-dark-muted group-hover:text-charcoal dark:group-hover:text-dark-text")} />
            <span className="relative z-10">{item.label}</span>
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-charcoal/10 dark:border-dark-border shrink-0">
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-red-700/80 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  )

  return (
    <div className={cn(
      "flex h-screen overflow-hidden selection:bg-charcoal selection:text-primary transition-colors duration-300",
      theme === 'dark' ? "dark bg-dark-bg text-dark-text" : "bg-[#FDFBF9] text-charcoal"
    )}>
      
      {/* Desktop Sidebar */}
      <aside className="w-[280px] bg-white dark:bg-dark-surface border-r border-charcoal/5 dark:border-dark-border shadow-[2px_0_10px_rgba(0,0,0,0.02)] hidden lg:flex flex-col z-20 relative transition-colors duration-300">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <>
        {mobileMenuOpen && (
          <>
            <div onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-charcoal/20 backdrop-blur-sm z-40 lg:hidden"
            />
            <aside className="fixed inset-y-0 left-0 w-[280px] bg-white shadow-2xl z-50 flex flex-col lg:hidden"
            >
              <SidebarContent />
            </aside>
          </>
        )}
      </>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        
        {/* Topbar */}
        <header className="h-20 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border-b border-charcoal/5 dark:border-dark-border flex items-center justify-between px-4 lg:px-8 shrink-0 z-10 sticky top-0 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-secondary/20 transition-colors lg:hidden text-charcoal/70"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="hidden sm:flex flex-1"></div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              onClick={toggleTheme}
              className="relative p-2 rounded-full bg-secondary/10 dark:bg-dark-pill text-charcoal/60 dark:text-dark-muted hover:text-charcoal dark:hover:text-dark-text transition-all"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button className="relative p-2 text-charcoal/60 dark:text-dark-muted hover:text-charcoal dark:hover:text-dark-text transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-charcoal dark:bg-dark-accent rounded-full border border-white dark:border-dark-surface" />
            </button>
            
            <div className="h-8 w-px bg-charcoal/10 dark:bg-dark-border hidden sm:block" />

            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-charcoal dark:text-dark-text group-hover:text-charcoal/80 transition-colors">Administrator</span>
                <span className="text-xs text-charcoal/50 dark:text-dark-muted">{user?.email}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-charcoal dark:bg-dark-pill text-primary dark:text-dark-text flex items-center justify-center font-serif text-lg shadow-sm border-2 border-white dark:border-dark-surface">
                {user?.email?.charAt(0).toUpperCase() || "A"}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8">
          <div
            key={location.pathname} className="w-full h-full"
          >
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}

export function AdminLayout() {
  return (
    <ThemeProvider>
      <AdminLayoutContent />
    </ThemeProvider>
  )
}
