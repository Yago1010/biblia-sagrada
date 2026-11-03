import type { ReactNode } from 'react';

type IconProps = { className?: string };

const base = 'h-5 w-5';

function svg(path: ReactNode, className?: string) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${base} ${className ?? ''}`}
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}

export function IconMenu({ className }: IconProps) {
  return svg(<><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>, className);
}

export function IconSearch({ className }: IconProps) {
  return svg(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>, className);
}

export function IconX({ className }: IconProps) {
  return svg(<><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>, className);
}

export function IconSun({ className }: IconProps) {
  return svg(
    <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    className,
  );
}

export function IconMoon({ className }: IconProps) {
  return svg(<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />, className);
}

export function IconArrowLeft({ className }: IconProps) {
  return svg(<><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></>, className);
}

export function IconChevronLeft({ className }: IconProps) {
  return svg(<path d="m14 6-6 6 6 6" />, className);
}

export function IconChevronRight({ className }: IconProps) {
  return svg(<path d="m10 6 6 6-6 6" />, className);
}

export function IconCopy({ className }: IconProps) {
  return svg(
    <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></>,
    className,
  );
}

export function IconShare({ className }: IconProps) {
  return svg(
    <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" /></>,
    className,
  );
}

export function IconBookmark({ className }: IconProps) {
  return svg(<path d="M6 4h12v17l-6-4.2L6 21Z" />, className);
}

export function IconCheck({ className }: IconProps) {
  return svg(<path d="m5 13 4 4L19 7" />, className);
}
