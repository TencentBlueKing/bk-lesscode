import cssModule from './md-editor.postcss'
import { h } from 'bk-lesscode-render'
import { uuid } from '@/common/util'
import LC from '@/element-materials/core'

export default {
    name: 'md-editor',
    inheritAttrs: false,
    props: {
        componentData: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            content: '',
            cssModule,
            toolbarSetting: {
                bold: true, // 粗体
                italic: true, // 斜体
                header: true, // 标题
                underline: true, // 下划线
                strikethrough: true, // 中划线
                mark: true, // 标记
                superscript: true, // 上角标
                subscript: true, // 下角标
                quote: true, // 引用
                ol: true, // 有序列表
                ul: true, // 无序列表
                link: true, // 链接
                imagelink: true, // 图片链接
                code: true, // code
                table: true, // 表格
                fullscreen: false, // 全屏编辑
                readmodel: true, // 沉浸式阅读
                htmlcode: true, // 展示html源码
                help: true, // 帮助
                undo: true, // 上一步
                redo: true, // 下一步
                trash: true, // 清空
                save: false, // 保存（触发events中的save事件）
                navigation: true, // 导航目录
                alignleft: true, // 左对齐
                aligncenter: true, // 居中
                alignright: true, // 右对齐
                subfield: true, // 单双栏模式
                preview: true // 预览
            }
        }
    },
    created () {
        this.content = this.componentData?.prop?.value
    },
    methods: {
        contentChange (con) {
            const props = {
                format: 'value',
                code: con,
                renderValue: con
            }
            this.componentData.setProp({
                'value': LC.utils.genPropFormatValue(props)
            })
        },
        uploadImg (pos, $file) {
            const extension = $file._name?.split('.')?.pop()
            // 将图片上传到服务器
            const data = {
                fileObj: {
                    name: uuid() + '.' + extension,
                    content: $file.miniurl
                },
                projectId: this.$route.params.projectId
            }
            this.$http.post('/file/uploadBase64Img', data).then((res) => {
                // 第二步.将返回的url替换到文本原位置![...](0) -> ![...](url)
                this.$refs?.md?.$img2Url(pos, res.data?.url)
            })
        }
    },
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'mavon-editor',
            ref: 'md',
            class: {
                'render-md-editor': true
            },
            props: {
                toolbars: self.toolbarSetting,
                value: self.content,
                ...self.componentData.prop
            },
            on: {
                'change': self.contentChange,
                'imgAdd': self.uploadImg
            }
        })
    }
}
