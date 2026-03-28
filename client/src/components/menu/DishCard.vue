<script setup lang="ts">
import type { Dish } from '../../types'

defineProps<{ dish: Dish }>()
</script>

<template>
  <RouterLink
    :to="{ name: 'dish', params: { id: dish.id } }"
    class="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
  >
    <div class="relative overflow-hidden aspect-4/3">
      <img
        :src="dish.imageUrl"
        :alt="dish.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
      <div class="absolute top-2 left-2 flex gap-1 flex-wrap">
        <span
          v-if="dish.isSpicy"
          class="flex gap-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium"
        >
          <img src="/icons/spice.svg" alt="spice" width="14" height="14" />
          Острое</span
        >
        <span
          v-if="dish.isChildFriendly"
          class="flex gap-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium"
        >
          <img src="/icons/child.svg" alt="child" width="14" height="14" />
          Детям</span
        >
      </div>
      <div
        class="absolute top-2 right-2 bg-amber-700 text-white text-sm font-bold px-2 py-1 rounded-lg"
      >
        {{ dish.price }} ₽
      </div>
    </div>
    <div class="p-4 flex flex-col flex-1">
      <span
        class="text-xs text-amber-700 font-medium uppercase tracking-wide mb-1"
        >{{ dish.category }}</span
      >
      <h3
        class="font-semibold text-gray-800 text-base mb-2 group-hover:text-amber-800 transition-colors"
      >
        {{ dish.name }}
      </h3>
      <p class="text-gray-500 text-sm line-clamp-2 flex-1">
        {{ dish.description }}
      </p>
      <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-400">
        <span class="flex items-center gap-2">
          <img src="/icons/weight.svg" alt="weight" width="14" height="14" />
          {{ dish.weight }} г</span
        >
        <span class="flex items-center gap-2"
          ><img src="/icons/fire.svg" alt="fire" width="14" height="14" />
          {{ dish.calories }} ккал</span
        >
        <span
          v-if="dish.allergens.length"
          class="flex items-center gap-2 text-orange-400"
        >
          <img src="/icons/caution.svg" width="14" height="14" alt="caution" />
          аллергены</span
        >
      </div>
    </div>
  </RouterLink>
</template>
