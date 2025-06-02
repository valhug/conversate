"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button, NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "@conversate/ui"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { UserIcon, LogOutIcon, SettingsIcon, Upload } from "lucide-react"

export function Header() {
  const { data: session, status } = useSession()
  const user = session?.user
  const isLoading = status === "loading"

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
  }
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">C</span>
          </div>
          <span className="text-xl font-bold text-foreground">Conversate</span>
        </Link>        {/* Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
              {/* Show Practice, Upload, and Progress only for authenticated users */}
            {user && (
              <>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/conversation" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      Practice
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/upload" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      Upload
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/progress" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      Progress
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </>
            )}
            
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>{/* Auth Section */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {isLoading ? (
            // Loading state
            <div className="h-8 w-20 animate-pulse bg-muted rounded"></div>
          ) : user ? (
            // Authenticated user dropdown
            <DropdownMenu>              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  <span className="hidden md:inline">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/progress" className="flex items-center gap-2">
                    <SettingsIcon className="h-4 w-4" />
                    <span>Progress</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/upload" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    <span>Upload</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/conversation" className="flex items-center gap-2">
                    <span>Practice</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                >
                  <LogOutIcon className="h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Non-authenticated user buttons
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}