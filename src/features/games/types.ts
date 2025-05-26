export type GameConfig = {
  name: string;
  logo: React.ReactElement<HTMLElement>;
  path: () => string;
  themeCSSClass: string;
};
