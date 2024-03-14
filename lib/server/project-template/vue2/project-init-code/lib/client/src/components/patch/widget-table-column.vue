<template>
  <component
    :is="columnType"
    :formatter="bkTableFormatter"
    :render-header="renderHeader"
    v-bind="$props"
  />
</template>

<script>
import dayjs from 'dayjs';

export default {
  name: 'WidgetTableColumn',

  props: {
    columnType: String,
    type: String,
    label: String,
    prop: String,
    sortable: Boolean,
    width: String,
    filterable: Boolean,
    align: String,
  },

  data() {
    return {
      filterText: '',
    };
  },

  methods: {
    renderHeader(h, { column }) {
      const vm = this;
      return h(
        'div',
        {},
        [
          column.label,
          this.filterable
            ? h(
              'bk-popover',
              {
                props: {
                  trigger: 'click',
                  theme: 'light',
                  extCls: 'g-popover-empty-padding',
                },
                ref: 'popoverRef',
                refInFor: true,
              },
              [
                h(
                  'bk-input',
                  {
                    slot: 'content',
                    props: {
                      value: vm.filterText,
                      placeholder: '请输入并按回车键进行搜索',
                    },
                    on: {
                      enter() {
                        vm.handleFilter(column);
                      },
                      change(val) {
                        vm.changeFilterText(val);
                      },
                    },
                  },
                ),
                h(
                  'i',
                  {
                    class: 'bk-table-column-filter-trigger bk-icon icon-funnel',
                    slot: 'default',
                  },
                ),
              ],
            )
            : '',
        ],
      );
    },

    bkTableFormatter(row, column, cellValue) {
      if (typeof cellValue === 'object') {
        return cellValue ? JSON.stringify(cellValue) : '--';
      } if (/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/.test(cellValue)) {
        return cellValue ? dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss') : '--';
      }
      return cellValue;
    },

    handleFilter(column) {
      this.$parent.$refs.tableHeader.$refs.popoverRef.forEach(refItem => refItem.hideHandler());
      this.$parent.$parent.handleFilter({
        key: column.property,
        value: this.filterText,
      });
    },

    changeFilterText(val) {
      this.filterText = val;
    },

    filterMethod(value, row, column) {
      const { property } = column;
      return row[property] === value;
    },
  },
};
</script>
