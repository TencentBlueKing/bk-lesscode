import './index.postcss'
import { computed, onMounted, h } from 'bk-lesscode-render'
import useComponentAction from '../../../hooks/component-action-use'
import { useStore } from '@/store'
import { useRoute } from '@/router'
import LayoutEmpty from './components/empty/empty'
import LayoutLeftRight from './components/left-right/left-right'
import LayoutComplex from './components/complex/complex'
import LayoutTopBottom from './components/top-bottom/top-bottom'

export default {
    setup () {
        const store = useStore()
        const route = useRoute()
        const pageDetail = store.getters['page/pageDetail']
        const componentMap = {
            'empty': LayoutEmpty,
            'left-right': LayoutLeftRight,
            'complex': LayoutComplex,
            'top-bottom': LayoutTopBottom
        }
        const { layout } = useComponentAction(false, '', 'PC')
        const layoutCom = computed(() => {
            if (!componentMap[layout.value]) {
                return 'div'
            }
            return componentMap[layout.value]
        })
        const fetchPageList = () => {
            store.dispatch('route/getProjectPageRoute', {
                projectId: route.params.projectId,
                versionId: store.getters['projectVersion/currentVersionId']
            })
        }
        onMounted(() => {
            fetchPageList()
        })
        return {
            layout,
            layoutCom,
            pageDetail
        }
    },
    render (render) {
        h.init(render)

        return h({
            component: this.layoutCom,
            class: ['lesscode-editor-layout', { 'form-page-width': this.pageDetail.nocodeType === 'FORM' }],
            children: this.$slots.default
        })
    }
}
