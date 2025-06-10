type ListProps = {
  items: string[];
  ordered?: boolean;
  className?: string;
};

const List = ({ items, ordered = false, className }: ListProps) => {
  const baseClasses = 'my-6 ml-6 list-disc [&>li]:mt-2';
  const orderedClasses = 'list-decimal';
  const classes = [baseClasses, ordered ? orderedClasses : ''].join(' ').trim();

  return (
    <div className={className}>
      {ordered ? (
        <ol className={classes}>
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ol>
      ) : (
        <ul className={classes}>
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export { List };
