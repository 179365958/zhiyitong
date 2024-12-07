import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElUpload, ElDialog } from 'element-plus'
import ZUpload from '../ZUpload.vue'

describe('ZUpload.vue', () => {
  let wrapper

  const createWrapper = (props = {}, slots = {}) => {
    return mount(ZUpload, {
      props: {
        action: '/api/upload',
        ...props
      },
      slots,
      global: {
        components: {
          ElUpload,
          ElDialog
        },
        stubs: {
          ElIcon: true,
          'el-button': true,
          'el-image': true
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 基本渲染测试
  it('renders upload component with default props', () => {
    wrapper = createWrapper()
    expect(wrapper.find('.z-upload').exists()).toBe(true)
    expect(wrapper.find('.el-upload').exists()).toBe(true)
  })

  // 文件上传类型测试
  it('renders file upload type correctly', () => {
    wrapper = createWrapper({ type: 'file' })
    expect(wrapper.find('.el-upload').exists()).toBe(true)
    expect(wrapper.find('.el-upload__text').exists()).toBe(true)
  })

  // 图片上传类型测试
  it('renders image upload type correctly', () => {
    wrapper = createWrapper({ type: 'image' })
    expect(wrapper.find('.el-upload').exists()).toBe(true)
    expect(wrapper.find('.avatar-uploader-icon').exists()).toBe(true)
  })

  // 拖拽上传测试
  it('renders drag upload correctly', () => {
    wrapper = createWrapper({ 
      type: 'file',
      drag: true 
    })
    expect(wrapper.find('.el-upload-dragger').exists()).toBe(true)
  })

  // 文件列表测试
  it('renders file list correctly', () => {
    const fileList = [
      { name: 'test.jpg', url: 'http://example.com/test.jpg' }
    ]
    wrapper = createWrapper({ fileList })
    expect(wrapper.props('fileList')).toEqual(fileList)
  })

  // 上传限制测试
  it('handles file limit correctly', async () => {
    const onExceed = vi.fn()
    wrapper = createWrapper({
      limit: 1,
      fileList: [{ name: 'existing.jpg', url: 'http://example.com/existing.jpg' }],
      onExceed
    })

    // 模拟超出限制的文件上传
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
    await wrapper.vm.handleExceed([file], wrapper.vm.fileList)
    
    expect(onExceed).toHaveBeenCalled()
  })

  // 文件大小限制测试
  it('handles file size limit correctly', async () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
    Object.defineProperty(mockFile, 'size', { value: 15 * 1024 * 1024 }) // 15MB

    wrapper = createWrapper({ maxSize: 10 }) // 限制 10MB
    
    const result = await wrapper.vm.handleBeforeUpload(mockFile)
    expect(result).toBe(false)
  })

  // 自定义上传前处理测试
  it('handles custom beforeUpload correctly', async () => {
    const beforeUpload = vi.fn().mockResolvedValue(true)
    wrapper = createWrapper({ beforeUpload })

    const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
    await wrapper.vm.handleBeforeUpload(file)
    
    expect(beforeUpload).toHaveBeenCalledWith(file)
  })

  // 上传进度测试
  it('handles upload progress correctly', () => {
    const onProgress = vi.fn()
    wrapper = createWrapper({ onProgress })

    const event = { percent: 50 }
    const file = { name: 'test.jpg' }
    wrapper.vm.handleProgress(event, file)
    
    expect(wrapper.emitted('progress')).toBeTruthy()
    expect(wrapper.emitted('progress')[0][0]).toEqual({ event, file })
  })

  // 上传成功测试
  it('handles upload success correctly', () => {
    wrapper = createWrapper()

    const response = { url: 'http://example.com/test.jpg' }
    const file = { name: 'test.jpg' }
    wrapper.vm.handleSuccess(response, file)
    
    expect(wrapper.emitted('success')).toBeTruthy()
    expect(wrapper.emitted('success')[0][0]).toEqual({ response, file })
  })

  // 上传失败测试
  it('handles upload error correctly', () => {
    wrapper = createWrapper()

    const error = new Error('Upload failed')
    const file = { name: 'test.jpg' }
    wrapper.vm.handleError(error, file)
    
    expect(wrapper.emitted('error')).toBeTruthy()
    expect(wrapper.emitted('error')[0][0]).toEqual({ error, file })
  })

  // 文件移除测试
  it('handles file remove correctly', () => {
    wrapper = createWrapper()

    const file = { name: 'test.jpg' }
    wrapper.vm.handleRemove(file)
    
    expect(wrapper.emitted('remove')).toBeTruthy()
    expect(wrapper.emitted('remove')[0][0]).toEqual({ file })
  })

  // 图片预览测试
  it('handles image preview correctly', async () => {
    wrapper = createWrapper({ type: 'image' })

    const file = { url: 'http://example.com/test.jpg' }
    await wrapper.vm.handlePreview(file)
    
    expect(wrapper.vm.previewUrl).toBe(file.url)
    expect(wrapper.vm.previewVisible).toBe(true)
  })

  // 禁用状态测试
  it('handles disabled state correctly', () => {
    wrapper = createWrapper({ disabled: true })
    expect(wrapper.find('.el-upload').attributes('disabled')).toBe('')
  })

  // 手动上传测试
  it('handles manual upload correctly', () => {
    wrapper = createWrapper({ autoUpload: false })
    
    const submit = vi.spyOn(wrapper.vm.uploadRef, 'submit')
    wrapper.vm.submit()
    
    expect(submit).toHaveBeenCalled()
  })

  // 清空文件列表测试
  it('handles clear files correctly', () => {
    wrapper = createWrapper()
    
    const clearFiles = vi.spyOn(wrapper.vm.uploadRef, 'clearFiles')
    wrapper.vm.clearFiles()
    
    expect(clearFiles).toHaveBeenCalled()
  })

  // 中止上传测试
  it('handles abort upload correctly', () => {
    wrapper = createWrapper()
    
    const abort = vi.spyOn(wrapper.vm.uploadRef, 'abort')
    wrapper.vm.abort()
    
    expect(abort).toHaveBeenCalled()
  })

  // 自定义提示文本测试
  it('renders custom tip text correctly', () => {
    const tip = '只能上传jpg/png文件'
    wrapper = createWrapper({ tip })
    
    expect(wrapper.find('.el-upload__tip').text()).toBe(tip)
  })

  // 自定义请求头测试
  it('handles custom headers correctly', () => {
    const headers = { 'X-Token': 'test' }
    wrapper = createWrapper({ headers })
    
    expect(wrapper.props('headers')).toEqual(headers)
  })

  // 自定义上传数据测试
  it('handles custom upload data correctly', () => {
    const data = { type: 'avatar' }
    wrapper = createWrapper({ data })
    
    expect(wrapper.props('data')).toEqual(data)
  })
})
