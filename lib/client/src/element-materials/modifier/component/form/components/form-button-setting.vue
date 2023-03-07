<template>
    <section>
        <div class="form-title">
            表单操作项配置
        </div>
        <div class="form-btn-list">
            <div class="list-item">
                <span class="list-span">显示提交按钮</span>
                <bk-switcher size="small" v-model="btnSetting['SHOW_SUBMIT_BTN']" @change="(val) => changeShowButton('SHOW_SUBMIT_BTN', val)"></bk-switcher>
            </div>
            <div class="list-item">
                <span class="list-span">显示取消按钮</span>
                <bk-switcher size="small" v-model="btnSetting['SHOW_CANCEL_BTN']" @change="(val) => changeShowButton('SHOW_CANCEL_BTN', val)"></bk-switcher>
            </div>
        </div>
    </section>
</template>

<script>
    import {
        defineComponent,
        ref
    } from '@vue/composition-api'

    export default defineComponent({
        props: {
            buttonSetting: {
                type: Object,
                required: true
            },
            handleUpdateBtnItem: {
                type: Function,
                required: true
            }
        },
        setup (props) {
            const btnSetting = ref({})
            Object.assign(btnSetting.value, {
                'SHOW_SUBMIT_BTN': typeof props?.buttonSetting?.SHOW_SUBMIT_BTN === 'boolean' ? props?.buttonSetting?.SHOW_SUBMIT_BTN : true,
                'SHOW_CANCEL_BTN': typeof props?.buttonSetting?.SHOW_CANCEL_BTN === 'boolean' ? props?.buttonSetting?.SHOW_CANCEL_BTN : true
            })
            
            const changeShowButton = (type, isShow) => {
                Object.assign(btnSetting.value, { [type]: isShow })
                props.handleUpdateBtnItem(btnSetting.value)
            }

            return {
                btnSetting,
                changeShowButton
            }
        }
    })
</script>

<style scoped lang="postcss">
    .form-btn-list {
        font-size: 12px;
        .list-item {
            margin-bottom: 6px;
            .list-span {
                margin-right: 20px;
            }
        }
    }
</style>
