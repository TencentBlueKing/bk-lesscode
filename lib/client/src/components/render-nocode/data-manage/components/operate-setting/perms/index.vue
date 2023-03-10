<template>
    <div class="perms-setting">
        <perms :custom="true" :custom-val="selectedComp.data.perms" @change="handlePermChange"></perms>
    </div>
</template>
<script>
    import { mapState, mapMutations } from 'vuex'
    import { cloneDeep } from 'lodash'
    import Perms from '../../../../../../element-materials/modifier/component/perms'

    export default {
        name: 'PermsSetting',
        components: {
            Perms
        },
        computed: {
            ...mapState('nocode/dataManage', ['activeNode', 'selectedComp', 'pageConfig'])
        },
        methods: {
            ...mapMutations('nocode/dataManage', ['setPageConfig']),
            handlePermChange (val) {
                const pageConfig = cloneDeep(this.pageConfig)
                const compList = (this.activeNode ? pageConfig[this.activeNode] : pageConfig)
                const comp = compList[this.selectedComp.type].find(item => item.id === this.selectedComp.data.id)
                comp.perms = val
                this.setPageConfig(pageConfig)
            }
        }
    }
</script>
<style lang="postcss" scoped>

</style>
