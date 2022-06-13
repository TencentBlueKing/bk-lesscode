<template>
    <div class="render-content">
        <render-flow v-if="nocodeType === 'FLOW'" />
        <render-form v-else-if="nocodeType === 'FORM'" @update="$emit('update', $event)" />
        <render-data-manage v-else-if="nocodeType" type="edit"></render-data-manage>
        <div v-else>empty</div>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    import RenderFlow from './flow'
    import RenderForm from './form'
    import RenderDataManage from './data-manage'

    export default {
        components: {
            RenderFlow,
            RenderForm,
            RenderDataManage
        },
        data () {
            return {
                type: 'edit'
            }
        },
        computed: {
            ...mapGetters('page', ['pageDetail']),
            nocodeType () {
                return this.pageDetail.nocodeType || ''
            }
        },
        created () {
            this.$route.name === 'editNocode' ? this.type = 'edit' : this.type = 'use'
        }

    }
</script>
