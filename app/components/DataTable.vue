<script setup lang="ts">
interface DataTableColumn {
  key: string
  label: string
  class?: string
  headerClass?: string
  hideBelow?: 'sm' | 'md' | 'lg'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any

defineProps<{
  columns: DataTableColumn[]
  data: Row[]
  loading?: boolean
  loadingText?: string
  emptyText?: string
  emptyIcon?: string
  rowClickable?: boolean
  rowClass?: string | ((row: Row) => string)
}>()

defineEmits<{
  'row-click': [row: Row]
}>()

const getRowClass = (row: Row, rowClass?: string | ((row: Row) => string)) => {
  if (!rowClass) return ''
  return typeof rowClass === 'function' ? rowClass(row) : rowClass
}

const hideClass = (col: DataTableColumn) => {
  if (!col.hideBelow) return ''
  const map: Record<string, string> = {
    sm: 'hidden sm:table-cell',
    md: 'hidden md:table-cell',
    lg: 'hidden lg:table-cell'
  }
  return map[col.hideBelow] ?? ''
}
</script>

<template>
  <div
    v-if="loading"
    class="flex flex-col items-center justify-center py-16"
    style="color: var(--text-muted);"
  >
    <AppIcon
      name="i-lucide-loader-2"
      class="text-2xl animate-spin mb-3"
    />
    <p class="text-sm">
      {{ loadingText ?? 'Carregando...' }}
    </p>
  </div>

  <div
    v-else
    class="card overflow-hidden"
  >
    <table class="w-full text-sm">
      <thead style="background-color: var(--bg-surface-hover);">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
            style="color: var(--text-secondary);"
            :class="[col.headerClass, hideClass(col)]"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody
        class="divide-y"
        style="--tw-divide-color: var(--border-subtle);"
      >
        <tr v-if="data.length === 0">
          <td
            :colspan="columns.length"
            class="px-4 py-16 text-center"
          >
            <div
              class="flex flex-col items-center gap-2"
              style="color: var(--text-muted);"
            >
              <AppIcon
                :name="emptyIcon ?? 'i-lucide-inbox'"
                class="text-3xl"
              />
              <p class="text-sm">
                {{ emptyText ?? 'Nenhum registro encontrado' }}
              </p>
            </div>
          </td>
        </tr>
        <tr
          v-for="(row, index) in data"
          :key="row.id ?? index"
          class="transition-colors table-row-hover"
          :class="[rowClickable ? 'cursor-pointer' : '', getRowClass(row, rowClass)]"
          @click="$emit('row-click', row)"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            class="px-4 py-3"
            :class="[col.class, hideClass(col)]"
          >
            <slot
              :name="`cell-${col.key}`"
              :row="row"
              :value="row[col.key]"
            >
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
