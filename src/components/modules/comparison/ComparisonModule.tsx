import type { ModuleProps } from '@/lib/modules/types'
import { ModuleWrapper } from '@/components/shared/ModuleWrapper'
import { getContentForLang } from '@/lib/i18n/utils'
import type { ComparisonContent, CellValue } from './comparison.types'
import type React from 'react'

type ComparisonModuleProps = ModuleProps<ComparisonContent>

function renderCell(
  cell: CellValue | undefined,
  isHighlighted: boolean,
  t: (f: Record<string, string> | string | null | undefined) => string,
): React.ReactNode {
  if (!cell) return <span style={{ color: 'var(--color-muted-foreground)' }}>—</span>
  if (cell.type === 'check') {
    return (
      <span
        className="text-lg font-bold"
        style={{
          color: isHighlighted ? 'var(--color-primary-foreground)' : 'var(--color-primary)',
        }}
      >
        ✓
      </span>
    )
  }
  if (cell.type === 'cross') {
    return (
      <span className="text-lg" style={{ color: 'var(--color-muted-foreground)' }}>
        ✗
      </span>
    )
  }
  return <span>{t(cell.value)}</span>
}

export default function ComparisonModule({
  content,
  styles,
  moduleId,
  language,
  defaultLanguage,
}: ComparisonModuleProps) {
  const t = (field: Record<string, string> | string | null | undefined): string =>
    getContentForLang(field, language, defaultLanguage)

  const columns = content.columns ?? []
  const rows = content.rows ?? []

  return (
    <ModuleWrapper moduleId={moduleId} sectionKey="comparison" styles={styles}>
      {/* Header */}
      {(content.title ?? content.subtitle) ? (
        <div className="mb-10 text-center">
          {content.title && (
            <h2
              className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ color: 'var(--color-foreground)' }}
            >
              {t(content.title)}
            </h2>
          )}
          {content.subtitle && (
            <p className="text-base sm:text-lg" style={{ color: 'var(--color-muted-foreground)' }}>
              {t(content.subtitle)}
            </p>
          )}
        </div>
      ) : null}

      {/* Responsive table wrapper */}
      <div
        className="overflow-x-auto rounded-xl"
        style={{ border: '1px solid var(--color-border)' }}
      >
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr>
              {/* Empty first header cell for feature column */}
              <th
                className="px-5 py-4 text-left text-sm font-semibold"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-foreground)',
                  width: '30%',
                }}
              />

              {/* Column headers */}
              {columns.map((col) => (
                <th
                  key={col.id}
                  className="px-5 py-4 text-center text-sm font-bold"
                  style={
                    col.is_highlighted
                      ? {
                          backgroundColor: 'var(--color-primary)',
                          color: 'var(--color-primary-foreground)',
                        }
                      : {
                          backgroundColor: 'var(--color-surface)',
                          color: 'var(--color-foreground)',
                        }
                  }
                >
                  <span className="block text-base font-bold">{t(col.name)}</span>
                  {col.is_highlighted && col.badge && (
                    <span
                      className="mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{
                        backgroundColor: 'var(--color-primary-foreground)',
                        color: 'var(--color-primary)',
                      }}
                    >
                      {t(col.badge)}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={row.id}
                style={{
                  backgroundColor:
                    rowIndex % 2 === 0 ? 'var(--color-background)' : 'var(--color-surface)',
                }}
              >
                {/* Feature name cell */}
                <td
                  className="px-5 py-4 text-sm font-semibold"
                  style={{
                    color: 'var(--color-foreground)',
                    borderTop: '1px solid var(--color-border)',
                  }}
                >
                  {t(row.feature)}
                </td>

                {/* Value cells */}
                {columns.map((col) => {
                  const cell = row.values[col.id]
                  return (
                    <td
                      key={col.id}
                      className="px-5 py-4 text-center text-sm"
                      style={{
                        borderTop: '1px solid var(--color-border)',
                        color: col.is_highlighted
                          ? 'var(--color-primary-foreground)'
                          : 'var(--color-foreground)',
                        backgroundColor: col.is_highlighted
                          ? 'color-mix(in srgb, var(--color-primary) 8%, transparent)'
                          : undefined,
                      }}
                    >
                      {renderCell(cell, col.is_highlighted ?? false, t)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ModuleWrapper>
  )
}
