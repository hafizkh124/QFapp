
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard, DollarSign, Receipt, TrendingUp, Users, Lightbulb, ListPlus, UserCog } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const allNavItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'employee'] },
  { href: '/sales', label: 'Sales', icon: DollarSign, roles: ['admin', 'employee'] },
  { href: '/menu', label: 'Menu', icon: ListPlus, roles: ['admin', 'employee'] }, 
  { href: '/expenses', label: 'Expenses', icon: Receipt, roles: ['admin', 'employee'] }, 
  { href: '/profits', label: 'Profits', icon: TrendingUp, roles: ['admin', 'employee'] }, 
  { href: '/performance', label: 'Performance', icon: Users, roles: ['admin', 'employee'] },
  { href: '/insights', label: 'Insights AI', icon: Lightbulb, roles: ['admin', 'employee'] }, 
  { href: '/admin/employee-management', label: 'Employee Mgmt', icon: UserCog, roles: ['admin'] },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = allNavItems.filter(item => user?.role && item.roles.includes(user.role));

  if (!user) return null; // Or a loading state for nav items

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
