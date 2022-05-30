<template>
    <div class="flow-selector-wrapper">
        <bk-select style="width: 340px;">
            <bk-option
                v-for="flow in flowList"
                :key="flow.id"
                :id="flow.id"
                :name="flow.name">
            </bk-option>
        </bk-select>
    </div>
</template>
<script>
    export default {
        name: 'FlowSelector',
        data () {
            return {
                flowList: []
            }
        }
    }
</script>
<style lang="postcss" scoped>

</style>
