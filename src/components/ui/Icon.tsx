import type { IconBaseProps, IconType } from 'react-icons'
import {
  TbAccessible,
  TbActivityHeartbeat,
  TbArrowDown,
  TbArrowLeft,
  TbArrowRight,
  TbArrowUp,
  TbArrowUpRight,
  TbBrandFigma,
  TbBrandGithub,
  TbBrandLinkedin,
  TbBrandNpm,
  TbBriefcase,
  TbCheck,
  TbChevronDown,
  TbChevronRight,
  TbCircleCheck,
  TbCircleX,
  TbCode,
  TbComponents,
  TbCopy,
  TbExternalLink,
  TbFileText,
  TbHeartRateMonitor,
  TbMail,
  TbMaximize,
  TbPlayerPlay,
  TbRotateClockwise,
  TbX,
} from 'react-icons/tb'

export type IconProps = IconBaseProps

function icon(Component: IconType) {
  return function Icon({ size = 16, style, ...props }: IconProps) {
    return (
      <Component
        aria-hidden='true'
        focusable='false'
        size={size}
        strokeWidth={1.75}
        {...props}
        style={{ display: 'inline-block', flexShrink: 0, verticalAlign: '-0.15em', ...style }}
      />
    )
  }
}

export const ArrowUpRightIcon = /* @__PURE__ */ icon(TbArrowUpRight)
export const ArrowRightIcon = /* @__PURE__ */ icon(TbArrowRight)
export const ArrowLeftIcon = /* @__PURE__ */ icon(TbArrowLeft)
export const ArrowDownIcon = /* @__PURE__ */ icon(TbArrowDown)
export const ArrowUpIcon = /* @__PURE__ */ icon(TbArrowUp)
export const ChevronDownIcon = /* @__PURE__ */ icon(TbChevronDown)
export const ChevronRightIcon = /* @__PURE__ */ icon(TbChevronRight)
export const CloseIcon = /* @__PURE__ */ icon(TbX)
export const CheckIcon = /* @__PURE__ */ icon(TbCheck)
export const CopyIcon = /* @__PURE__ */ icon(TbCopy)
export const CodeIcon = /* @__PURE__ */ icon(TbCode)
export const GithubIcon = /* @__PURE__ */ icon(TbBrandGithub)
export const FigmaIcon = /* @__PURE__ */ icon(TbBrandFigma)
export const NpmIcon = /* @__PURE__ */ icon(TbBrandNpm)
export const LinkedinIcon = /* @__PURE__ */ icon(TbBrandLinkedin)
export const MailIcon = /* @__PURE__ */ icon(TbMail)
export const ComponentIcon = /* @__PURE__ */ icon(TbComponents)
export const AccessibilityIcon = /* @__PURE__ */ icon(TbAccessible)
export const PlayIcon = /* @__PURE__ */ icon(TbPlayerPlay)
export const ResetIcon = /* @__PURE__ */ icon(TbRotateClockwise)
export const MaximizeIcon = /* @__PURE__ */ icon(TbMaximize)
export const ExternalLinkIcon = /* @__PURE__ */ icon(TbExternalLink)
export const ActivityIcon = /* @__PURE__ */ icon(TbActivityHeartbeat)
export const HealthIcon = /* @__PURE__ */ icon(TbHeartRateMonitor)
export const FileTextIcon = /* @__PURE__ */ icon(TbFileText)
export const BriefcaseIcon = /* @__PURE__ */ icon(TbBriefcase)
export const CircleCheckIcon = /* @__PURE__ */ icon(TbCircleCheck)
export const CircleXIcon = /* @__PURE__ */ icon(TbCircleX)
