import cssModule from './index.postcss?module'
import {
    h,
    ref,
    onBeforeMount,
    onBeforeUnmount
} from 'bk-lesscode-render'
import editArea from '../edit-area/edit-area'
import simulator from '../simulator-area/simulator-area'
import LC from '@/element-materials/core'
import {
    uuid
} from '@/common/util'
import useComponentAction from '../../hooks/component-action-use'

export default {
    setup () {
        const {
            unselectComponent
        } = useComponentAction()

        const showPreview = ref(true)
        const previewKey = ref(uuid())

        const mobileSwitchCallback = (val) => {
            showPreview.value = val
        }

        const updatePreview = () => {
            previewKey.value = uuid()
        }

        onBeforeMount(() => {
            LC.addEventListener('mobilePreviewSwitch', mobileSwitchCallback)
            LC.addEventListener('refreshPreview', updatePreview)
        })

        onBeforeUnmount(() => {
            LC.removeEventListener('mobilePreviewSwitch', mobileSwitchCallback)
            LC.removeEventListener('refreshPreview', updatePreview)
        })

        return {
            showPreview,
            previewKey,
            unselectComponent
        }
    },
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'div',
            class: cssModule['mobile-canvas-wrapper'],
            on: {
                click: self.unselectComponent
            },
            children: [
                h({
                    component: editArea,
                    props: {
                        preview: self.showPreview
                    }
                }),
                h({
                    component: simulator,
                    key: self.previewKey,
                    class: {
                        [cssModule.hidden]: !self.showPreview
                    },
                    style: {
                        transform: 'translateX(-40px)'
                    }
                })
            ]
        })
    }
}
