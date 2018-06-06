import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Rtc from '@/components/Rtc'
import message from '@/components/message'
import proj from '@/components/proj'
Vue.use(Router)

export default new Router({
  routes: [
      {
        path: '/',
        name: 'HelloWorld',
        component: HelloWorld
      },

      {
          path: '/rtc',
          name: 'rtc',
          component: Rtc
      },
      {
        path: '/message',
        name: 'message',
        component: proj
      },
    {
      path: '/proj',
      name: 'proj',
      component: proj
    }
  ]
})
