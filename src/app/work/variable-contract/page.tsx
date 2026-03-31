'use client'

import CaseStudyLayout from '@/components/CaseStudyLayout'
import {
  ExternalLinkIcon,
  GitHubIcon,
} from '@/components/CaseStudyLinkIcons'
import {
  CaseStudyMutedList,
  CaseStudyMutedText,
  CaseStudySubheading,
} from '@/components/CaseStudyTypography'
import { getProjectBySlug } from '@/data/projects'
import { getCategoryColor } from '@/lib/project-categories'
import { MONOKAI } from '@/lib/monokai-colors'

export default function VariableContractPage() {
  const project = getProjectBySlug('variable-contract')
  const accent = getCategoryColor(project.categoryColor)

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
          icon: <GitHubIcon />,
        },
        {
          label: 'Variables Contract',
          href: 'https://variables-contract.vercel.app/',
          icon: <ExternalLinkIcon />,
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
              <CaseStudyMutedList className='space-y-3'>
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
              </CaseStudyMutedList>
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

              <CaseStudySubheading color={accent}>
                Contract Structure
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Defines a standardized JSON contract format:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
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
              </CaseStudyMutedList>

              <CaseStudySubheading color={accent}>
                Semantic Versioning
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Applies SemVer to design variables:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
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
              </CaseStudyMutedList>

              <CaseStudySubheading color={accent}>
                Validation Schema
              </CaseStudySubheading>
              <CaseStudyMutedText>
                JSON Schema for validating contracts:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>Validates contract structure before deployment</li>
                <li>Ensures DTCG compliance for token definitions</li>
                <li>Checks for breaking changes between versions</li>
                <li>Prevents accidental variable deletions or renames</li>
              </CaseStudyMutedList>

              <CaseStudySubheading color={accent}>
                Tool Adapters
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Reference implementations for cross-tool sync:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
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
              </CaseStudyMutedList>

              <CaseStudySubheading color={accent}>
                Governance Model
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Defines approval workflows:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>Required approvers for MAJOR vs MINOR vs PATCH changes</li>
                <li>
                  Multi-brand approval gates (e.g., GM's 4-brand scenario)
                </li>
                <li>
                  Rollback procedures when deployed tokens break production
                </li>
                <li>Audit trail for all variable changes</li>
              </CaseStudyMutedList>
            </div>
          ),
        },
        {
          title: 'Technical Implementation',
          content: (
            <div className='space-y-6'>
              <CaseStudySubheading color={accent} className='mt-0'>
                DTCG Compliance
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Aligned with W3C Design Tokens Community Group:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>Uses DTCG 2025.10 token format as foundation</li>
                <li>Extends spec with versioning and governance metadata</li>
                <li>Maintains compatibility with existing DTCG tools</li>
                <li>Contributed feedback to W3C community discussions</li>
              </CaseStudyMutedList>

              <CaseStudySubheading color={accent}>
                Real-World Testing
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Developed from hands-on experience:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>Patterns tested during Aurora (GM) implementation</li>
                <li>Governance model based on real 4-brand token workflows</li>
                <li>Validation rules informed by production token failures</li>
                <li>
                  Adapter designs driven by Figma Variables → Style Dictionary
                  pipelines
                </li>
              </CaseStudyMutedList>

              <CaseStudySubheading color={accent}>
                Documentation & Spec
              </CaseStudySubheading>
              <CaseStudyMutedText>
                Comprehensive specification docs:
              </CaseStudyMutedText>
              <CaseStudyMutedList className='space-y-2'>
                <li>Contract schema definition with examples</li>
                <li>Versioning strategy guidelines</li>
                <li>Adapter implementation patterns</li>
                <li>Governance workflow templates</li>
                <li>Migration guides from existing token systems</li>
              </CaseStudyMutedList>
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
              <CaseStudyMutedList className='space-y-4'>
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
              </CaseStudyMutedList>
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
