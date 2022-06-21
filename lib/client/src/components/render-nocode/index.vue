<template>
    <div class="render-content">
        <render-form v-if="nocodeType === 'FORM'" @update="$emit('update', $event)" />
        <render-data-manage v-else-if="['FORM_MANAGE', 'FLOW_MANAGE'].includes(nocodeType)" type="edit" :nocode-type="nocodeType"></render-data-manage>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    import RenderForm from './form'
    import RenderDataManage from './data-manage'

    export default {
        name: 'RenderNocode',
        components: {
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
