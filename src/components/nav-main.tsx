import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroupLabel,
} from "../components/ui/sidebar"

import { NavLink } from "react-router-dom"
import React from "react"


interface NavMainItem {
  title: string;
  url: string;
  icon?: React.ComponentType<unknown> | null;
  [key: string]: unknown;
}


interface NavMainProps {
  items: NavMainItem[];
  label?: string;
}

export function NavMain({ items, label }: NavMainProps) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarGroupLabel>{label ?? "General"}</SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) => (
            <NavLink to={item.url} key={item.url}>
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon ? React.createElement(item.icon) : null}
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
