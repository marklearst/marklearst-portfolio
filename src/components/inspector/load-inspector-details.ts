let loading: Promise<typeof import('./InspectorDetails')> | undefined
/** Activation follows the download, so its first render can use the resolved view. */
export let LoadedInspectorDetails: typeof import('./InspectorDetails')['default'] | undefined

/** Intent warming and activation share a request. A failed download remains retryable. */
export function loadInspectorDetails() {
  loading ??= import('./InspectorDetails').then((module) => {
    LoadedInspectorDetails = module.default
    return module
  }).catch((error) => {
    loading = undefined
    throw error
  })
  return loading
}
