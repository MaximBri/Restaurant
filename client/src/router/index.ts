import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../components/layout/AdminLayout.vue'
import ProtectedLayout from '../components/layout/ProtectedLayout.vue'
import MenuView from '../views/MenuView.vue'
import AdminBookingsView from '../views/AdminBookingsView.vue'
import DishView from '../views/DishView.vue'
import BookingView from '../views/BookingView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'menu', component: MenuView },
    { path: '/dish/:id', name: 'dish', component: DishView, props: true },
    {
      path: '/booking',
      component: ProtectedLayout,
      children: [
        { path: '', name: 'booking', component: BookingView },
      ],
    },
    {
      path: '/admin',
      component: AdminLayout,
      children: [
        { path: 'bookings', name: 'admin-bookings', component: AdminBookingsView },
      ],
    },
  ],
})

export default router
