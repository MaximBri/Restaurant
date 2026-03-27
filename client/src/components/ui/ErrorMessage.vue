<script setup lang="ts">
defineProps<{
  message: string
  onRetry?: () => void
}>()
</script>

<template>
  <div
    class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
  >
    <span class="text-red-500 text-xl shrink-0">
      <img src="/icons/caution.svg" width="20" height="20" alt="caution" />
    </span>
    <div>
      <p class="text-red-700 font-medium text-sm">Ошибка</p>
      <p class="text-red-600 text-sm mt-0.5">{{ message }}</p>
      <button
        v-if="onRetry"
        @click="onRetry"
        class="mt-2 text-sm text-red-700 underline hover:no-underline"
      >
        Попробовать снова
      </button>
    </div>
  </div>
</template>
