<template>
    <div class="distance-container">
        <span class="title">{{title}}</span>
        <slot name="center">
            <div class="blank-center">
            </div>
        </slot>
        <template>
            <slot></slot>
        </template>
    </div>
</template>

<script>
    export default {
        name: 'distance-container',
        props: {
            title: {
                type: String,
                default: ''
            }
        },
        methods: {
            handleEnter () {
                console.log('enter ')
            }
            
        }
    }
</script>

<style lang="postcss">
    .distance-container{
        position: relative;
        background-color: #F5F7FB;
        width: 100%;
        height: 80px;
        .title {
            color: #979BA5;
            font-size: 12px;
        }
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
