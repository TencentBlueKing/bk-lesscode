<template>
    <div :class="['edit-route-form', $style['bind-route-form']]">
        <bind-route-selector
            :class="[$style['form-el'], { [$style['is-loading']]: loading }]"
            v-bind="selectorProps"
            @change="handleSelectChange" />
        <div :class="$style['buttons']">
            <bk-button text size="small" theme="primary"
                :disabled="confirmButtonDisabled"
                @click="handleConfirm">{{ $t('确定') }}</bk-button>
            <span :class="$style['divider']">|</span>
            <bk-button text size="small" theme="primary" @click="handleCancel">{{ $t('取消') }}</bk-button>
        </div>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    import BindRouteSelector from './bind-route-selector'
    export default {
        name: 'BindRouteForm',
        components: {
            [BindRouteSelector.name]: BindRouteSelector
        },
        props: {
            projectId: {
                type: Number,
                required: true
            },
            selectorProps: {
                type: Object
            }
        },
        data () {
            return {
                binding: {},
                loading: false
            }
        },
        computed: {
            ...mapGetters('projectVersion', { versionId: 'currentVersionId' }),
            currentRoute () {
                return this.selectorProps.active
            },
            confirmButtonDisabled () {
                if (!this.binding) {
                    return false
                }
                const { pageId, redirect } = this.currentRoute
                const id = this.bindValue.type === 'page' ? pageId : redirect
                return this.bindValue.id === id || this.loading
            },
            bindValue () {
                if (!this.binding) {
                    return {}
                }
                const value = { type: null, id: null }
                if (this.binding && this.binding.id) {
                    const [type, id] = this.binding.id.split('-')
                    value.type = type
                    value.id = Number(id)
                    value.name = this.binding.name
                }
                return value
            }
        },
        methods: {
            async handleConfirm () {
                // 构造参数，默认包含routeId为当前编辑的路由对象id
                const data = {
                    routeId: this.currentRoute.id,
                    projectId: this.projectId,
                    versionId: this.versionId
                }

                // 从选择的绑定值中取出数据
                const { type, id, name } = this.bindValue

                if (type) {
                    const dataKey = { page: 'pageId', route: 'redirect' }
                    data[dataKey[type]] = id
                } else {
                    // 清空设置
                    data.remove = 1
                }

                if (this.currentRoute.isRoot && this.currentRoute.isNew) {
                    data.createRoot = 1
                    data.layoutId = this.currentRoute.layoutId
                    data.layoutPath = this.currentRoute.layoutPath
                }

                this.loading = true
                try {
                    const result = await this.$store.dispatch('route/bind', { data })
                    this.$emit('success', { ...result, name })
                } catch (e) {
                    console.error(e)
                } finally {
                    this.loading = false
                }
            },
            handleCancel () {
                this.$emit('cancel')
            },
            handleSelectChange (value) {
                this.binding = value
            }
        }
    }
</script>

<style lang="postcss" module>
    .bind-route-form {
        display: flex;
        align-items: center;
        width: 100%;
        padding-left: 4px;
        margin-right: 14px;

        .form-el {
            &.is-loading {
                &::before {
                    content: "";
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 1;
                }
                &::after {
                    content: "";
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    position: absolute;
                    right: 8px;
                    top: 8px;
                    background: #fff url("../../../../images/svg/loading.svg");
                }
            }

            position: relative;
            display: flex;
            flex: 1;
        }

        .buttons {
            display: flex;
            align-items: center;
            margin-left: 2px;

            .bk-button-text {
                width: 36px;
                padding: 0 6px;
            }
            .divider {
                color: #979BA5;
            }
        }
    }
</style>
