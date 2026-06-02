import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { authService } from "../services/firebase/authService"
import { Button } from "../ui/Button"
import { Input } from "../ui/Form"
import { Eye, EyeOff } from "lucide-react"
import { SEO } from "../components/SEO"

export function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { user, isAdmin, setUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && isAdmin) {
      navigate("/dashboard", { replace: true })
    }
  }, [user, isAdmin, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError("Please fill in all fields.")
      return
    }

    try {
      setLoading(true)
      
      // Development Bypass for unconnected Firebase
      if (import.meta.env.VITE_FIREBASE_API_KEY === undefined || import.meta.env.VITE_FIREBASE_API_KEY === "" || import.meta.env.VITE_FIREBASE_API_KEY === "mock-key") {
        if (email === import.meta.env.VITE_ADMIN_EMAIL) {
          // Manually set the user context to simulate login
          setUser({
            uid: "dev-admin-id",
            email: email,
            displayName: "Admin",
            role: "admin",
            createdAt: new Date().toISOString()
          });
          return;
        } else {
          throw new Error("Invalid credentials");
        }
      }

      await authService.login(email, password)
    } catch (err: any) {
      console.error(err)
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential' || err.message === "Invalid credentials") {
        setError("Invalid credentials. Please try again.")
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many failed attempts. Please try again later.")
      } else {
        setError("An error occurred during authentication.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (user && !isAdmin) {
    return (
      <main className="min-h-screen bg-brand-pale flex flex-col items-center justify-center p-4 font-sans text-center">
        <SEO title="Access Denied" noindex={true} />
        <div className="bg-white p-8 rounded-xl shadow-sm border border-charcoal/10 max-w-md w-full space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 className="text-2xl font-serif text-charcoal">Access Restricted</h2>
          <p className="text-charcoal/60">
            You are currently logged in as <strong>{user.email}</strong>, which does not have administrator privileges.
          </p>
          <p className="text-xs text-charcoal/40 uppercase tracking-wider font-semibold">
            Expected Admin: prosenjitdey2143@gmail.com
          </p>
          <div className="pt-4">
            <Button 
              onClick={async () => {
                await authService.logout();
                window.location.reload();
              }} 
              className="w-full bg-charcoal text-white hover:bg-charcoal/90"
            >
              Log Out & Sign In as Admin
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-brand-pale flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <SEO title="Admin Login" noindex={true} />
      <div className="w-full max-w-[420px] mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif text-charcoal mb-2">Admin Portal</h1>
          <p className="text-charcoal/60 text-sm tracking-wide">Secure access to Madhus Fashion House</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Input 
                type="email" 
                placeholder="Email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-charcoal/20 focus:border-charcoal rounded-none px-0 py-3"
              />
            </div>
            
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-charcoal/20 focus:border-charcoal rounded-none px-0 py-3 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-800 bg-red-50 p-3 text-sm rounded shadow-sm border border-red-100"
            >
              {error}
            </p>
          )}

          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full h-12 shadow-soft-hover mt-4 tracking-wider"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-12 text-center text-xs text-charcoal/40 tracking-widest uppercase">
          Unauthorized Access is Prohibited
        </div>
      </div>
    </main>
  )
}


