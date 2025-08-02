'use client';

import {
  LucideChevronUp,
  LucideCog,
  LucideLightbulb,
  LucideLogOut,
  LucideShieldCheck,
  LucideUser,
} from 'lucide-react';
import { Avatar } from '@/components/avatar';
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/dropdown';
import { SidebarItem } from '@/components/sidebar';
import { signOut } from '@/features/auth/actions/sign-out';
import { signInPath, signUpPath } from '@/paths';
import { Button } from '@/components/button';

type UserMenuProps = {
  user?: {
    username: string;
    email: string;
  };
};

const UserMenu = ({ user }: UserMenuProps) => {
  if (!user) {
    return (
      <div className="flex w-full flex-1 items-center justify-between">
        <Button href={signUpPath()} tooltipContent="Sign up">
          Sign Up
        </Button>
        <Button href={signInPath()} tooltipContent="Sign in">
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <Dropdown>
      <DropdownButton as={SidebarItem}>
        <span className="flex min-w-0 items-center gap-3">
          <Avatar className="size-10" square alt="User avatar" initials="TK" />
          <span className="min-w-0">
            <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
              {user?.username}
            </span>
            <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
              {user?.email}
            </span>
          </span>
        </span>

        <LucideChevronUp />
      </DropdownButton>
      <DropdownMenu className="min-w-64" anchor="top start">
        <DropdownItem href="/my-profile">
          <LucideUser />
          <DropdownLabel>My profile</DropdownLabel>
        </DropdownItem>
        <DropdownItem href="/settings">
          <LucideCog />
          <DropdownLabel>Settings</DropdownLabel>
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem href="/privacy-policy">
          <LucideShieldCheck />
          <DropdownLabel>Privacy policy</DropdownLabel>
        </DropdownItem>
        <DropdownItem href="/share-feedback">
          <LucideLightbulb />
          <DropdownLabel>Share feedback</DropdownLabel>
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem onClick={signOut}>
          <LucideLogOut className="h-4 w-4" />
          <DropdownLabel>Sign out</DropdownLabel>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );

  // return (
  //   <SidebarMenu>
  //     <SidebarMenuItem>
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <SidebarMenuButton
  //             size="lg"
  //             className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
  //           >
  //             <Avatar className="h-8 w-8 rounded-lg">
  //               {/* <AvatarImage src={user.avatar} alt={user.name} /> */}
  //               <AvatarFallback className="rounded-lg">CN</AvatarFallback>
  //             </Avatar>
  //             <div className="grid flex-1 text-left text-sm leading-tight">
  //               <span className="truncate font-medium">{user.username}</span>
  //               <span className="truncate text-xs">{user.email}</span>
  //             </div>
  //             <LucideChevronsUpDown className="ml-auto size-4" />
  //           </SidebarMenuButton>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent
  //           className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
  //           side={isMobile ? 'bottom' : 'right'}
  //           align="end"
  //           sideOffset={4}
  //         >
  //           <DropdownMenuLabel className="p-0 font-normal">
  //             <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
  //               <Avatar className="h-8 w-8 rounded-lg">
  //                 {/* <AvatarImage src={user.avatar} alt={user.name} /> */}
  //                 <AvatarFallback className="rounded-lg">CN</AvatarFallback>
  //               </Avatar>
  //               <div className="grid flex-1 text-left text-sm leading-tight">
  //                 <span className="truncate font-medium">{user.username}</span>
  //                 <span className="truncate text-xs">{user.email}</span>
  //               </div>
  //             </div>
  //           </DropdownMenuLabel>
  //           <DropdownMenuSeparator />
  //           <DropdownMenuGroup>
  //             <DropdownMenuItem>
  //               <LucideSparkles />
  //               Upgrade to Pro
  //             </DropdownMenuItem>
  //           </DropdownMenuGroup>
  //           <DropdownMenuSeparator />
  //           <DropdownMenuGroup>
  //             <DropdownMenuItem>
  //               <LucideBadgeCheck />
  //               Account
  //             </DropdownMenuItem>
  //             <DropdownMenuItem>
  //               <LucideCreditCard />
  //               Billing
  //             </DropdownMenuItem>
  //             <DropdownMenuItem>
  //               <LucideBell />
  //               Notifications
  //             </DropdownMenuItem>
  //           </DropdownMenuGroup>
  //           <DropdownMenuSeparator />
  //           <DropdownMenuItem asChild>
  //             <form action={signOut}>
  //               <LucideLogOut className="mr-2 h-4 w-4" />
  //               <button type="submit">Sign Out</button>
  //             </form>
  //           </DropdownMenuItem>
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     </SidebarMenuItem>
  //   </SidebarMenu>
  // );
};

export { UserMenu };
