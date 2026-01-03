/**
 * Personality-Aware Components
 * 
 * These components ask the personality system how to behave.
 * Expressions are TASTEFUL, PERIPHERAL, FELT MORE THAN NOTICED.
 * 
 * Key principle: Components don't know WHY they look different.
 * They just know HOW based on current personality AND route context.
 */

'use client';

import { motion } from 'framer-motion';
import { usePersonalityExpression } from '@/lib/personality';

/**
 * Card: Adapts depth and motion to personality + route context
 * 
 * Launchpad (high): Full shadow, smooth animations
 * Builder (medium): Balanced expression
 * Dashboard (low): Flat, no hover effects
 */
interface PersonalityCardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export function PersonalityCard({ children, className = '', interactive = false }: PersonalityCardProps) {
  const { visual, motion } = usePersonalityExpression();
  
  const baseClass = `
    p-6 
    ${visual.borders.radius} 
    ${visual.borders.width} 
    ${visual.borders.style}
    ${visual.depth.card}
    ${interactive && motion.allowMicroInteractions ? visual.depth.hover : ''}
    ${className}
  `;
  
  if (!motion.allowMicroInteractions) {
    return <div className={baseClass}>{children}</div>;
  }
  
  return (
    <motion.div
      className={baseClass}
      whileHover={interactive ? motion.hover : undefined}
    >
      {children}
    </motion.div>
  );
}

/**
 * Button: Respects animation budget + route context
 * 
 * Launchpad: Full personality expression
 * Builder: Subtle animations
 * Dashboard: Instant, no motion
 */
interface PersonalityButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function PersonalityButton({ 
  children, 
  onClick, 
  variant = 'primary',
  className = '' 
}: PersonalityButtonProps) {
  const { visual, motion } = usePersonalityExpression();
  
  const variantClass = variant === 'primary' 
    ? 'bg-blue-600 text-white hover:bg-blue-700' 
    : 'bg-gray-100 text-gray-900 hover:bg-gray-200';
  
  const baseClass = `
    px-6 py-2.5 font-medium
    ${visual.borders.radius}
    ${variantClass}
    ${motion.timing.duration === 0 ? '' : 'transition-colors'}
    ${className}
  `;
  
  if (motion.timing.duration === 0) {
    return (
      <button className={baseClass} onClick={onClick}>
        {children}
      </button>
    );
  }
  
  return (
    <motion.button
      className={baseClass}
      onClick={onClick}
      whileHover={motion.hover}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
}

/**
 * Progress Indicator: Shows personality through motion
 * 
 * Rocket Future: Smooth ease-out, optimistic
 * Anti-Guru: Instant jump
 * AI Meltdown: Jittery progress
 */
interface PersonalityProgressProps {
  value: number; // 0-100
  className?: string;
}

export function PersonalityProgress({ value, className = '' }: PersonalityProgressProps) {
  const { personality } = usePersonality();
  const visual = resolveVisualTokens(personality);
  const motion = resolveMotionTokens(personality);
  
  return (
    <div className={`h-2 bg-gray-200 overflow-hidden ${visual.borders.radius} ${className}`}>
      <motion.div
        className="h-full bg-blue-600"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{
          duration: motion.timing.duration / 1000,
          ease: motion.timing.easing
        }}
      />
    </div>
  );
}

/**
 * Empty State: Personality shows in the mood
 * 
 * Rocket Future: Optimistic, forward-looking
 * Anti-Guru: Direct, no fluff
 * AI Meltdown: Self-aware about the absurdity
 */
interface PersonalityEmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function PersonalityEmptyState({ 
  title, 
  description, 
  action,
  className = '' 
}: PersonalityEmptyStateProps) {
  const { personality } = usePersonality();
  const visual = resolveVisualTokens(personality);
  const motion = resolveMotionTokens(personality);
  
  return (
    <motion.div
      className={`
        text-center py-12 
        ${visual.spacing.content}
        ${className}
      `}
      {...motion.enter}
    >
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}

/**
 * Success Confirmation: Celebrates appropriately
 * 
 * Rocket Future: Gentle glow, smooth entry
 * Anti-Guru: Plain checkmark, instant
 * AI Meltdown: Glitchy celebration
 */
interface PersonalitySuccessProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function PersonalitySuccess({ 
  message, 
  onDismiss,
  className = '' 
}: PersonalitySuccessProps) {
  const { personality } = usePersonality();
  const visual = resolveVisualTokens(personality);
  const motion = resolveMotionTokens(personality);
  
  const glowEffect = visual.effects.glow ? 'ring-2 ring-green-500 ring-opacity-50' : '';
  
  return (
    <motion.div
      className={`
        p-4 bg-green-50 border border-green-200
        ${visual.borders.radius}
        ${glowEffect}
        ${className}
      `}
      {...motion.enter}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-green-900">{message}</p>
        {onDismiss && (
          <button 
            onClick={onDismiss}
            className="text-green-600 hover:text-green-800"
          >
            ×
          </button>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Loading State: Waiting feels different
 * 
 * Rocket Future: Smooth spinner
 * Anti-Guru: Plain text or simple indicator
 * AI Meltdown: "Thinking..." with occasional glitch
 */
interface PersonalityLoadingProps {
  message?: string;
  className?: string;
}

export function PersonalityLoading({ 
  message = 'Loading...', 
  className = '' 
}: PersonalityLoadingProps) {
  const { personality } = usePersonality();
  const motion = resolveMotionTokens(personality);
  
  // Anti-Guru: Just text
  if (motion.timing.duration === 0) {
    return <div className={`text-gray-600 ${className}`}>{message}</div>;
  }
  
  // AI Meltdown: Glitchy text
  if (personality.visuals.motionProfile === 'unstable') {
    return (
      <motion.div
        className={`text-gray-600 ${className}`}
        animate={{
          x: [0, -1, 1, -1, 0],
          opacity: [1, 0.9, 1, 0.9, 1]
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 2
        }}
      >
        {message}
      </motion.div>
    );
  }
  
  // Rocket Future: Smooth spinner
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div
        className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      <span className="text-gray-600">{message}</span>
    </div>
  );
}
