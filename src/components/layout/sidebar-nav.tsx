'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard, DollarSign, Receipt, TrendingUp, Users, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/sales', label: 'Sales', icon: DollarSign },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/profits', label: 'Profits', icon: TrendingUp },
  { href: '/performance', label: 'Performance', icon: Users },
  { href: '/insights', label: 'Insights AI', icon: Lightbulb },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu className="px-2 py-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton
                isActive={isActive}
                tooltip={{ children: item.label, side: 'right', align: 'center' }}
                className={cn(isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground')}
              >
                <item.icon className="w-5 h-5" />
                <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
