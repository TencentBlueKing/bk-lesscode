<template>
    <div class="perms-setting">
        <perms :custom="true" :custom-val="elementData.perms" @change="handlePermChange"></perms>
    </div>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import Perms from '../../../../../../element-materials/modifier/component/perms'

    export default {
        name: 'PermsSetting',
        components: {
            Perms
        },
        props: {
            elementData: Object
        },
        methods: {
            handlePermChange (val) {
                const elementData = cloneDeep(this.elementData)
                elementData.perms = val
                this.$emit('change', elementData)
            }
        }
    }
</script>
<style lang="postcss" scoped>

</style>
