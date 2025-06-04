import { SidebarTrigger } from '@/components/ui/sidebar';

const Header = () => {
  return (
    <header className="bg-background flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16">
      <div className="flex w-full items-center gap-2 px-4">
        <div className="flex flex-1 items-center justify-between">
          <SidebarTrigger className="-ml-1" />
        </div>
      </div>
    </header>
  );
};

export { Header };
