import cssModule from './index.postcss?module'
import {
    h
} from 'bk-lesscode-render'
import editArea from '../edit-area/edit-area'
import simulator from '../simulator-area/simulator-area'
import LC from '@/element-materials/core'
import {
    uuid
} from '@/common/util'

export default {
    data () {
        return {
            showPreview: true,
            previewKey: uuid()
        }
    },
    created () {
        LC.addEventListener('mobilePreviewSwitch', this.mobileSwitchCallback)
        LC.addEventListener('refreshPreview', this.updatePreview)
    },
    beforeDestroy () {
        LC.removeEventListener('mobilePreviewSwitch', this.mobileSwitchCallback)
        LC.removeEventListener('refreshPreview', this.updatePreview)
    },
    methods: {
        mobileSwitchCallback (val) {
            this.showPreview = val
        },
        updatePreview () {
            this.previewKey = uuid()
        }
    },
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'div',
            class: cssModule['mobile-canvas-wrapper'],
            children: [
                h({
                    component: editArea
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
