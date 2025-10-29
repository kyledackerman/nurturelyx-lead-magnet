import { ThemeProvider } from "./ThemeProvider"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { useAuth } from "@/hooks/useAuth"
import { useEffect } from "react"
import { useTheme } from "next-themes"

// Inner component that handles theme enforcement based on auth status
function ThemeEnforcer({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { setTheme } = useTheme()

  useEffect(() => {
    // Force dark mode for unauthenticated users
    if (!user) {
      setTheme("dark")
    }
  }, [user, setTheme])

  return <>{children}</>
}

export function EnforcedThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { user } = useAuth()

  // For unauthenticated users: force dark mode, disable system theme
  if (!user) {
    return (
      <ThemeProvider {...props} forcedTheme="dark" enableSystem={false}>
        {children}
      </ThemeProvider>
    )
  }

  // For authenticated users: allow full theme control
  return (
    <ThemeProvider {...props} defaultTheme="dark" enableSystem>
      <ThemeEnforcer>{children}</ThemeEnforcer>
    </ThemeProvider>
  )
}
