<template>
  <div :style="computedStyle" :options="options" :ref="uuid" autoresize></div>
</template>

<script>
import * as echarts from 'echarts';
import { uuid, debounce } from 'shared/util';

export default {
  name: 'Chart',
  props: {
    componentId: {
      type: String,
      default: '',
    },
    width: {
      type: [Number, String],
      default: '',
    },
    height: {
      type: [Number, String],
      default: '',
    },
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      charInst: null,
      uuid: '',
      observer: null,
    };
  },
  computed: {
    computedStyle() {
      const widthVal = this.width ? (typeof this.width === 'number' ? `${this.width}px` : this.width) : '100%';
      const widthStr = `width:${widthVal};`;
      const heightVal = this.height ? (typeof this.height === 'number' ? `${this.height}px` : this.height) : '100%';
      const heightStr = `height:${heightVal};`;

      return widthStr + heightStr;
    },
  },
  watch: {
    options: {
      deep: true,
      handler(val) {
        this.chartInst?.setOption(val, true);
      },
    },
  },
  created() {
    this.uuid = this.componentId || uuid();
  },
  mounted() {
    this.chartInst = echarts.init(this.$refs[this.uuid]);
    this.chartInst.setOption(this.options);
    this.debounceResize = debounce(this.resizeChart, 500);
    this.observer = new ResizeObserver(this.debounceResize);
    this.observer.observe(this.$refs[this.uuid]);
  },
  beforeDestroy() {
    this.observer.unobserve(this.$refs[this.uuid]);
  },
  methods: {
    resizeChart() {
      this.chartInst?.resize();
    },
  },
};
</script>

<style scoped>
    /* 不加 scoped 会被 vue-echarts 默认的 .echarts 样式覆盖 */
    .echarts {
        width: 100%;
        height: 100%;
    }
</style>
