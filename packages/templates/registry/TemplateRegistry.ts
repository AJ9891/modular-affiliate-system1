import type { TemplateDefinition } from '../contracts'
import { validateTemplateMetadata } from '../contracts'

export class TemplateRegistry {
  private definitions = new Map<string, TemplateDefinition>()

  register(definition: TemplateDefinition): void {
    const errors = validateTemplateMetadata(definition.metadata)
    if (errors.length > 0) {
      throw new Error(`Invalid template metadata: ${errors.join(', ')}`)
    }

    this.definitions.set(definition.metadata.templateId, definition)
  }

  get(templateId: string): TemplateDefinition | undefined {
    return this.definitions.get(templateId)
  }
}
