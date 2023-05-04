<template>
    <div class="jb-apply-permission">
        <div class="no-permission-tips">
            <img class="lock" src="../../images/no-permission.svg">
            <p class="tips-text">{{ titleText }}</p>
        </div>
        <div class="apply-permission-content" :style="listStyle" v-bkloading="{ isLoading: loading }">
            <bk-table v-if="!loading" class="apply-permission-table" :data="permissionList">
                <bk-table-column
                    :width="300"
                    :label="actionText">
                    <template slot-scope="{ row }">{{ row.actionName }}</template>
                </bk-table-column>
                <bk-table-column
                    :label="resourceText">
                    <template slot-scope="{ row }">
                        <div class="resource-content">
                            <template v-if="row.relatedResources.length > 0">
                                <p v-for="(resource, index) in row.relatedResources" :key="index">
                                    <span>{{ resource.resourceTypeName }}</span>：
                                    <span>{{ resource.resourceName }}</span>
                                </p>
                            </template>
                            <span v-else>--</span>
                        </div>
                    </template>
                </bk-table-column>
                <div slot="empty">
                    <span v-if="!loading">{{ errorTips }}</span>
                </div>
            </bk-table>
        </div>
    </div>
</template>
<script>
    export default {
        props: {
            maxHeight: {
                type: Number,
                default: 0
            },
            permissionList: {
                type: Array,
                default: () => ([])
            },
            loading: {
                type: Boolean
            }
        },
        computed: {
            listStyle () {
                const styles = {}
                if (this.loading) {
                    styles['min-height'] = '80px'
                }
                if (this.maxHeight) {
                    styles.maxHeight = `${this.maxHeight}px`
                    styles.overflow = 'auto'
                }
                return styles
            }
        },
        created () {
            this.titleText = '该操作需要以下权限'
            this.actionText = '需申请的权限'
            this.resourceText = '关联的资源实例'
            this.errorTips = '你已拥有权限，请刷新页面'
        }
    }
</script>
<style lang="postcss" scoped>
    .jb-apply-permission {
        .no-permission-tips {
            text-align: center;
        }

        .lock {
            width: 120px;
            height: 100px;
        }

        .tips-text {
            margin: 8px 0 22px;
            font-size: 20px;
            color: #63656e;
        }

        .apply-permission-table {
            border: none;
        }

        .bk-table-outer-border::after {
            display: none;
        }

        .resource-content {
            padding: 10px 0;

            p {
                line-height: 24px;
            }
        }
    }
</style>
