<template>
    <section class="float-workbench-block" @click="goToWorkbench">
        <i class="bk-icon icon-pc"></i>
        <div style="margin-top: 4px;">{{ $t('工作台') }}</div>
    </section>
</template>
<script>
    export default {
        name: 'FloatWorkbenchBlock',
        methods: {
            goToWorkbench () {
                window.open(`${process.env.BK_ITSM_URL}/#/workbench/ticket/todo`, '_blank')
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .float-workbench-block {
        position: fixed;
        bottom: 132px;
        right: 64px;
        padding: 12px;
        width: 64px;
        height: 64px;
        font-size: 12px;
        color: #63656e;
        border-radius: 50%;
        background: #ffffff;
        box-shadow: 0 3px 5px 0 rgba(25, 25, 41, 0.05);
        text-align: center;
        z-index: 1;
        cursor: pointer;
        & > i {
            font-size: 20px;
        }
        &:hover {
            color: #3a84ff;
        }
    }
</style>
