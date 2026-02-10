import { ModuleContract } from './types'

class ModuleLoader {
  private modules: Map<string, ModuleContract> = new Map()

  async loadModule(moduleId: string): Promise<ModuleContract | null> {
    // Check if already loaded
    if (this.modules.has(moduleId)) {
      return this.modules.get(moduleId)!
    }

    try {
      // Dynamically import the module
      const module = await import(
        /* webpackExclude: /\.d\.ts$/ */
        `@modular-affiliate/modules/${moduleId}`
      )
      const moduleContract: ModuleContract = module.default

      // Validate module contract
      if (!this.validateContract(moduleContract)) {
        throw new Error(`Invalid module contract for ${moduleId}`)
      }

      this.modules.set(moduleId, moduleContract)
      return moduleContract
    } catch (error) {
      console.error(`Failed to load module ${moduleId}:`, error)
      return null
    }
  }

  validateContract(contract: ModuleContract): boolean {
    return !!(
      contract.module_id &&
      contract.name &&
      contract.version &&
      Array.isArray(contract.routes) &&
      Array.isArray(contract.templates) &&
      Array.isArray(contract.assets) &&
      Array.isArray(contract.permissions)
    )
  }

  getLoadedModules(): ModuleContract[] {
    return Array.from(this.modules.values())
  }

  unloadModule(moduleId: string): boolean {
    return this.modules.delete(moduleId)
  }
}

export const moduleLoader = new ModuleLoader()
