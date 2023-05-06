<template>
    <div class="template-menu-box">
        <div class="menu-item-operate">
            <i class="bk-drag-icon bk-drag-drag-small1 item-drag" />
            <i class="bk-icon icon-close item-remove" @click="$emit('remove')"></i>
        </div>
        <bk-form :label-width="270" form-type="vertical">
            <bk-form-item :label="$t('form_列表头名称')">
                <bk-input v-model="localValue.name" @change="change"></bk-input>
            </bk-form-item>
            <bk-form-item :label="$t('form_列字段类型')">
                <bk-select
                    v-model="localValue.display"
                    style="background: #fff"
                    @selected="change">
                    <bk-option v-for="option in typeList" :key="option.id" :id="option.id" :name="option.name"></bk-option>
                </bk-select>
            </bk-form-item>
            <bk-form-item :label="$t('form_数据源配置')" v-if="['select','multiselect'].includes(localValue.display)">
                <div class="option-setting" v-for="(option,index) in localValue.options" :key="option.id">
                    <bk-input
                        :placeholder="$t('选项名')"
                        class="option-item"
                        v-model="option.name"
                        @change="handleChangeOption"></bk-input>
                    <bk-input
                        class="option-item"
                        :placeholder="$t('选项ID')"
                        v-model="option.id"
                        @change="change">
                    </bk-input>
                    <div class="btn-area">
                        <i class="icon bk-drag-icon bk-drag-add-fill" @click="handleAddItem(index)"></i>
                        <i
                            :class="['icon', 'bk-drag-icon', 'bk-drag-reduce-fill', { disabled: localValue.options.length < 2 }]"
                            @click="handleDeleteItem(index)"></i>
                    </div>
                </div>
            </bk-form-item>
            <bk-checkbox v-model="localValue.required" @change="change">{{ $t('必填') }}</bk-checkbox>
        </bk-form>
    </div>
</template>

<script>
    import cloneDeep from 'lodash.clonedeep'
    import pinyin from 'pinyin'

    export default {
        name: 'tableHeaderElement',
        props: {
            value: {
                type: Object,
                default: () => ({
                    choice: [],
                    display: '',
                    name: '',
                    key: '',
                    required: false
                })
            }
        },
        data () {
            return {
                localValue: cloneDeep(this.value),
                typeList: [
                    { id: 'input', name: this.$t('输入框') },
                    { id: 'select', name: this.$t('单选框') },
                    { id: 'multiselect', name: this.$t('多选框') },
                    { id: 'datetime', name: this.$t('时间') },
                    { id: 'date', name: this.$t('日期') }
                ]
            }
        },
        methods: {
            change (val) {
                const key = pinyin(val, {
                    style: pinyin.STYLE_NORMAL,
                    heteronym: false
                }).join('')
                this.localValue.key = key
                if (['select', 'multiselect'].includes(this.localValue.display)) {
                    this.$set(this.localValue, 'options', [{ name: this.$t('选项1'), id: 'XUAN_XIANG_1' }, { name: this.$t('选项2'), id: 'XUAN_XIANG_2' }])
                }
                this.$emit('change', this.localValue)
            },
            handleChangeOption () {
              
            },
            handleAddItem (index) {
                const dataItem = { name: '', key: '' }
                this.localValue.options.splice(index + 1, 0, dataItem)
                this.$emit('change', this.localValue)
            },
            handleDeleteItem (index) {
                if (this.localValue.options.length < 2) {
                    return
                }
                this.localValue.options.splice(index, 1)
                this.$emit('change', this.localValue)
            }

        }
    }
</script>

<style scoped lang='postcss'>
.template-menu-box {
  width: 276px;
  padding: 16px;
  position: relative;
  background: #f0f1f5;
  border-radius: 2px;
  transition: all .15s;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.2);

  .menu-item-operate {
    display: block;
  }

  &:nth-child(n + 2) {
    margin-top: 10px;
  }

  .menu-edit-area {
    margin-top: 20px;
  }

  .menu-item-operate {
    position: absolute;
    right: 0;
    color: #979BA5;
    font-size: 20px;
    margin-top: -3px;
    z-index: 10;

    .item-remove {
      cursor: pointer;
    }

    .item-drag {
      cursor: move;
      padding-left: 220px;
      margin-right: -8px;
    }
  }
}
.option-setting{
  display:flex ;
  align-items: center;
}
.option-item{
  width: 94px;
  margin: 8px 8px 0 0;
}

.btn-area {
  user-select: none;
  .bk-drag-add-fill,
  .bk-drag-reduce-fill {
    font-size: 16px;
    color: #c4c6cc;
    cursor: pointer;

    &:hover {
      color: #979ba5;
    }

    &.disabled {
      color: #dcdee5;
      cursor: not-allowed;
    }
  }
}
</style>
