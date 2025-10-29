import { ThemeProvider } from "./ThemeProvider"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function EnforcedThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Always force dark mode - simple and effective
  return (
    <ThemeProvider {...props} forcedTheme="dark" enableSystem={false}>
      {children}
    </ThemeProvider>
  )
}
