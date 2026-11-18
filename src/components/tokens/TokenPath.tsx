import { Fragment } from 'react'

export default function TokenPath({ path }: { path: string }) {
  return path.split('.').map((segment, i) => (
    <Fragment key={i}>
      {i > 0 && <>.<wbr /></>}
      {segment}
    </Fragment>
  ))
}
