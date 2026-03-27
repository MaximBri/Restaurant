<script setup lang="ts">
defineProps<{ message?: string }>()
</script>

<template>
  <div class="flex justify-center items-center py-16">
    <div
      class="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-700"
    ></div>
    <span v-if="message" class="ml-4 text-gray-500 text-sm">{{ message }}</span>
  </div>
</template>
