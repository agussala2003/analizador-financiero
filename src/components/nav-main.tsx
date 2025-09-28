import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroupLabel,
} from "../components/ui/sidebar"
import { NavLink } from "react-router-dom"

export function NavMain({
  items, label
}: {
  items: {
    title: string
    url: string
    icon?: any
  }[],
  label?: string
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarGroupLabel>{label || "General"}</SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) => (
            <NavLink to={item.url} key={item.url}>
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            </NavLink>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
