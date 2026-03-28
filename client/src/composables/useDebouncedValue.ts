import {
  isReactive,
  onBeforeUnmount,
  ref,
  toRaw,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'

function cloneValue<T>(value: T): T {
  const source =
    typeof value === 'object' && value !== null && isReactive(value)
      ? toRaw(value)
      : value

  if (typeof source !== 'object' || source === null) {
    return source
  }

  if (typeof structuredClone === 'function') {
    return structuredClone(source)
  }

  return JSON.parse(JSON.stringify(source)) as T
}

export function useDebouncedValue<T>(source: MaybeRefOrGetter<T>, delay = 350) {
  const debounced = ref(cloneValue(toValue(source))) as Ref<T>
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  watch(
    () => toValue(source),
    (value) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(() => {
        debounced.value = cloneValue(value)
      }, delay)
    },
    { deep: true },
  )

  onBeforeUnmount(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })

  return debounced
}
