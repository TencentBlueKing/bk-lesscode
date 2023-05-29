import './app.css'
import { h } from 'bk-lesscode-render'

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
