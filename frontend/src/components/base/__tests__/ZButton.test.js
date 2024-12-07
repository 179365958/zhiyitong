import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElButton, ElMessageBox } from 'element-plus'
import ZButton from '../ZButton.vue'
import { usePermission } from '@/composables/usePermission'

// Mock usePermission composable
vi.mock('@/composables/usePermission', () => ({
  usePermission: vi.fn()
}))

describe('ZButton.vue', () => {
  let wrapper

  const createWrapper = (props = {}, slots = {}) => {
    return mount(ZButton, {
      props,
      slots,
      global: {
        components: {
          ElButton
        },
        stubs: {
          ElIcon: true
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // 默认有权限
    usePermission.mockReturnValue({
      hasPermission: ref(true)
    })
  })

  // 基本渲染测试
  it('renders button with default props', () => {
    wrapper = createWrapper()
    expect(wrapper.find('.el-button').exists()).toBe(true)
  })

  // 按钮类型测试
  it('renders different button types', () => {
    const types = ['primary', 'success', 'warning', 'danger', 'info', 'text', 'default']
    
    types.forEach(type => {
      wrapper = createWrapper({ type })
      expect(wrapper.find(`.el-button--${type}`).exists()).toBe(true)
    })
  })

  // 按钮尺寸测试
  it('renders different button sizes', () => {
    const sizes = ['large', 'default', 'small']
    
    sizes.forEach(size => {
      wrapper = createWrapper({ size })
      if (size !== 'default') {
        expect(wrapper.find(`.el-button--${size}`).exists()).toBe(true)
      }
    })
  })

  // 禁用状态测试
  it('handles disabled state', async () => {
    wrapper = createWrapper({ disabled: true })
    expect(wrapper.find('.el-button').attributes('disabled')).toBe('')
    
    // 禁用状态下点击不应触发事件
    await wrapper.find('.el-button').trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  // 加载状态测试
  it('handles loading state', async () => {
    wrapper = createWrapper({ loading: true })
    expect(wrapper.find('.el-button').attributes('loading')).toBe('')
    
    // 加载状态下点击不应触发事件
    await wrapper.find('.el-button').trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  // 图标按钮测试
  it('renders with icon', () => {
    wrapper = createWrapper({ icon: 'Edit' })
    expect(wrapper.find('.el-icon').exists()).toBe(true)
  })

  // 圆形按钮测试
  it('renders circle button', () => {
    wrapper = createWrapper({ circle: true })
    expect(wrapper.find('.el-button').classes()).toContain('is-circle')
  })

  // 朴素按钮测试
  it('renders plain button', () => {
    wrapper = createWrapper({ plain: true })
    expect(wrapper.find('.el-button').classes()).toContain('is-plain')
  })

  // 文本按钮测试
  it('renders text button', () => {
    wrapper = createWrapper({ text: true })
    expect(wrapper.find('.el-button').classes()).toContain('is-text')
  })

  // 自动聚焦测试
  it('handles autofocus attribute', () => {
    wrapper = createWrapper({ autofocus: true })
    expect(wrapper.find('.el-button').attributes('autofocus')).toBe('')
  })

  // 原生类型测试
  it('handles native type attribute', () => {
    const types = ['button', 'submit', 'reset']
    types.forEach(type => {
      wrapper = createWrapper({ nativeType: type })
      expect(wrapper.find('.el-button').attributes('type')).toBe(type)
    })
  })

  // 点击事件测试
  it('emits click event when clicked', async () => {
    wrapper = createWrapper()
    await wrapper.find('.el-button').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')[0][0]).toBeInstanceOf(MouseEvent)
  })

  // 防抖点击测试
  it('handles debounced click', async () => {
    vi.useFakeTimers()
    wrapper = createWrapper({ debounce: 100 })

    // 快速点击多次
    await wrapper.find('.el-button').trigger('click')
    await wrapper.find('.el-button').trigger('click')
    await wrapper.find('.el-button').trigger('click')

    // 等待防抖时间
    await vi.advanceTimersByTime(150)
    
    // 应该只触发一次
    expect(wrapper.emitted('click')?.length).toBe(1)
    
    vi.useRealTimers()
  })

  // 节流点击测试
  it('handles throttled click', async () => {
    vi.useFakeTimers()
    wrapper = createWrapper({ throttle: 100 })

    // 快速点击多次
    await wrapper.find('.el-button').trigger('click')
    await wrapper.find('.el-button').trigger('click')
    await wrapper.find('.el-button').trigger('click')

    // 应该只触发一次
    expect(wrapper.emitted('click')?.length).toBe(1)

    // 等待节流时间
    await vi.advanceTimersByTime(150)

    // 再次点击应该可以触发
    await wrapper.find('.el-button').trigger('click')
    expect(wrapper.emitted('click')?.length).toBe(2)
    
    vi.useRealTimers()
  })

  // 权限控制测试
  describe('permission control', () => {
    it('renders button when has permission', () => {
      usePermission.mockReturnValue({
        hasPermission: ref(true)
      })
      wrapper = createWrapper({ permission: 'admin:edit' })
      expect(wrapper.find('.el-button').exists()).toBe(true)
    })

    it('does not render button when no permission', () => {
      usePermission.mockReturnValue({
        hasPermission: ref(false)
      })
      wrapper = createWrapper({ permission: 'admin:edit' })
      expect(wrapper.find('.el-button').exists()).toBe(false)
    })

    it('disables button when no permission and alwaysShow is true', () => {
      usePermission.mockReturnValue({
        hasPermission: ref(false)
      })
      wrapper = createWrapper({
        permission: 'admin:edit',
        alwaysShow: true
      })
      expect(wrapper.find('.el-button').exists()).toBe(true)
      expect(wrapper.find('.el-button').attributes('disabled')).toBe('')
    })
  })

  // 确认弹窗测试
  describe('confirm dialog', () => {
    beforeEach(() => {
      // Mock ElMessageBox
      vi.stubGlobal('ElMessageBox', {
        confirm: vi.fn()
      })
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('shows confirm dialog when confirmConfig is provided', async () => {
      const confirmConfig = {
        title: 'Confirm',
        message: 'Are you sure?'
      }
      wrapper = createWrapper({ confirmConfig })

      ElMessageBox.confirm.mockResolvedValueOnce()
      await wrapper.find('.el-button').trigger('click')

      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        confirmConfig.message,
        confirmConfig.title,
        expect.any(Object)
      )
      expect(wrapper.emitted('click')).toBeTruthy()
    })

    it('does not emit click event when confirm is canceled', async () => {
      wrapper = createWrapper({
        confirmConfig: {
          title: 'Confirm',
          message: 'Are you sure?'
        }
      })

      ElMessageBox.confirm.mockRejectedValueOnce()
      await wrapper.find('.el-button').trigger('click')

      expect(ElMessageBox.confirm).toHaveBeenCalled()
      expect(wrapper.emitted('click')).toBeFalsy()
    })

    it('handles custom confirm options', async () => {
      const confirmConfig = {
        title: 'Custom Title',
        message: 'Custom Message',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        type: 'warning'
      }
      wrapper = createWrapper({ confirmConfig })

      ElMessageBox.confirm.mockResolvedValueOnce()
      await wrapper.find('.el-button').trigger('click')

      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        confirmConfig.message,
        confirmConfig.title,
        {
          confirmButtonText: confirmConfig.confirmButtonText,
          cancelButtonText: confirmConfig.cancelButtonText,
          type: confirmConfig.type
        }
      )
    })
  })

  // 插槽测试
  describe('slots', () => {
    it('renders default slot content', () => {
      wrapper = createWrapper({}, {
        default: 'Button Text'
      })
      expect(wrapper.text()).toBe('Button Text')
    })

    it('renders complex slot content', () => {
      wrapper = createWrapper({}, {
        default: `
          <span class="text">Text</span>
          <span class="icon">Icon</span>
        `
      })
      expect(wrapper.find('.text').exists()).toBe(true)
      expect(wrapper.find('.icon').exists()).toBe(true)
    })
  })
})
