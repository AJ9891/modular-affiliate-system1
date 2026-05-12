import type { AIFlightTelemetryEvent, CalmInsight, TelemetrySink } from './types'

const consoleTelemetrySink: TelemetrySink = {
  emit: (event) => {
    // Placeholder sink for local instrumentation until a provider is connected.
    console.info('[ai.telemetry]', JSON.stringify(event))
  },
}

export function buildCalmInsight(input: {
  whatChanged: string
  whyItMatters: string
  nextStep: string
}): CalmInsight {
  return {
    whatChanged: input.whatChanged,
    whyItMatters: input.whyItMatters,
    nextStep: input.nextStep,
  }
}

export function emitAIFlightEvent(
  event: AIFlightTelemetryEvent,
  sink: TelemetrySink = consoleTelemetrySink,
): void {
  sink.emit(event)
}
