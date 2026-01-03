/**
 * Context-Aware Personality Example
 * 
 * This shows how personality automatically modulates based on route context.
 * No branching logic. Components just ask "How should I behave right now?"
 * 
 * Try this component on different routes:
 * - /launchpad → Full personality (high visual weight, forced rocket_future)
 * - /builder → Medium expression (motion allowed, no sound)
 * - /dashboard → Minimal (low visual weight, no motion/sound)
 * - / (home) → Medium expression (motion allowed)
 */

'use client';

import { motion } from 'framer-motion';
import { usePersonalityExpression } from '@/lib/personality';

export function ContextAwareDemo() {
  const { visual, motion, sound, context } = usePersonalityExpression();
  
  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Context Info Card */}
      <div className={`
        mb-8 p-4 
        ${visual.borders.radius} 
        ${visual.borders.width} 
        bg-gray-50
      `}>
        <h3 className="font-bold mb-2">Current Route Context</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Visual Weight: <code className="bg-white px-2 py-1 rounded">{context.visualWeight}</code></div>
          <div>Motion: <code className="bg-white px-2 py-1 rounded">{context.motionAllowed ? '✓' : '✗'}</code></div>
          <div>Sound: <code className="bg-white px-2 py-1 rounded">{context.soundAllowed ? '✓' : '✗'}</code></div>
          <div>Force Mode: <code className="bg-white px-2 py-1 rounded">{context.forceBrandMode || 'none'}</code></div>
        </div>
      </div>
      
      {/* Example Content Grid */}
      <div className={visual.spacing.section}>
        <h2 className="text-2xl font-bold mb-4">Example Components</h2>
        
        <div className={visual.spacing.content}>
          {/* Card Example */}
          <motion.div
            className={`
              p-6 
              ${visual.borders.radius} 
              ${visual.borders.width} 
              ${visual.borders.style}
              ${visual.depth.card}
              bg-white
            `}
            {...motion.enter}
          >
            <h3 className="font-semibold mb-2">Card Component</h3>
            <p className="text-gray-600">
              Border radius: {visual.borders.radius}<br />
              Shadow: {visual.depth.card}<br />
              Entry animation: {motion.timing.duration}ms
            </p>
          </motion.div>
          
          {/* Interactive Card */}
          <motion.div
            className={`
              p-6 
              ${visual.borders.radius} 
              ${visual.borders.width} 
              ${visual.borders.style}
              ${visual.depth.card}
              ${motion.allowMicroInteractions ? visual.depth.hover : ''}
              bg-white
              cursor-pointer
            `}
            whileHover={motion.allowMicroInteractions ? motion.hover : undefined}
          >
            <h3 className="font-semibold mb-2">Interactive Card</h3>
            <p className="text-gray-600">
              Hover effects: {motion.allowMicroInteractions ? 'Enabled' : 'Disabled'}<br />
              Scale on hover: {motion.hover.scale}x<br />
              Transition: {motion.hover.transition.duration}s
            </p>
          </motion.div>
          
          {/* Button Examples */}
          <div className={visual.spacing.inline}>
            <motion.button
              className={`
                px-6 py-2.5 
                font-medium
                ${visual.borders.radius}
                ${visual.depth.focus}
                bg-blue-600 text-white
              `}
              whileHover={motion.allowMicroInteractions ? motion.hover : undefined}
              whileTap={motion.allowMicroInteractions ? { scale: 0.98 } : undefined}
            >
              Primary Button
            </motion.button>
            
            <motion.button
              className={`
                px-6 py-2.5 
                font-medium
                ${visual.borders.radius}
                ${visual.borders.width}
                ${visual.depth.focus}
                bg-white text-gray-900
              `}
              whileHover={motion.allowMicroInteractions ? motion.hover : undefined}
            >
              Secondary Button
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Visual Tokens Display */}
      <details className="mt-8 p-4 border rounded">
        <summary className="cursor-pointer font-semibold">View Resolved Tokens</summary>
        <pre className="mt-4 text-xs overflow-auto">
{JSON.stringify({
  visual,
  motion: {
    timing: motion.timing,
    allowStagger: motion.allowStagger,
    allowPageTransitions: motion.allowPageTransitions,
    allowMicroInteractions: motion.allowMicroInteractions
  },
  sound: {
    enabled: sound.enabled,
    profile: sound.profile
  }
}, null, 2)}
        </pre>
      </details>
    </div>
  );
}
