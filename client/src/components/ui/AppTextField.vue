<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string
    label: string
    placeholder?: string
    type?: 'text' | 'password'
    autocomplete?: string
    inputmode?: 'text' | 'email' | 'tel' | 'search' | 'numeric'
    error?: string | null
  }>(),
  {
    placeholder: '',
    type: 'text',
    autocomplete: 'off',
    inputmode: 'text',
    error: null,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()
</script>

<template>
  <label class="block">
    <span class="mb-1 block text-sm font-medium text-stone-700">{{ props.label }}</span>
    <input
      :value="props.modelValue"
      :type="props.type"
      :placeholder="props.placeholder"
      :autocomplete="props.autocomplete"
      :inputmode="props.inputmode"
      class="w-full rounded-2xl border px-4 py-3 outline-none transition"
      :class="
        props.error
          ? 'border-red-400 bg-red-50 text-stone-900 focus:border-red-500'
          : 'border-stone-200 bg-white text-stone-900 focus:border-amber-600'
      "
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="emit('blur')"
    />
    <p v-if="props.error" class="mt-1 text-sm text-red-600">
      {{ props.error }}
    </p>
  </label>
</template>
