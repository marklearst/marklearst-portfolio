'use client'

import CaseStudyLayout from '@/components/CaseStudyLayout'
import { getProjectBySlug } from '@/data/projects'
import { MONOKAI } from '@/lib/monokai-colors'

export default function VariableContractPage() {
  const project = getProjectBySlug('variable-contract')

  return (
    <CaseStudyLayout
      title={project.title}
      category={project.category}
      categoryColor={project.categoryColor}
      description={project.description}
      role={project.role}
      timeline={project.timeline}
      technologies={project.technologies}
      links={[
        {
          label: 'GitHub Specification',
          href: 'https://github.com/marklearst/variables-contract',
          icon: (
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
              <path
                fillRule='evenodd'
                d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z'
                clipRule='evenodd'
              />
            </svg>
          ),
        },
        {
          label: 'Variables Contract',
          href: 'https://variables-contract.vercel.app/',
          icon: (
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
              <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z' />
            </svg>
          ),
        },
      ]}
      impact={[
        {
          metric: 'DTCG',
          description:
            'Compliant with W3C Design Tokens Community Group 2025.10 specification',
        },
        {
          metric: 'Tool Lock-In',
          description:
            'Solves vendor lock-in by defining portable variable structures',
        },
        {
          metric: 'Open Spec',
          description:
            'Public draft specification driving community discussion',
        },
      ]}
      gradient={project.caseStudyGradient}
      sections={[
        {
          title: 'The Problem',
          content: (
            <div className='space-y-6'>
              <p className='text-lg leading-relaxed'>
                Design systems teams face a fundamental infrastructure
                challenge: there's no standard for how design variables should
                be versioned, governed, and synchronized across tools. This
                creates:
              </p>
              <ul
                className='space-y-3 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>
                  <strong>Tool lock-in:</strong> Figma Variables, Adobe, and
                  code-based token systems use incompatible formats
                </li>
                <li>
                  <strong>Broken design-code handoff:</strong> No standard way
                  to track which variable version is deployed in production
                </li>
                <li>
                  <strong>Version control gaps:</strong> Design tools lack
                  Git-like versioning for variables
                </li>
                <li>
                  <strong>Governance chaos:</strong> No defined approval
                  workflows for token changes affecting multiple brands
                </li>
                <li>
                  <strong>Sync failures:</strong> Manual processes to keep
                  Figma, Style Dictionary, and codebases aligned
                </li>
              </ul>
              <p className='text-lg leading-relaxed'>
                After building Aurora at GM and seeing these pain points
                firsthand, I realized the industry needed an open specification
                defining how variables should be structured, versioned, and
                validated across the entire design-to-code pipeline.
              </p>
            </div>
          ),
        },
        {
          title: 'The Solution',
          content: (
            <div className='space-y-6'>
              <p className='text-lg leading-relaxed'>
                <strong>Variable Contract</strong> is an open specification that
                defines JSON structures, validation rules, versioning
                strategies, and adapters for design variable governance and
                cross-tool synchronization.
              </p>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.orange }}
              >
                Contract Structure
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Defines a standardized JSON contract format:
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>
                  <strong>Metadata:</strong> Contract version, schema version,
                  source of truth, timestamps
                </li>
                <li>
                  <strong>Variable definitions:</strong> DTCG-compliant token
                  structures with type safety
                </li>
                <li>
                  <strong>Modes/themes:</strong> Multi-brand or multi-theme
                  variable sets
                </li>
                <li>
                  <strong>Dependencies:</strong> Track relationships between
                  variables (aliases, references)
                </li>
                <li>
                  <strong>Change log:</strong> Git-style commit history for
                  variable changes
                </li>
              </ul>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.orange }}
              >
                Semantic Versioning
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Applies SemVer to design variables:
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>
                  <strong>MAJOR:</strong> Breaking changes (variable renamed or
                  removed)
                </li>
                <li>
                  <strong>MINOR:</strong> Backward-compatible additions (new
                  variables added)
                </li>
                <li>
                  <strong>PATCH:</strong> Value updates without structural
                  changes
                </li>
                <li>
                  Enables teams to understand impact before deploying token
                  updates
                </li>
              </ul>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.orange }}
              >
                Validation Schema
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                JSON Schema for validating contracts:
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>Validates contract structure before deployment</li>
                <li>Ensures DTCG compliance for token definitions</li>
                <li>Checks for breaking changes between versions</li>
                <li>Prevents accidental variable deletions or renames</li>
              </ul>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.orange }}
              >
                Tool Adapters
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Reference implementations for cross-tool sync:
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>
                  <strong>Figma Variables Adapter:</strong> Export Figma
                  Variables to contract format
                </li>
                <li>
                  <strong>Style Dictionary Adapter:</strong> Convert contracts
                  to Style Dictionary tokens
                </li>
                <li>
                  <strong>Git Adapter:</strong> Track contract changes in
                  version control
                </li>
                <li>
                  <strong>CI/CD Integration:</strong> Validate contracts in pull
                  requests
                </li>
              </ul>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.orange }}
              >
                Governance Model
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Defines approval workflows:
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>Required approvers for MAJOR vs MINOR vs PATCH changes</li>
                <li>
                  Multi-brand approval gates (e.g., GM's 4-brand scenario)
                </li>
                <li>
                  Rollback procedures when deployed tokens break production
                </li>
                <li>Audit trail for all variable changes</li>
              </ul>
            </div>
          ),
        },
        {
          title: 'Technical Implementation',
          content: (
            <div className='space-y-6'>
              <h3
                className='text-2xl font-mono mb-4'
                style={{ color: MONOKAI.orange }}
              >
                DTCG Compliance
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Aligned with W3C Design Tokens Community Group:
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>Uses DTCG 2025.10 token format as foundation</li>
                <li>Extends spec with versioning and governance metadata</li>
                <li>Maintains compatibility with existing DTCG tools</li>
                <li>Contributed feedback to W3C community discussions</li>
              </ul>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.orange }}
              >
                Real-World Testing
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Developed from hands-on experience:
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>Patterns tested during Aurora (GM) implementation</li>
                <li>Governance model based on real 4-brand token workflows</li>
                <li>Validation rules informed by production token failures</li>
                <li>
                  Adapter designs driven by Figma Variables → Style Dictionary
                  pipelines
                </li>
              </ul>

              <h3
                className='text-2xl font-mono mt-8 mb-4'
                style={{ color: MONOKAI.orange }}
              >
                Documentation & Spec
              </h3>
              <p
                className='leading-relaxed'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                Comprehensive specification docs:
              </p>
              <ul
                className='space-y-2 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>Contract schema definition with examples</li>
                <li>Versioning strategy guidelines</li>
                <li>Adapter implementation patterns</li>
                <li>Governance workflow templates</li>
                <li>Migration guides from existing token systems</li>
              </ul>
            </div>
          ),
        },
        {
          title: 'Impact & Vision',
          content: (
            <div className='space-y-6'>
              <p className='text-lg leading-relaxed'>
                Variable Contract addresses foundational infrastructure gaps in
                the design systems ecosystem:
              </p>
              <ul
                className='space-y-4 ml-6 list-disc'
                style={{ color: `${MONOKAI.foreground}b3` }}
              >
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    Solves tool lock-in
                  </strong>{' '}
                  by defining portable variable structures that work across
                  Figma, Adobe, and code-based systems
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    Enables Git-like versioning
                  </strong>{' '}
                  for design variables, bringing version control discipline to
                  design tools
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    Standardizes governance
                  </strong>{' '}
                  with approval workflows that scale to multi-brand design
                  systems
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    Prevents breaking changes
                  </strong>{' '}
                  through SemVer and validation, protecting production
                  applications
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    DTCG-compliant
                  </strong>{' '}
                  foundation ensures compatibility with W3C standards and
                  tooling ecosystem
                </li>
                <li>
                  <strong style={{ color: MONOKAI.foreground }}>
                    Open specification
                  </strong>{' '}
                  drives community discussion and potential standardization
                </li>
              </ul>
              <p className='text-lg leading-relaxed mt-8'>
                The specification is published on GitHub as a living document,
                with ongoing development informed by design systems
                practitioners and W3C community feedback. The goal is to
                establish an industry standard for design variable governance
                that design systems teams can adopt regardless of their tool
                stack.
              </p>
            </div>
          ),
        },
      ]}
    />
  )
}
