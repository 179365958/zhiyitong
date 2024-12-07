import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElCard, ElAvatar, ElImage, ElSkeleton, ElDivider } from 'element-plus'
import ZCard from '../ZCard.vue'

describe('ZCard.vue', () => {
  let wrapper

  const createWrapper = (props = {}, slots = {}) => {
    return mount(ZCard, {
      props,
      slots,
      global: {
        components: {
          ElCard,
          ElAvatar,
          ElImage,
          ElSkeleton,
          ElDivider
        },
        stubs: {
          ElIcon: true,
          'el-badge': true
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 基本渲染测试
  it('renders card with default props', () => {
    wrapper = createWrapper()
    expect(wrapper.find('.z-card').exists()).toBe(true)
    expect(wrapper.find('.el-card').exists()).toBe(true)
  })

  // 卡片类型测试
  it('renders different card types', () => {
    const types = ['primary', 'success', 'warning', 'danger', 'info']
    
    types.forEach(type => {
      wrapper = createWrapper({ type })
      expect(wrapper.find(`.z-card--${type}`).exists()).toBe(true)
    })
  })

  // 标题渲染测试
  it('renders card title correctly', () => {
    const title = 'Test Card'
    wrapper = createWrapper({ title })
    expect(wrapper.find('.z-card__title').text()).toBe(title)
  })

  // 副标题渲染测试
  it('renders card subtitle correctly', () => {
    const subtitle = 'Test Subtitle'
    wrapper = createWrapper({ subtitle })
    expect(wrapper.find('.z-card__subtitle').text()).toBe(subtitle)
  })

  // 额外内容测试
  it('renders extra content correctly', () => {
    const extra = 'Extra Info'
    wrapper = createWrapper({ extra })
    expect(wrapper.find('.z-card__extra').text()).toBe(extra)
  })

  // 封面图片测试
  it('renders cover image correctly', () => {
    const cover = 'http://example.com/image.jpg'
    wrapper = createWrapper({ cover })
    expect(wrapper.find('.z-card__cover').exists()).toBe(true)
    expect(wrapper.find('.el-image').attributes('src')).toBe(cover)
  })

  // 头像测试
  it('renders avatar correctly', () => {
    const avatar = 'http://example.com/avatar.jpg'
    wrapper = createWrapper({ avatar })
    expect(wrapper.find('.z-card__avatar').exists()).toBe(true)
    expect(wrapper.find('.el-avatar').attributes('src')).toBe(avatar)
  })

  // 头像形状测试
  it('renders different avatar shapes', () => {
    const shapes = ['circle', 'square']
    
    shapes.forEach(shape => {
      wrapper = createWrapper({ 
        avatar: 'http://example.com/avatar.jpg',
        avatarShape: shape 
      })
      expect(wrapper.find(`.z-card__avatar--${shape}`).exists()).toBe(true)
    })
  })

  // 操作按钮测试
  it('renders action buttons correctly', () => {
    const actions = [
      { text: 'Edit', icon: 'Edit' },
      { text: 'Delete', icon: 'Delete' }
    ]
    wrapper = createWrapper({ actions })
    
    const actionItems = wrapper.findAll('.z-card__action-item')
    expect(actionItems.length).toBe(actions.length)
    expect(actionItems[0].text()).toBe('Edit')
    expect(actionItems[1].text()).toBe('Delete')
  })

  // 悬浮效果测试
  it('handles hoverable state correctly', () => {
    wrapper = createWrapper({ hoverable: true })
    expect(wrapper.find('.z-card--hoverable').exists()).toBe(true)
  })

  // 选中状态测试
  it('handles selected state correctly', () => {
    wrapper = createWrapper({ selected: true })
    expect(wrapper.find('.z-card--selected').exists()).toBe(true)
  })

  // 加载状态测试
  it('handles loading state correctly', () => {
    wrapper = createWrapper({ loading: true })
    expect(wrapper.find('.z-card--loading').exists()).toBe(true)
    expect(wrapper.find('.el-skeleton').exists()).toBe(true)
  })

  // 禁用状态测试
  it('handles disabled state correctly', () => {
    wrapper = createWrapper({ disabled: true })
    expect(wrapper.find('.z-card--disabled').exists()).toBe(true)
  })

  // 阴影显示测试
  it('handles shadow display correctly', () => {
    const shadows = ['always', 'hover', 'never']
    
    shadows.forEach(shadow => {
      wrapper = createWrapper({ shadow })
      expect(wrapper.find('.el-card').attributes('shadow')).toBe(shadow)
    })
  })

  // 点击事件测试
  it('emits click event when clicked', async () => {
    wrapper = createWrapper()
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  // 禁用时点击测试
  it('does not emit click event when disabled', async () => {
    wrapper = createWrapper({ disabled: true })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  // 操作按钮点击测试
  it('handles action button clicks correctly', async () => {
    const onClick = vi.fn()
    const actions = [
      { 
        text: 'Edit',
        icon: 'Edit',
        onClick
      }
    ]
    wrapper = createWrapper({ actions })
    
    await wrapper.find('.z-card__action-item').trigger('click')
    expect(onClick).toHaveBeenCalled()
    expect(wrapper.emitted('action-click')).toBeTruthy()
  })

  // 禁用的操作按钮测试
  it('handles disabled action buttons correctly', async () => {
    const onClick = vi.fn()
    const actions = [
      { 
        text: 'Edit',
        icon: 'Edit',
        onClick,
        disabled: true
      }
    ]
    wrapper = createWrapper({ actions })
    
    await wrapper.find('.z-card__action-item--disabled').trigger('click')
    expect(onClick).not.toHaveBeenCalled()
  })

  // 自定义插槽测试
  it('renders custom slots correctly', () => {
    wrapper = createWrapper({}, {
      header: '<div class="custom-header">Custom Header</div>',
      cover: '<div class="custom-cover">Custom Cover</div>',
      'title-suffix': '<span class="title-suffix">*</span>',
      subtitle: '<div class="custom-subtitle">Custom Subtitle</div>',
      extra: '<div class="custom-extra">Custom Extra</div>',
      default: '<div class="custom-content">Custom Content</div>',
      footer: '<div class="custom-footer">Custom Footer</div>'
    })

    expect(wrapper.find('.custom-header').exists()).toBe(true)
    expect(wrapper.find('.custom-cover').exists()).toBe(true)
    expect(wrapper.find('.title-suffix').exists()).toBe(true)
    expect(wrapper.find('.custom-subtitle').exists()).toBe(true)
    expect(wrapper.find('.custom-extra').exists()).toBe(true)
    expect(wrapper.find('.custom-content').exists()).toBe(true)
    expect(wrapper.find('.custom-footer').exists()).toBe(true)
  })

  // 图片预览测试
  it('handles image preview correctly', () => {
    const cover = 'http://example.com/image.jpg'
    const previewSrcList = [cover]
    wrapper = createWrapper({ cover, previewSrcList })
    
    expect(wrapper.find('.el-image').attributes('preview-src-list')).toBeTruthy()
  })
})
