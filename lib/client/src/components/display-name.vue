<template>
  <bk-user-display-name v-if='isEnableTenant' :user-id="value"></bk-user-display-name>
  <span v-else>{{value || '--'}}</span>
</template>

<script>
  export default {
      props: {
          value: {
              type: String,
              default: ''
          }
      },
      data () {
          return {
              isEnableTenant: window.BK_ENV_ENABLE_TENANT === '1'
          }
      }
  }
</script>