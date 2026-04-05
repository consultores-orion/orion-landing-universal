import type { ModuleSchemaDef } from '@/lib/modules/types'

export const comparisonSchema: ModuleSchemaDef = {
  key: 'comparison',
  name: { es: 'Tabla comparativa', en: 'Comparison table' },
  description: {
    es: 'Tabla comparativa de planes o productos con checkmarks y valores personalizados.',
    en: 'Comparison table for plans or products with checkmarks and custom values.',
  },
  version: 1,
  fields: [
    {
      key: 'title',
      type: 'text',
      label: { es: 'Título (opcional)', en: 'Title (optional)' },
      isMultilingual: true,
      required: false,
      validation: { maxLength: 120 },
      order: 1,
    },
    {
      key: 'subtitle',
      type: 'text',
      label: { es: 'Subtítulo (opcional)', en: 'Subtitle (optional)' },
      isMultilingual: true,
      required: false,
      validation: { maxLength: 250 },
      order: 2,
    },
    {
      key: 'columns',
      type: 'list',
      label: { es: 'Columnas (planes)', en: 'Columns (plans)' },
      description: {
        es: 'Define cada columna (plan/producto). Una puede marcarse como destacada.',
        en: 'Define each column (plan/product). One can be marked as highlighted.',
      },
      isMultilingual: false,
      required: true,
      order: 3,
      listItemSchema: [
        {
          key: 'id',
          type: 'text',
          label: { es: 'ID único', en: 'Unique ID' },
          isMultilingual: false,
          required: true,
        },
        {
          key: 'name',
          type: 'text',
          label: { es: 'Nombre del plan', en: 'Plan name' },
          isMultilingual: true,
          required: true,
        },
        {
          key: 'is_highlighted',
          type: 'boolean',
          label: { es: '¿Columna destacada?', en: 'Highlighted column?' },
          isMultilingual: false,
          required: false,
          defaultValue: false,
        },
        {
          key: 'badge',
          type: 'text',
          label: { es: 'Badge (ej: Recomendado)', en: 'Badge (e.g., Recommended)' },
          isMultilingual: true,
          required: false,
        },
      ],
    },
    {
      key: 'rows',
      type: 'list',
      label: { es: 'Filas (características)', en: 'Rows (features)' },
      description: {
        es: 'Cada fila es una característica con su valor por columna.',
        en: 'Each row is a feature with its value per column.',
      },
      isMultilingual: false,
      required: true,
      order: 4,
      listItemSchema: [
        {
          key: 'id',
          type: 'text',
          label: { es: 'ID único', en: 'Unique ID' },
          isMultilingual: false,
          required: true,
        },
        {
          key: 'feature',
          type: 'text',
          label: { es: 'Nombre de la característica', en: 'Feature name' },
          isMultilingual: true,
          required: true,
        },
        {
          key: 'values',
          type: 'text',
          label: { es: 'Valores por columna (JSON)', en: 'Values per column (JSON)' },
          isMultilingual: false,
          required: false,
        },
      ],
    },
  ],
}
