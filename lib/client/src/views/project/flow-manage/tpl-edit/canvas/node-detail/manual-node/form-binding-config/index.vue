<template>
    <div class="form-binding-config">
        <create-binding />
        <bound-detail />
    </div>
</template>
<script>
    import { defineComponent } from '@vue/composition-api'
    import CreateBinding from './create-binding.vue'
    import BoundDetail from './bound-detail.vue';

    export default defineComponent({
        name: 'FormBindingConfig',
        components: {
            CreateBinding,
            BoundDetail
        },
        props: {
            config: {
                type: Object,
                default: () => ({})
            }
        },
        setup (props, { emit }) {
            return {}
        }
    })
</script>
<style lang="postcss" scoped>
    .form-binding-config {
        width: 656px;
    }
</style>
