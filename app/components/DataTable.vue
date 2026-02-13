<script setup lang="ts">
interface DataTableColumn {
  key: string
  label: string
  class?: string
  headerClass?: string
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
</script>

<template>
  <div
    v-if="loading"
    class="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500"
  >
    <UIcon
      name="i-lucide-loader-2"
      class="text-2xl animate-spin mb-3"
    />
    <p class="text-sm">
      {{ loadingText ?? 'Carregando...' }}
    </p>
  </div>

  <div
    v-else
    class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-x-auto"
  >
    <table class="w-full text-sm">
      <thead class="bg-gray-50/80 dark:bg-gray-800/50">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
            :class="col.headerClass"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
        <tr v-if="data.length === 0">
          <td
            :colspan="columns.length"
            class="px-4 py-16 text-center"
          >
            <div class="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
              <UIcon
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
          class="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
          :class="[rowClickable ? 'cursor-pointer' : '', getRowClass(row, rowClass)]"
          @click="$emit('row-click', row)"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            class="px-4 py-3"
            :class="col.class"
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
