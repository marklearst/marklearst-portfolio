export interface EvidenceImage {
  src: string
  width: number
  height: number
  title: string
  alt: string
  caption: string
  sourceUrl?: string
}

export const stageSizes = '(max-width: 768px) 100vw, 1024px'
export const viewerSizes = '100vw'

interface ImageEnvironment {
  width: number
  pixelRatio: number
}

interface PreparationDependencies {
  decode: (item: EvidenceImage, sizes: string) => Promise<void>
  readEnvironment: () => ImageEnvironment
}

interface PreparationOptions {
  isCurrent: () => boolean
  onPending: () => void
}

interface PreparedImage {
  ready: boolean
  promise: Promise<void>
}

/** Prepares the responsive candidates for both gallery surfaces before a swap. */
export function createEvidenceImagePreparation({ decode, readEnvironment }: PreparationDependencies) {
  const images = new Map<string, PreparedImage>()

  function imageKey(item: EvidenceImage) {
    const { width, pixelRatio } = readEnvironment()
    return JSON.stringify([item.src, item.width, item.height, width, pixelRatio])
  }

  return async function prepare(item: EvidenceImage, { isCurrent, onPending }: PreparationOptions): Promise<boolean> {
    while (isCurrent()) {
      const key = imageKey(item)
      let prepared = images.get(key)
      if (!prepared) {
        const entry: PreparedImage = {
          ready: false,
          // Promise boundaries also turn a synchronous decoder error into a
          // failed request, so the gallery can offer the same retry path.
          promise: Promise.all([stageSizes, viewerSizes].map(sizes =>
            Promise.resolve().then(() => decode(item, sizes)),
          )).then(() => { entry.ready = true }),
        }
        prepared = entry
        images.set(key, entry)
      }

      if (!prepared.ready) onPending()
      try {
        if (!prepared.ready) await prepared.promise
      } catch (error) {
        // Multiple selections may await one candidate. An older rejection
        // must not remove the replacement entry created by a newer retry.
        if (images.get(key) === prepared) images.delete(key)
        if (!isCurrent()) return false
        if (key !== imageKey(item)) continue
        throw error
      }

      if (!isCurrent()) return false
      // Width or pixel density may change while decoding. The committed image
      // must be ready for the environment where it will actually be shown.
      if (key !== imageKey(item)) continue
      return true
    }
    return false
  }
}
