<script setup lang="ts">
import BookingWidget from '../components/booking/BookingWidget.vue'
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Бронирование столика</h2>
      <p class="text-gray-500 text-sm mt-1">Выберите зал, дату и удобный столик</p>
    </div>
    <BookingWidget />
  </div>
</template>
