# Ambient Audio Files

This directory contains ambient sound loops for the BrandBrain personality system.

## Required Files

### 1. rocket-checklist-ambient.mp3
**Profile**: checklist  
**Description**: Steady, focused, checklist-ticking energy  
**Specs**:
- Duration: 20-40 seconds
- Seamless loop (start = end)
- Very low volume baked in (around -20dB to -25dB)
- Mono or soft stereo
- No voices
- Sample rate: 44.1kHz or 48kHz
- Bitrate: 128kbps or higher

**Suggested characteristics**:
- Subtle mechanical clicks
- Soft rhythmic tones
- Gentle countdown atmosphere
- Mission-control vibe

### 2. rocket-hum-ambient.mp3 (optional)
**Profile**: hum  
**Description**: Smooth, confident, engines-warming energy  
**Specs**: Same as above

**Suggested characteristics**:
- Low-frequency hum
- Smooth continuous tone
- Slight modulation
- Rocket-engine warmup feeling

### 3. glitch-ambient.mp3 (optional)
**Profile**: glitch  
**Description**: Digital, fractured, AI-meltdown energy  
**Specs**: Same as above

**Suggested characteristics**:
- Occasional digital artifacts
- Bit-crushed textures
- Sparse, unpredictable
- Controlled chaos

## Integration

Audio files are automatically loaded by the `LaunchpadAmbientSound` component based on:
1. **BrandBrain UI Expression Profile** - Which profiles are enabled
2. **User Context** - Current page/section (launchpad, dashboard, etc.)
3. **User Preference** - localStorage toggle via `AmbientSoundToggle`

See `apps/web/src/lib/brand-brain/sound-behavior.ts` for the full resolution logic.

## Testing

After adding audio files:

1. Navigate to `/launchpad`
2. Sound should play automatically for new users
3. Toggle with 🔊 button in header
4. Preference persists across sessions
5. Sound stops on non-launchpad pages

## Creating Seamless Loops

Tools for creating seamless loops:
- **Audacity**: Effect → Change Speed/Pitch, then crossfade ends
- **Adobe Audition**: Loop analyzer and seamless looping tools
- **Logic Pro**: Apple Loops and bounce to loop

Tips:
- Start with natural sustain/pad sounds
- Use fadeout/fadein at loop point
- Test the loop for "clicks" or discontinuities
- Keep it subtle - should fade into background
