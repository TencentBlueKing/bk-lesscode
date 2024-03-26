import { NodeView } from '@antv/x6'
import Vue from 'vue'
import store from '@/store'
import { shapeMaps } from './registry'

export class VueShapeView extends NodeView {
  vm

  getComponentContainer () {
      return this.selectors && (this.selectors.foContent)
  }

  confirmUpdate (flag) {
      const ret = super.confirmUpdate(flag)
      return this.handleAction(ret, 'vue', () => {
          this.renderVueComponent()
      })
  }

  targetId () {
      return `${this.graph.view.cid}:${this.cell.id}`
  }

  renderVueComponent () {
      this.unmountVueComponent()
      const root = this.getComponentContainer()
      const node = this.cell
      const graph = this.graph

      if (root) {
          const { component } = shapeMaps[node.shape]
          if (component) {
              this.vm = new Vue({
                  el: root,
                  store,
                  render (h) {
                      return h(component, { node, graph })
                  },
                  provide () {
                      return {
                          getNode: () => node,
                          getGraph: () => graph
                      }
                  }
              })
          }
      }
  }

  unmountVueComponent () {
      const root = this.getComponentContainer()
      if (this.vm) {
          this.vm.$destroy()
          this.vm = null
      }
      if (root) {
          root.innerHTML = ''
      }
      return root
  }

  onMouseDown (e, x, y) {
      const target = e.target
      const tagName = target.tagName.toLowerCase()
      if (tagName === 'input') {
          const type = target.getAttribute('type')
          if (
              type == null
        || [
            'text',
            'password',
            'number',
            'email',
            'search',
            'tel',
            'url'
        ].includes(type)
          ) {
              return
          }
      }

      super.onMouseDown(e, x, y)
  }

  unmount () {
      this.unmountVueComponent()
      super.unmount()
      return this
  }
}

VueShapeView.config({
    bootstrap: ['vue'],
    actions: {
        component: 'vue'
    }
})

NodeView.registry.register('vue-shape-view', VueShapeView, true)
