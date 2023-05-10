<template>
    <main class="operation-content">
        <div class="g-page-tab">
            <div class="tab-item"
                v-for="(panel, index) in panels"
                :key="index"
                :class="{ active: active === panel.name }"
                @click="handleTabChange(panel.name)">{{panel.label}}</div>
        </div>
        <component :is="`dim-${active}`" />
    </main>
</template>

<script>
    import DimComp from './dim-comp.vue'
    import DimTime from './dim-time.vue'

    export default {
        components: {
            DimComp,
            DimTime
        },
        data () {
            return {
                panels: [
                    { name: 'comp', label: window.i18n.t('按自定义组件') },
                    { name: 'time', label: window.i18n.t('按时间') }
                ],
                active: ''
            }
        },
        watch: {
            '$route.query.tab': {
                immediate: true,
                handler: function (tab) {
                    this.active = tab || 'comp'
                }
            }
        },
        methods: {
            handleTabChange (name) {
                if (name === this.$route.query.tab) {
                    return
                }
                this.$router.push({
                    query: { ...this.$route.query, tab: name }
                })
            }
        }
    }
</script>
