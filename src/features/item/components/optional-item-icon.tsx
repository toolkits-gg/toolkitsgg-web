import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tooltip';
import { LucideBolt } from 'lucide-react';

const OptionalItemIcon = () => {
  return (
    <div className="bg-background-solid border-accent1-600 rounded-xl border border-dashed p-1">
      <Tooltip>
        <TooltipTrigger className="flex h-4 w-4 items-center justify-center">
          <LucideBolt className="text-accent1-400 h-3.5 w-3.5" />
        </TooltipTrigger>
        <TooltipContent className="border-accent1-600">
          Optional Item
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
export { OptionalItemIcon };
