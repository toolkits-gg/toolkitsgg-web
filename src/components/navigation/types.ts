import type React from 'react';

export type NavLinkLinks = {
  label: string;
  link: string;
}[];

type NavLinkBase = {
  label: string;
  icon: React.FC | undefined;
  initiallyOpened: boolean;
  links?: NavLinkLinks;
};

export type NavLink = NavLinkBase &
  (
    | { url: string; links?: undefined }
    | { url?: undefined; links: NavLinkLinks }
  );
