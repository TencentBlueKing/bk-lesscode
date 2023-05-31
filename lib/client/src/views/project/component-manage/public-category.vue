<template>
    <bk-dialog
        :render-directive="'if'"
        :value="isShow"
        :title="$t('所属分类设置')"
        header-position="left"
        :mask-close="false"
        @cancel="handlerCancel"
        :width="400">
        <bk-select
            :disabled="false"
            v-model="categoryId"
            :clearable="false">
            <bk-option v-for="category in categoryList"
                :key="category.id"
                :id="category.id"
                :name="category.name">
            </bk-option>
        </bk-select>
        <div slot="footer">
            <bk-button
                theme="primary"
                :disabled="dialog.disabled"
                :loading="dialog.loading"
                @click="handlerConfirm"
                class="footer-btn"
            >{{ $t('确定') }}</bk-button>
            <bk-button @click="handlerCancel">{{ $t('取消') }}</bk-button>
        </div>
    </bk-dialog>
</template>
<script>
    import { mapState } from 'vuex'
    export default {
        name: 'public-category',
        props: {
            isShow: {
                type: Boolean,
                default: false
            },
            data: {
                type: Object,
                default: () => ({})
            }
        },
        data () {
            return {
                categoryId: '',
                dialog: {
                    disabled: false,
                    loading: false
                }
            }
        },
        computed: {
            ...mapState({
                categoryList: state => state.components.categoryList
            })
        },
        watch: {
            data (newData) {
                this.categoryId = newData.categoryId
            }
        },
        methods: {
            handlerCancel () {
                this.categoryId = this.data.categoryId
                this.$emit('update:isShow', false)
            },
            async handlerConfirm () {
                if (this.categoryId === this.data.categoryId) {
                    this.$emit('update:isShow', false)
                    return
                }
                try {
                    this.dialog.loading = true
                    const data = {
                        id: this.data.id,
                        categoryId: this.categoryId
                    }
                    await this.$store.dispatch('components/updateData', data)
                    this.messageSuccess(window.i18n.t('设置成功'))
                    this.$emit('update:isShow', false)
                    this.$emit('on-update')
                    this.$emit('on-add')
                } catch (e) {
                    console.error(e)
                } finally {
                    this.dialog.loading = false
                }
            }
        }
    }
</script>
<style lang="postcss" scoped>

        .footer-btn {
            margin-right: 10px;
        }

</style>
