import type { ReactNode, SVGProps } from 'react'

export type IconProps = SVGProps<SVGSVGElement>

function Icon({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export function IconDownload(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3v11.5" />
      <path d="m7.75 10.25 4.25 4.25 4.25-4.25" />
      <path d="M4.5 17.5V19a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-1.5" />
    </Icon>
  )
}

export function IconCheck(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m4.5 12.5 5 5 10-11" />
    </Icon>
  )
}

export function IconChevronDown(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 9.5 6 6 6-6" />
    </Icon>
  )
}

export function IconArrowRight(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 12h15" />
      <path d="m13.5 6 6 6-6 6" />
    </Icon>
  )
}

export function IconArrowUp(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 19.5V4.5" />
      <path d="m5.75 10.75 6.25-6.25 6.25 6.25" />
    </Icon>
  )
}

export function IconMenu(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </Icon>
  )
}

export function IconClose(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </Icon>
  )
}

export function IconGlobe(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.4 2.5 3.6 5.4 3.6 8.5S14.4 18 12 20.5C9.6 18 8.4 15.1 8.4 12S9.6 6 12 3.5Z" />
    </Icon>
  )
}

export function IconExternalLink(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14 4.5h5.5V10" />
      <path d="M19.5 4.5 11 13" />
      <path d="M18 14.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.5" />
    </Icon>
  )
}

export function IconMail(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="m4.5 8 7.5 5 7.5-5" />
    </Icon>
  )
}

export function IconLinkedin(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <path d="M8 10.5V16" />
      <path d="M8 7.75v.01" />
      <path d="M12 16v-3.25a2.25 2.25 0 0 1 4.5 0V16" />
      <path d="M12 10.5V16" />
    </Icon>
  )
}

export function IconGithub(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9.5 20.5v-3a2.5 2.5 0 0 1 .5-1.5c-3 0-5-1.4-5-4.8 0-1.2.4-2.2 1.2-3a3.6 3.6 0 0 1 .1-2.4S7 5.4 8.7 6.6a9.4 9.4 0 0 1 4.6 0C15 5.4 15.7 5.3 15.7 5.3a3.6 3.6 0 0 1 .1 2.4c.8.8 1.2 1.8 1.2 3 0 3.4-2 4.8-5 4.8a2.5 2.5 0 0 1 .5 1.5v3.5" />
      <path d="M9.5 19c-2.5.8-3.5-.6-4-1.4" />
    </Icon>
  )
}

export function IconSmartphone(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
      <path d="M10.5 18.5h3" />
    </Icon>
  )
}

export function IconMonitor(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2.5" y="4" width="19" height="12.5" rx="2.5" />
      <path d="M9 20.5h6" />
      <path d="M12 16.5v4" />
    </Icon>
  )
}

export function IconShield(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.5 5 6v5.5c0 4.2 2.9 7.4 7 9 4.1-1.6 7-4.8 7-9V6l-7-2.5Z" />
      <path d="m9.25 12 2 2 3.5-4" />
    </Icon>
  )
}

export function IconDatabase(props: IconProps) {
  return (
    <Icon {...props}>
      <ellipse cx="12" cy="6.5" rx="7" ry="3" />
      <path d="M5 6.5v11c0 1.7 3.1 3 7 3s7-1.3 7-3v-11" />
      <path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
    </Icon>
  )
}

export function IconCloudOff(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6.5 18.5h10a3.5 3.5 0 0 0 .6-6.95 5.2 5.2 0 0 0-6.6-4.9" />
      <path d="M15.2 18.5A4.4 4.4 0 0 0 16 18.5" />
      <path d="M9.4 8.2A5.2 5.2 0 0 0 6 13.3a3.6 3.6 0 0 0 .5 5.2" />
      <path d="M4 4l16 16" />
    </Icon>
  )
}

export function IconLock(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </Icon>
  )
}

export function IconListChecks(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 5h2" />
      <path d="m4 11 1.5 1.5L9 9" />
      <path d="m4 17.5 1.5 1.5L9 15.5" />
      <path d="M11.5 5.5H20" />
      <path d="M11.5 11H20" />
      <path d="M11.5 17H20" />
    </Icon>
  )
}

export function IconCpu(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="6.5" y="6.5" width="11" height="11" rx="2.5" />
      <path d="M10 2.5v4" />
      <path d="M14 2.5v4" />
      <path d="M10 17.5v4" />
      <path d="M14 17.5v4" />
      <path d="M2.5 10h4" />
      <path d="M2.5 14h4" />
      <path d="M17.5 10h4" />
      <path d="M17.5 14h4" />
    </Icon>
  )
}

export function IconFileCode(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M13 3.5H7.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V9z" />
      <path d="M13 3.5V9h5.5" />
      <path d="m10.25 12.5-1.5 2 1.5 2" />
      <path d="m14.75 12.5 1.5 2-1.5 2" />
    </Icon>
  )
}

export function IconCookie(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20.5 12a8.5 8.5 0 1 1-8.5-8.5c-.3 1.9.3 3.2 1.5 4 1.2.8 2.8.8 4.6.3.2 1.5.8 2.7 2.4 3.2Z" />
      <path d="M8.75 9.5h.01" />
      <path d="M13.5 14h.01" />
      <path d="M8.5 14.75h.01" />
    </Icon>
  )
}

export function IconBell(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 4 1.5 5.5 1.5 5.5H5S6.5 14 6.5 10Z" />
      <path d="M10 18.5a2 2 0 0 0 4 0" />
    </Icon>
  )
}
