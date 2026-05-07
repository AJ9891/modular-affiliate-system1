export type MotionDirection = 'up' | 'down' | 'left' | 'right' | 'none'

export interface MotionStep {
  delayMs: number
  durationMs: number
  direction: MotionDirection
  distancePx: number
  scaleFrom: number
  opacityFrom: number
}

export const onboardingMotion: Record<'enter' | 'exit' | 'stagger', MotionStep> = {
  enter: {
    delayMs: 0,
    durationMs: 260,
    direction: 'up',
    distancePx: 12,
    scaleFrom: 0.98,
    opacityFrom: 0,
  },
  exit: {
    delayMs: 0,
    durationMs: 180,
    direction: 'down',
    distancePx: 8,
    scaleFrom: 1,
    opacityFrom: 1,
  },
  stagger: {
    delayMs: 60,
    durationMs: 240,
    direction: 'up',
    distancePx: 10,
    scaleFrom: 0.99,
    opacityFrom: 0,
  },
}

export function motionTransform(direction: MotionDirection, distancePx: number): string {
  switch (direction) {
    case 'up':
      return `translateY(${distancePx}px)`
    case 'down':
      return `translateY(-${distancePx}px)`
    case 'left':
      return `translateX(${distancePx}px)`
    case 'right':
      return `translateX(-${distancePx}px)`
    default:
      return 'translate3d(0,0,0)'
  }
}

export function motionStyle(step: MotionStep): {
  transitionDuration: string
  transitionDelay: string
  transform: string
  opacity: number
  scale: number
} {
  return {
    transitionDuration: `${step.durationMs}ms`,
    transitionDelay: `${step.delayMs}ms`,
    transform: motionTransform(step.direction, step.distancePx),
    opacity: step.opacityFrom,
    scale: step.scaleFrom,
  }
}
