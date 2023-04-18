<template>
    <section>
        <template v-for="(item, index) in list">
            <span
                :key="index"
                class="variable-txt"
            >{{item.txt}}：</span>
            <monaco
                class="variable-code"
                ref="monaco"
                :height="400"
                :key="item.key"
                :form="{ funcBody: value[item.key] }"
                :function-list="functionList"
                :variable-list="variableList"
                :tips="tips"
                :tip-width="500"
                :show-debug="false"
                @change="change(item.key, ...arguments)"
            >
            </monaco>
        </template>
    </section>
</template>

<script>
    import mixins from './variable.mixin'
    import monaco from '@/components/methods/forms/form-items/monaco.vue'
    import { mapGetters } from 'vuex'

    export default {
        components: {
            monaco
        },

        mixins: [mixins],

        data () {
            return {
                tips: '/**\r\n'
                    + '* 1. ' + window.i18n.t('计算变量适用于复杂数据计算\r\n')
                    + '* 2. ' + window.i18n.t('计算变量内部可以执行函数和变量，最后需将执行结果返回\r\n')
                    + '* 3. ' + window.i18n.t('如果内部使用的变量发生变化，计算变量会实时重新计算\r\n')
                    + '* 4. ' + window.i18n.t('注意：计算变量必须有返回值，不能给计算变量设置值\r\n')
                    + '* 5. ' + window.i18n.t('示例如下：\r\n')
                    + '* return lesscode[\'${func:【' + window.i18n.t('函数') + '】}\']() + lesscode[\'${prop:【' + window.i18n.t('属性') + '】}\']\r\n'
                    + '*/\r\n'
            }
        },

        computed: {
            ...mapGetters('functions', ['functionList']),
            ...mapGetters('variable', ['variableList'])
        },

        methods: {
            fixMethod () {
                return Promise.all(this.$refs.monaco.map(instance => instance.fixMethod()))
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .variable-txt {
        display: inline-block;
        font-size: 12px;
    }
</style>
