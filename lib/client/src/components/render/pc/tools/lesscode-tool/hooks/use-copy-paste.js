import LC from '@/element-materials/core'

export default function () {
    return () => {
        LC.execCommand('copy')
        LC.execCommand('paste')
    }
}
