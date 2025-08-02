import {
  CatalystButton,
  type CatalystButtonProps,
} from '@/components/catalyst-button';
import { Text } from '@/components/text';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tooltip';

type ButtonProps = CatalystButtonProps & {
  tooltipContent: React.ReactNode | undefined;
};

const Button = ({ tooltipContent, ...catalystButtonProps }: ButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <CatalystButton {...catalystButtonProps} />
      </TooltipTrigger>
      {tooltipContent && (
        <TooltipContent>
          <Text>{tooltipContent}</Text>
        </TooltipContent>
      )}
    </Tooltip>
  );
};

export { Button };
