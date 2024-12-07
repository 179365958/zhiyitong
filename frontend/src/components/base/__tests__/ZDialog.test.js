import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ZDialog from '../ZDialog.vue'

describe('ZDialog 组件', () => {
  let wrapper

  // 每个测试用例前都重新挂载组件
  beforeEach(() => {
    wrapper = mount(ZDialog, {
      props: {
        modelValue: true,
        title: '测试弹窗'
      }
    })
  })

  // 测试组件渲染
  it('正确渲染弹窗组件', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.classes()).toContain('el-dialog')
  })

  // 测试标题显示
  it('正确显示弹窗标题', () => {
    const title = wrapper.find('.el-dialog__title')
    expect(title.text()).toBe('测试弹窗')
  })

  // 测试自定义宽度
  it('正确应用自定义宽度', async () => {
    await wrapper.setProps({ width: '600px' })
    const dialog = wrapper.find('.el-dialog')
    expect(dialog.attributes('style')).toContain('width: 600px')
  })

  // 测试全屏显示
  it('全屏模式正常工作', async () => {
    await wrapper.setProps({ fullscreen: true })
    const dialog = wrapper.find('.el-dialog')
    expect(dialog.classes()).toContain('is-fullscreen')
  })

  // 测试底部按钮
  it('底部按钮正确显示', () => {
    const footer = wrapper.find('.dialog-footer')
    expect(footer.exists()).toBe(true)

    const cancelBtn = wrapper.find('.dialog-footer .el-button:first-child')
    const confirmBtn = wrapper.find('.dialog-footer .el-button:last-child')
    
    expect(cancelBtn.text()).toBe('取消')
    expect(confirmBtn.text()).toBe('确定')
  })

  // 测试取消按钮事件
  it('取消按钮点击事件正常触发', async () => {
    const cancelBtn = wrapper.find('.dialog-footer .el-button:first-child')
    await cancelBtn.trigger('click')
    
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted[0]).toEqual([false])
  })

  // 测试确认按钮事件
  it('确认按钮点击事件正常触发', async () => {
    const confirmBtn = wrapper.find('.dialog-footer .el-button:last-child')
    await confirmBtn.trigger('click')
    
    const emitted = wrapper.emitted('confirm')
    expect(emitted).toBeTruthy()
  })

  // 测试beforeConfirm回调
  it('beforeConfirm回调正常工作', async () => {
    const beforeConfirm = vi.fn().mockResolvedValue()
    await wrapper.setProps({ beforeConfirm })

    const confirmBtn = wrapper.find('.dialog-footer .el-button:last-child')
    await confirmBtn.trigger('click')
    
    expect(beforeConfirm).toHaveBeenCalled()
  })

  // 测试可滚动内容
  it('可滚动内容区域正常工作', async () => {
    await wrapper.setProps({ 
      scrollable: true,
      contentHeight: '200px'
    })
    
    const content = wrapper.find('.dialog-content')
    expect(content.classes()).toContain('is-scrollable')
    expect(content.attributes('style')).toContain('height: 200px')
  })

  // 测试关闭按钮
  it('关闭按钮正常工作', async () => {
    const closeBtn = wrapper.find('.el-dialog__close')
    await closeBtn.trigger('click')
    
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted[0]).toEqual([false])
  })

  // 测试自定义头部插槽
  it('自定义头部插槽正常工作', () => {
    const wrapper = mount(ZDialog, {
      props: { modelValue: true },
      slots: {
        header: '<div class="custom-header">自定义头部</div>'
      }
    })

    const customHeader = wrapper.find('.custom-header')
    expect(customHeader.exists()).toBe(true)
    expect(customHeader.text()).toBe('自定义头部')
  })
})
