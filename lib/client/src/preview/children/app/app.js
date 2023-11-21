import './app.css'
import { h, framework } from 'bk-lesscode-render'
import { injectCss, removeVantStyle } from 'shared/util'
/* eslint import/no-webpack-loader-syntax: off */
import vanStyle from '!!raw-loader!vant/lib/index.css'
import vant3Style from '!!raw-loader!shared/page-code/style/vant3.style.css'

export default {
    name: 'app',
    data () {
        return {
            userInfoLoading: true
        }
    },
    created () {
        this.getUserInfo()
    },
    mounted () {
        removeVantStyle()
        injectCss(framework === 'vue3' ? vant3Style : vanStyle)
    },
    methods: {
        async getUserInfo () {
            await this.$store.dispatch('userInfo')
            this.userInfoLoading = false
        }
    },
    render (render) {
        h.init(render)

        return h({
            component: 'div',
            attrs: {
                id: 'app'
            },
            children: [
                this.userInfoLoading
                    ? ''
                    : h({
                        component: 'router-view'
                    })
            ]
        })
    }
}
