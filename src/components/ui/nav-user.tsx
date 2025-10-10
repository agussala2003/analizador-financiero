import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./sidebar"
import { CreditCard, EllipsisVertical, LogOut, UserCircle } from "lucide-react"
import { useConfig } from "../../hooks/use-config";
import { User } from "@supabase/supabase-js";
import { Profile } from "../../types/auth";

export function NavUser({
  user, signOut, profile
}: {
  user: User
  signOut: () => void
  profile: Profile
}) {
  const { isMobile } = useSidebar()
  const config = useConfig();
  const userRole = profile.role
  const apiLimit = config.plans.roleLimits[userRole as keyof typeof config.plans.roleLimits]
  const callsMade = profile.api_calls_made

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{profile?.first_name + " " + profile?.last_name || "Anónimo"}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
              <EllipsisVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-72 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{profile?.first_name + " " + profile?.last_name || "Anónimo"}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="text-nowrap w-full">
              <DropdownMenuItem className="flex items-center">
                <UserCircle className="mr-2 size-4" />
                <span className="font-medium">Plan de mi perfil:</span> <span className="ml-auto capitalize font-semibold">{userRole}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center">
                <CreditCard className="mr-2 size-4" />
                <span className="font-medium">Uso de API:</span> <span className="ml-auto font-semibold">{callsMade} / {apiLimit === Infinity ? '∞' : apiLimit}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              <LogOut />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}