
const routes = [
  {
    path: '/tasks',
    component: () => import('src/App.vue'),
    children: [
      // { path: 'tasks', component: () => import('src/components/TasksActivity.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
