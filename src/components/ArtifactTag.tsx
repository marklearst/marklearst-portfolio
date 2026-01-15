import { getArtifactTagColor } from '@/lib/content/artifact-tags'

export default function ArtifactTag({ tag }: { tag: string }) {
  const color = getArtifactTagColor(tag)

  return (
    <span
      className='inline-flex items-center px-3 py-1.5 text-[11px] font-mono rounded-md border'
      style={{
        backgroundColor: `${color}12`,
        borderColor: `${color}40`,
        color,
      }}
    >
      <span>{tag}</span>
    </span>
  )
}
