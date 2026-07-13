/**
 * 文件安全保护模块
 * 对 noStrictExts 中的文件类型进行安全验证
 */

import fs from 'fs'
import FileType from 'file-type'
import { JSDOM } from 'jsdom'
import DOMPurify from 'dompurify'

/**
 * 安全过滤上传路径
 * @param {string} uploadPath - 原始路径
 * @returns {string} 过滤后的安全路径
 */
export function sanitizeUploadPath (uploadPath) {
    if (!uploadPath) return ''
    
    // 移除所有路径遍历尝试
    uploadPath = uploadPath.replace(/\.\./g, '')
    uploadPath = uploadPath.replace(/[\/\\]+/g, '/') // 统一路径分隔符
    uploadPath = uploadPath.replace(/^\/+/, '') // 移除开头的斜杠
    
    // 过滤危险字符（包括控制字符）
    // eslint-disable-next-line no-control-regex
    uploadPath = uploadPath.replace(/[\x00-\x1f\x7f-\x9f]/g, '') // 控制字符
    uploadPath = uploadPath.replace(/[|;&\\$><`!%\s]/g, '') // 危险字符
    
    return uploadPath
}

/**
 * 验证 noStrictExts 文件类型的安全性
 * @param {string} filePath - 文件路径
 * @param {string} ext - 文件扩展名
 * @param {string} mime - MIME 类型
 * @throws {Error} 验证失败时抛出错误
 */
export async function validateNoStrictFile (filePath, ext, mime) {
    if (!filePath || !fs.existsSync(filePath)) {
        throw new Error('文件不存在或路径无效')
    }

    switch (ext.toLowerCase()) {
        case 'svg':
            await validateSvgFile(filePath)
            break
        case 'csv':
            await validateCsvFile(filePath)
            break
        case 'doc':
        case 'xls':
        case 'ppt':
            await validateOfficeFile(filePath, ext)
            break
        default:
            // 对于其他 noStrictExts 中的文件类型，进行基本验证
            break
    }
}

/**
 * 验证 SVG 文件安全性
 * @param {string} filePath - SVG 文件路径
 */
async function validateSvgFile (filePath) {
    try {
        const svgContent = fs.readFileSync(filePath, 'utf-8')
        
        // 检查 SVG 复杂度（防止 DoS 攻击）
        const elementCount = (svgContent.match(/<[^>]+>/g) || []).length
        if (elementCount > 1000) {
            throw new Error('SVG 文件过于复杂，可能存在 DoS 风险')
        }
        
        // 使用 DOMPurify 进行清理
        const window = new JSDOM('').window
        const purify = DOMPurify(window)
        const cleanSvg = purify.sanitize(svgContent)
        
        // 将清理后的内容写回文件
        fs.writeFileSync(filePath, cleanSvg)
    } catch (error) {
        if (error.message.includes('SVG')) {
            throw error
        }
        throw new Error('SVG 文件格式验证失败')
    }
}

/**
 * 验证 CSV 文件安全性
 * @param {string} filePath - CSV 文件路径
 */
async function validateCsvFile (filePath) {
    try {
        const csvContent = fs.readFileSync(filePath, 'utf-8')
        
        // 检查 CSV 注入攻击模式
        const injectionPatterns = [
            /^[\s]*[=@+\-]/gm, // 公式注入
            /cmd\s*\|/gi, // 命令注入
            /powershell/gi, // PowerShell 命令
            /\|.*calc/gi, // 计算器调用
            /\|.*notepad/gi // 记事本调用
        ]
        
        for (const pattern of injectionPatterns) {
            if (pattern.test(csvContent)) {
                throw new Error('CSV 文件包含潜在的注入攻击内容')
            }
        }
        
        // 检查是否包含可疑的公式
        const lines = csvContent.split('\n')
        for (const line of lines) {
            const cells = line.split(',')
            for (const cell of cells) {
                const trimmedCell = cell.trim()
                if (trimmedCell.startsWith('=') || trimmedCell.startsWith('@')
                    || trimmedCell.startsWith('+') || trimmedCell.startsWith('-')) {
                    // 进一步检查是否为恶意公式
                    if (/\b(cmd|powershell|calc|notepad|system|exec)\b/i.test(trimmedCell)) {
                        throw new Error('CSV 文件包含恶意公式')
                    }
                }
            }
        }
    } catch (error) {
        if (error.message.includes('CSV')) {
            throw error
        }
        throw new Error('CSV 文件格式验证失败')
    }
}

/**
 * 验证 Office 文档安全性
 * @param {string} filePath - Office 文档路径
 * @param {string} ext - 文件扩展名
 */
async function validateOfficeFile (filePath, ext) {
    try {
        // 使用 file-type 库验证文件的真实类型
        const typeResult = await FileType.fromFile(filePath)
        
        if (!typeResult) {
            throw new Error(`无法识别 ${ext.toUpperCase()} 文件的真实类型`)
        }
        
        // 验证文件头是否符合预期的 Office 文档格式
        const validMimeTypes = {
            'doc': ['application/msword'],
            'xls': ['application/vnd.ms-excel'],
            'ppt': ['application/vnd.ms-powerpoint']
        }
        
        const expectedMimes = validMimeTypes[ext.toLowerCase()]
        if (expectedMimes && !expectedMimes.includes(typeResult.mime)) {
            // 对于新版本的 Office 文档，检查是否为 ZIP 格式（docx, xlsx, pptx 的基础格式）
            if (typeResult.mime !== 'application/zip') {
                throw new Error(`${ext.toUpperCase()} 文件类型验证失败，实际类型为 ${typeResult.mime}`)
            }
        }
        
        // 读取文件头进行进一步验证
        const buffer = fs.readFileSync(filePath)
        const header = buffer.slice(0, 8)
        
        // 检查 Office 文档的魔数
        const officeSignatures = {
            'doc': [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1], // OLE2 格式
            'xls': [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1], // OLE2 格式
            'ppt': [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1] // OLE2 格式
        }
        
        const expectedSignature = officeSignatures[ext.toLowerCase()]
        if (expectedSignature) {
            const headerMatches = expectedSignature.every((byte, index) => header[index] === byte)
            
            // 如果不是 OLE2 格式，检查是否为 ZIP 格式（新版本 Office 文档）
            if (!headerMatches) {
                const zipSignature = [0x50, 0x4B, 0x03, 0x04] // ZIP 文件头
                const isZip = zipSignature.every((byte, index) => header[index] === byte)
                
                if (!isZip) {
                    throw new Error(`${ext.toUpperCase()} 文件头验证失败`)
                }
            }
        }
    } catch (error) {
        if (error.message.includes('文件') || error.message.includes('类型') || error.message.includes('验证')) {
            throw error
        }
        throw new Error(`${ext.toUpperCase()} 文件安全验证失败`)
    }
}
