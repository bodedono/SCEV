<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string | number
  type?: string
  placeholder?: string
  icon?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  autofocus?: boolean
  maxlength?: string | number
  error?: boolean
}>(), {
  type: 'text',
  size: 'md'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'input': [event: Event]
  'blur': [event: FocusEvent]
}>()

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const val = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', val)
  emit('input', e)
}
</script>

<template>
  <div
    class="app-input-wrapper"
    :class="[
      `app-input-${size}`,
      error ? 'app-input-wrapper-error' : ''
    ]"
  >
    <AppIcon
      v-if="icon"
      :name="icon"
      class="app-input-icon mr-2 text-base"
    />
    <input
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :autofocus="autofocus"
      :maxlength="maxlength ? Number(maxlength) : undefined"
      @input="onInput"
      @blur="$emit('blur', $event)"
    >
    <slot name="trailing" />
  </div>
</template>
