let loading: Promise<typeof import('./FloatingInspectorPanel')> | undefined

/** Shared by intent preloading and React, so opening never starts a second request. */
export function loadFloatingInspector() {
  loading ??= import('./FloatingInspectorPanel').catch((error) => {
    loading = undefined
    throw error
  })
  return loading
}
