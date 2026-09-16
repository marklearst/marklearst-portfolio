import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism'
import CodeBlockFrame from './CodeBlockFrame'
import { codeTheme } from './code-theme'
import styles from './CodeBlock.module.css'

interface CodeBlockProps {
  code: string
  language?: string
  showLineNumbers?: boolean
  analyticsLabel?: string
}

export default function CodeBlock({
  code,
  language = 'typescript',
  showLineNumbers = false,
  analyticsLabel,
}: CodeBlockProps) {
  return (
    <CodeBlockFrame code={code} language={language} analyticsLabel={analyticsLabel}>
      <div className={styles.source} tabIndex={0} role='region' aria-label={language + ' code'}>
        <SyntaxHighlighter
          language={language}
          style={codeTheme}
          showLineNumbers={showLineNumbers}
          customStyle={{
            background: 'transparent',
            padding: 0,
            margin: 0,
            fontSize: '16px',
            borderRadius: 0,
            overflow: 'visible',
          }}
          codeTagProps={{
            style: {
              fontFamily: '"MonoLisa", "SF Mono", Consolas, monospace',
              fontFeatureSettings: '"liga" 1, "calt" 1',
              backgroundColor: 'transparent',
              padding: 0,
              borderRadius: 0,
            },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </CodeBlockFrame>
  )
}
