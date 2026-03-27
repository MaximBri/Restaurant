import { createRouter, createWebHistory } from 'vue-router'
import MenuView from '../views/MenuView.vue'
import DishView from '../views/DishView.vue'
import BookingView from '../views/BookingView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'menu', component: MenuView },
    { path: '/dish/:id', name: 'dish', component: DishView, props: true },
    { path: '/booking', name: 'booking', component: BookingView },
  ],
})

export default router
