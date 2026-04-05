import type { ModuleSchemaDef } from '@/lib/modules/types'

export const faqSchema: ModuleSchemaDef = {
  key: 'faq',
  name: { es: 'Preguntas frecuentes', en: 'FAQ' },
  description: {
    es: 'Sección de preguntas y respuestas en acordeón nativo HTML.',
    en: 'FAQ section with native HTML accordion.',
  },
  version: 1,
  fields: [
    {
      key: 'title',
      type: 'text',
      label: { es: 'Título', en: 'Title' },
      description: {
        es: 'Título principal de la sección de FAQ.',
        en: 'Main title of the FAQ section.',
      },
      isMultilingual: true,
      required: true,
      validation: { minLength: 3, maxLength: 100 },
      order: 1,
    },
    {
      key: 'subtitle',
      type: 'text',
      label: { es: 'Subtítulo', en: 'Subtitle' },
      isMultilingual: true,
      required: false,
      validation: { maxLength: 200 },
      order: 2,
    },
    {
      key: 'items',
      type: 'list',
      label: { es: 'Preguntas y respuestas', en: 'Questions and answers' },
      description: {
        es: 'Lista de pares pregunta/respuesta.',
        en: 'List of question/answer pairs.',
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
          key: 'question',
          type: 'text',
          label: { es: 'Pregunta', en: 'Question' },
          isMultilingual: true,
          required: true,
        },
        {
          key: 'answer',
          type: 'textarea',
          label: { es: 'Respuesta', en: 'Answer' },
          isMultilingual: true,
          required: true,
        },
      ],
    },
    {
      key: 'layout',
      type: 'select',
      label: { es: 'Disposición', en: 'Layout' },
      isMultilingual: false,
      required: false,
      defaultValue: 'single',
      selectOptions: [
        { value: 'single', label: { es: 'Una columna', en: 'Single column' } },
        { value: 'two-columns', label: { es: 'Dos columnas', en: 'Two columns' } },
      ],
      order: 4,
    },
  ],
}
