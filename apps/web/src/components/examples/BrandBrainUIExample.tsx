/**
 * Example: Using BrandBrain UI Expression Profile
 * 
 * This demonstrates how to access and use the UIExpressionProfile
 * from BrandBrain to control UI behavior.
 */

'use client';

import { useBrandBrain } from '@/hooks/useBrandBrain';
import { motion } from 'framer-motion';

export function BrandBrainUIExample() {
  const { ui, loading } = useBrandBrain();

  if (loading) {
    return <div>Loading brand configuration...</div>;
  }

  // Access hero rules
  const heroRules = ui.hero;
  const canUseRocketHero = heroRules.variants.includes('rocket');
  const motionIntensity = heroRules.motionIntensity;

  // Access typography rules
  const typographyRules = ui.typography;
  const textTone = typographyRules.tone;

  // Access surface rules
  const surfaceRules = ui.surfaces;
  const borderStyle = surfaceRules.borderStyle === 'rounded' ? 'rounded-lg' : 
                      surfaceRules.borderStyle === 'sharp' ? 'rounded-none' : 
                      'rounded-md';

  // Access micro-interaction rules
  const interactions = ui.microInteractions;
  const canHover = interactions.hoverAllowed;
  const canGlitch = interactions.glitchAllowed;

  // Access sound rules
  const soundRules = ui.sound;
  const canPlayChecklist = soundRules.ambientProfiles.includes('checklist');

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold">BrandBrain UI Expression Example</h2>

      {/* Hero Section Example */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Hero Configuration</h3>
        <div className={`p-6 bg-blue-50 ${borderStyle}`}>
          <p><strong>Allowed Variants:</strong> {heroRules.variants.join(', ')}</p>
          <p><strong>Motion Intensity:</strong> {motionIntensity}</p>
          <p><strong>Visual Noise:</strong> {heroRules.visualNoise}</p>
          <p><strong>Can Use Rocket Hero:</strong> {canUseRocketHero ? '✓' : '✗'}</p>
        </div>
      </section>

      {/* Typography Example */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Typography Rules</h3>
        <div className={`p-6 bg-purple-50 ${borderStyle}`}>
          <p><strong>Tone:</strong> {textTone}</p>
          <p><strong>Emphasis Style:</strong> {typographyRules.emphasisStyle}</p>
          <p className={
            typographyRules.emphasisStyle === 'underline' ? 'underline' :
            typographyRules.emphasisStyle === 'highlight' ? 'bg-yellow-200' :
            typographyRules.emphasisStyle === 'strike' ? 'line-through' : ''
          }>
            Example text with {typographyRules.emphasisStyle} emphasis
          </p>
        </div>
      </section>

      {/* Surface Styling Example */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Surface Styling</h3>
        <div className={`
          p-6 bg-green-50 ${borderStyle}
          ${surfaceRules.depth === 'flat' ? '' : 
            surfaceRules.depth === 'soft' ? 'shadow-md' : 
            'shadow-xl'}
        `}>
          <p><strong>Depth:</strong> {surfaceRules.depth}</p>
          <p><strong>Border Style:</strong> {surfaceRules.borderStyle}</p>
        </div>
      </section>

      {/* Micro-interactions Example */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Micro-interactions</h3>
        <div className="space-y-4">
          <motion.button
            className={`px-6 py-3 bg-blue-600 text-white ${borderStyle}`}
            whileHover={canHover ? { scale: 1.05 } : undefined}
            whileTap={canHover ? { scale: 0.95 } : undefined}
          >
            {canHover ? 'Hover Enabled' : 'Hover Disabled'}
          </motion.button>

          <div className={`p-4 bg-gray-100 ${borderStyle}`}>
            <p><strong>Hover Allowed:</strong> {canHover ? '✓' : '✗'}</p>
            <p><strong>Glitch Allowed:</strong> {canGlitch ? '✓' : '✗'}</p>
            <p><strong>Pulse Allowed:</strong> {interactions.pulseAllowed ? '✓' : '✗'}</p>
          </div>
        </div>
      </section>

      {/* Sound Configuration Example */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Sound Configuration</h3>
        <div className={`p-6 bg-yellow-50 ${borderStyle}`}>
          <p><strong>Ambient Profiles:</strong> {soundRules.ambientProfiles.join(', ')}</p>
          <p><strong>Max Volume:</strong> {soundRules.maxVolume}</p>
          <p><strong>Can Play Checklist:</strong> {canPlayChecklist ? '✓' : '✗'}</p>
        </div>
      </section>
    </div>
  );
}

/**
 * Simple usage example in any component:
 * 
 * ```tsx
 * function MyComponent() {
 *   const { ui } = useBrandBrain();
 *   const heroRules = ui.hero;
 *   
 *   // Use hero rules to control UI
 *   if (heroRules.variants.includes('rocket')) {
 *     return <RocketHero />;
 *   }
 *   
 *   // Use motion intensity
 *   const duration = {
 *     none: 0,
 *     low: 0.2,
 *     medium: 0.3,
 *     high: 0.5
 *   }[heroRules.motionIntensity];
 *   
 *   return <motion.div animate={{ opacity: 1 }} transition={{ duration }}>
 *     Content
 *   </motion.div>;
 * }
 * ```
 */
