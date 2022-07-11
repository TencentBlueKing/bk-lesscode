<template>
    <div class="custom-data-wrapper">
        <div class="text-area">
            <div class="custom-text">选项名</div>
            <div class="custom-text">选项id</div>
            <div class="custom-text" style="margin-left: 8px">默认值</div>
            <div class="custom-color" v-show="localValIsDisplayTag">标签颜色</div>
        </div>
        <li v-for="(item, index) in localVal" class="cutsom-data-item" :key="index">
            <bk-checkbox v-if="showRequire" class="required-checkbox" v-model="item.required">必填</bk-checkbox>
            <div class="form-area">
                <bk-input
                    class="custom-input"
                    placeholder="请输入选项名"
                    :maxlength="120"
                    v-model="item.name"
                    @change="handleValChange"
                    @blur="handleBurChange(item)">
                </bk-input>
                <bk-input
                    class="custom-input"
                    placeholder="请输入选项ID"
                    :maxlength="120"
                    v-model="item.key"
                    @change="handleValChange">
                </bk-input>
                <bk-radio :value="item.isDefaultVal" style="margin: 0 24px  0 8px;" @change="handleChangeDefaultVal(index)">设为下拉默认值</bk-radio>
                <bk-color-picker
                    v-show="localValIsDisplayTag"
                    v-model="item.color"
                    style="width: 75px;"
                    :show-value="false"
                    @change="handleValChange"
                    transfer>
                </bk-color-picker>
            </div>
            <div class="btn-area">
                <i class="icon bk-drag-icon bk-drag-add-fill" @click="handleAddItem(index)"></i>
                <i
                    :class="['icon', 'bk-drag-icon', 'bk-drag-reduce-fill', { disabled: localVal.length < 2 }]"
                    @click="handleDeleteItem(index)"></i>
            </div>
        </li>
        <div v-if="!isValid" class="common-error-tips">选项名、ID为必填项，请检查配置</div>
    </div>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import pinyin from 'pinyin'

    export default {
        name: 'CustomData',
        props: {
            value: Array,
            showRequire: {
                type: Boolean,
                default: false
            },
            localValIsDisplayTag: {
                type: Boolean,
                default: false
            }
        },
        data () {
            return {
                localVal: cloneDeep(this.value),
                isValid: true
            }
        },
        watch: {
            value (val) {
                this.localVal = cloneDeep(val)
            }
        },
        methods: {
            handleAddItem (index) {
                const dataItem = { name: '', key: '', color: '', isDefaultVal: false }
                if (this.fieldType === 'TABLE') {
                    dataItem.required = false
                }
                this.localVal.splice(index + 1, 0, dataItem)
                this.handleValChange()
            },
            handleDeleteItem (index) {
                if (this.localVal.length < 2) {
                    return
                }
                this.localVal.splice(index, 1)
                this.handleValChange()
            },
            handleValChange () {
                this.validate()
                this.$emit('update', cloneDeep(this.localVal))
            },
            validate () {
                const result = !this.localVal.some(item => item.name === '' || item.key === '')
                this.isValid = result
                return result
            },
            handleChangeDefaultVal (index) {
                this.localVal = this.localVal.map((item, ind) => {
                    if (index === ind) {
                        return { ...item, isDefaultVal: true }
                    }
                    return { ...item, isDefaultVal: false }
                })
                this.$emit('update', cloneDeep(this.localVal))
            },
            handleBurChange (item) {
                const key = pinyin(item.name, {
                    style: pinyin.STYLE_NORMAL,
                    heteronym: false
                })
                    .join('')
                    .toUpperCase()
                this.$set(item, 'key', key)
                this.handleValChange()
            }
        }
    }
</script>
<style lang="postcss" scoped>
.custom-data-wrapper .cutsom-data-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;

  &:last-of-type {
    margin-bottom: 0;
  }
}

.required-checkbox {
  margin-right: 24px;

  /deep/ .bk-checkbox-text {
    font-size: 12px;
  }
}

.form-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-right: 8px;

  .bk-form-control {
    width: 206px;

    &:not(:last-child) {
      margin-right: 12px;
    }
  }
}
.text-area{
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-right: 8px;

  .bk-form-control {
    width: 206px;

    &:not(:last-child) {
      margin-right: 10px;
    }
  }
}
.custom-text{
  margin-bottom: 8px;
  width: 218px;
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

.custom-color{
  position: relative;
  top: -4px;
  right: 76px;
}
.common-error-tips{
  color: #ff5656;
  font-size: 12px;
  line-height: 30px;
}
</style>
