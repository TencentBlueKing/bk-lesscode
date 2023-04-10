<template>
    <div class="position-graph">
        <div class="blank-center">
        </div>
        <template>
            <slot></slot>
        </template>
    </div>
</template>
    <script>
    export default {
        name: 'position-graph',
        components: {
        },
        data () {
            return {
                
            }
        }
    }
    </script>
    <style lang="postcss">
    .position-graph{
        position: relative;
        background-color: #F5F7FB;
        width: 100%;
        height: 80px;
        .distance-input{
            .bk-form-input {
                padding: 0 5px;
                border: none;
                 height: 22px;
                }
      }
    }
    .blank-center{
      background-color: #fff;
      height: 20px;
      width: 196px;
      position: absolute;
      top: 50%;
      left: 50%;
      bottom: 50%;
      right: 50%;
      transform:translate(-50%,-50%);
    }
    </style>
