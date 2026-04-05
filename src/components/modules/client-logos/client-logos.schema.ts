import type { ModuleSchemaDef } from '@/lib/modules/types'

export const clientLogosSchema: ModuleSchemaDef = {
  key: 'client_logos',
  name: { es: 'Logos de Clientes', en: 'Client Logos' },
  description: {
    es: 'Franja con logos de clientes o partners en movimiento continuo (marquee).',
    en: 'Strip with client or partner logos in continuous motion (marquee).',
  },
  version: 1,
  fields: [
    {
      key: 'showTitle',
      type: 'boolean',
      label: { es: 'Mostrar título', en: 'Show title' },
      isMultilingual: false,
      required: false,
      defaultValue: true,
      order: 1,
    },
    {
      key: 'title',
      type: 'text',
      label: { es: 'Título opcional', en: 'Optional title' },
      isMultilingual: true,
      required: false,
      validation: { maxLength: 100 },
      order: 2,
    },
    {
      key: 'logos',
      type: 'list',
      label: { es: 'Logos', en: 'Logos' },
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
          label: { es: 'Nombre de la empresa', en: 'Company name' },
          isMultilingual: false,
          required: true,
          validation: { maxLength: 80 },
        },
        {
          key: 'logoImage',
          type: 'image',
          label: { es: 'Logo', en: 'Logo' },
          isMultilingual: false,
          required: true,
        },
      ],
    },
    {
      key: 'speed',
      type: 'select',
      label: { es: 'Velocidad del marquee', en: 'Marquee speed' },
      isMultilingual: false,
      required: false,
      defaultValue: 'normal',
      selectOptions: [
        { value: 'slow', label: { es: 'Lento', en: 'Slow' } },
        { value: 'normal', label: { es: 'Normal', en: 'Normal' } },
        { value: 'fast', label: { es: 'Rápido', en: 'Fast' } },
      ],
      order: 4,
    },
  ],
}
