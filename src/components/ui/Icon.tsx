import type { IconBaseProps, IconType } from 'react-icons'
import {
  TbAccessible,
  TbActivityHeartbeat,
  TbArrowDown,
  TbArrowLeft,
  TbArrowUp,
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
  TbFileText,
  TbHeartRateMonitor,
  TbMail,
  TbMaximize,
  TbPlayerPlay,
  TbRotateClockwise,
  TbX,
} from 'react-icons/tb'

export type IconProps = IconBaseProps

function icon(Component: IconType, options: { brand?: boolean; action?: string } = {}) {
  return function Icon({ size = 18, style, ...props }: IconProps) {
    return (
      <Component
        aria-hidden='true'
        focusable='false'
        size={size}
        strokeWidth={2}
        data-brand-icon={options.brand || undefined}
        data-action-icon={options.action}
        {...props}
        style={{ display: 'inline-block', flexShrink: 0, verticalAlign: '-0.15em', ...style }}
      />
    )
  }
}

export function ArrowUpRightIcon({ size = 18, style, ...props }: IconProps) {
  return <svg aria-hidden='true' focusable='false' width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' data-action-icon='external' {...props} style={{ display: 'inline-block', flexShrink: 0, verticalAlign: '-0.15em', ...style }}><path className='icon-arrow' d='M6 18 18 6M7 6h11v11' /></svg>
}
export function ArrowRightIcon({ size = 18, style, ...props }: IconProps) {
  return <svg aria-hidden='true' focusable='false' width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' data-action-icon='forward' {...props} style={{ display: 'inline-block', flexShrink: 0, verticalAlign: '-0.15em', ...style }}><path className='icon-arrow' d='M4 12h15m-6-6 6 6-6 6' /></svg>
}
export const ArrowLeftIcon = /* @__PURE__ */ icon(TbArrowLeft, { action: 'back' })
export const ArrowDownIcon = /* @__PURE__ */ icon(TbArrowDown, { action: 'down' })
export const ArrowUpIcon = /* @__PURE__ */ icon(TbArrowUp, { action: 'up' })
export const ChevronDownIcon = /* @__PURE__ */ icon(TbChevronDown)
export const ChevronRightIcon = /* @__PURE__ */ icon(TbChevronRight)
export const CloseIcon = /* @__PURE__ */ icon(TbX)
export const CheckIcon = /* @__PURE__ */ icon(TbCheck)
export const CopyIcon = /* @__PURE__ */ icon(TbCopy)
export const CodeIcon = /* @__PURE__ */ icon(TbCode)
export const GithubIcon = /* @__PURE__ */ icon(TbBrandGithub, { brand: true })
export const FigmaIcon = /* @__PURE__ */ icon(TbBrandFigma, { brand: true })
export const NpmIcon = /* @__PURE__ */ icon(TbBrandNpm, { brand: true })
export const LinkedinIcon = /* @__PURE__ */ icon(TbBrandLinkedin, { brand: true })
export const MailIcon = /* @__PURE__ */ icon(TbMail)
export const ComponentIcon = /* @__PURE__ */ icon(TbComponents)
export const AccessibilityIcon = /* @__PURE__ */ icon(TbAccessible)
export const PlayIcon = /* @__PURE__ */ icon(TbPlayerPlay)
export const ResetIcon = /* @__PURE__ */ icon(TbRotateClockwise)
export const MaximizeIcon = /* @__PURE__ */ icon(TbMaximize)
export function ExternalLinkIcon({ size = 18, style, ...props }: IconProps) {
  return <svg aria-hidden='true' focusable='false' width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' data-action-icon='external' {...props} style={{ display: 'inline-block', flexShrink: 0, verticalAlign: '-0.15em', ...style }}><path d='M10 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4' /><path className='icon-arrow' d='M12 12 20 4m-6 0h6v6' /></svg>
}
export const ActivityIcon = /* @__PURE__ */ icon(TbActivityHeartbeat)
export const HealthIcon = /* @__PURE__ */ icon(TbHeartRateMonitor)
export const FileTextIcon = /* @__PURE__ */ icon(TbFileText)
export const BriefcaseIcon = /* @__PURE__ */ icon(TbBriefcase)
export const CircleCheckIcon = /* @__PURE__ */ icon(TbCircleCheck)
export const CircleXIcon = /* @__PURE__ */ icon(TbCircleX)
