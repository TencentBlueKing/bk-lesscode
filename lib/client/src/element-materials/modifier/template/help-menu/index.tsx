import { defineComponent } from '@vue/composition-api'
import { VNode } from 'vue'
import menuLayout from '../top-menu/base-menu-template'

export default defineComponent({
    components: {
        menuLayout
    },
    props: {
        helpMenuList: Array
    },
    setup (props, { emit }) {
        const changeHandler = (key, value) => {
            emit('on-change', key, value)
        }
        return { changeHandler }
    },
    render (): VNode {
        return (
            <menuLayout
                menuList={this.helpMenuList}
                menuKey="helpMenuList"
                titleName= { this.$t('帮助菜单配置')}
                hasChild={false}
                hasBlank={true}
                onChange={this.changeHandler}></menuLayout>
        )
    }
})
