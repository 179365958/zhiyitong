import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElTabs, ElTabPane, ElDropdown, ElDropdownMenu, ElDropdownItem, ElBadge } from 'element-plus'
import ZTabs from '../ZTabs.vue'

describe('ZTabs.vue', () => {
  let wrapper

  const defaultTabs = [
    { name: 'tab1', label: 'Tab 1' },
    { name: 'tab2', label: 'Tab 2' },
    { name: 'tab3', label: 'Tab 3' }
  ]

  const createWrapper = (props = {}, slots = {}) => {
    return mount(ZTabs, {
      props: {
        modelValue: 'tab1',
        tabs: defaultTabs,
        ...props
      },
      slots,
      global: {
        components: {
          ElTabs,
          ElTabPane,
          ElDropdown,
          ElDropdownMenu,
          ElDropdownItem,
          ElBadge
        },
        stubs: {
          ElIcon: true,
          'el-button': true
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 基本渲染测试
  it('renders tabs with default props', () => {
    wrapper = createWrapper()
    expect(wrapper.find('.z-tabs').exists()).toBe(true)
    expect(wrapper.find('.el-tabs').exists()).toBe(true)
    expect(wrapper.findAll('.el-tab-pane').length).toBe(defaultTabs.length)
  })

  // 标签类型测试
  it('renders different tab types', () => {
    const types = ['card', 'border-card']
    
    types.forEach(type => {
      wrapper = createWrapper({ type })
      expect(wrapper.find(`.z-tabs--${type}`).exists()).toBe(true)
    })
  })

  // 标签位置测试
  it('renders tabs in different positions', () => {
    const positions = ['top', 'right', 'bottom', 'left']
    
    positions.forEach(position => {
      wrapper = createWrapper({ tabPosition: position })
      expect(wrapper.find('.el-tabs').attributes('tab-position')).toBe(position)
    })
  })

  // 可关闭标签测试
  it('handles closable tabs correctly', () => {
    wrapper = createWrapper({ closable: true })
    expect(wrapper.find('.el-tabs__item').attributes('closable')).toBe('true')
  })

  // 可新增标签测试
  it('handles addable tabs correctly', () => {
    wrapper = createWrapper({ addable: true })
    expect(wrapper.find('.el-tabs__new-tab').exists()).toBe(true)
  })

  // 标签激活测试
  it('handles tab activation correctly', async () => {
    wrapper = createWrapper()
    
    await wrapper.find('.el-tabs__item:nth-child(2)').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('tab-click')).toBeTruthy()
  })

  // 标签移除测试
  it('handles tab removal correctly', async () => {
    const beforeClose = vi.fn().mockResolvedValue(true)
    wrapper = createWrapper({ 
      closable: true,
      beforeClose
    })
    
    await wrapper.vm.handleTabRemove('tab1')
    expect(beforeClose).toHaveBeenCalledWith('tab1')
    expect(wrapper.emitted('tab-remove')).toBeTruthy()
  })

  // 标签新增测试
  it('handles tab addition correctly', async () => {
    wrapper = createWrapper({ addable: true })
    
    await wrapper.vm.handleTabAdd()
    expect(wrapper.emitted('tab-add')).toBeTruthy()
  })

  // 带图标的标签测试
  it('renders tabs with icons correctly', () => {
    const tabsWithIcons = [
      { name: 'tab1', label: 'Tab 1', icon: 'Document' }
    ]
    wrapper = createWrapper({ tabs: tabsWithIcons })
    
    expect(wrapper.find('.el-icon').exists()).toBe(true)
  })

  // 带徽章的标签测试
  it('renders tabs with badges correctly', () => {
    const tabsWithBadges = [
      { name: 'tab1', label: 'Tab 1', badge: '99' }
    ]
    wrapper = createWrapper({ tabs: tabsWithBadges })
    
    expect(wrapper.find('.el-badge').exists()).toBe(true)
  })

  // 禁用标签测试
  it('handles disabled tabs correctly', () => {
    const tabsWithDisabled = [
      { name: 'tab1', label: 'Tab 1', disabled: true }
    ]
    wrapper = createWrapper({ tabs: tabsWithDisabled })
    
    expect(wrapper.find('.el-tabs__item.is-disabled').exists()).toBe(true)
  })

  // 延迟加载测试
  it('handles lazy loading correctly', () => {
    const tabsWithLazy = [
      { name: 'tab1', label: 'Tab 1', lazy: true }
    ]
    wrapper = createWrapper({ tabs: tabsWithLazy })
    
    expect(wrapper.find('.el-tab-pane').attributes('lazy')).toBe('true')
  })

  // 更多按钮测试
  it('renders more button correctly', () => {
    const moreActions = [
      { label: 'Refresh', command: 'refresh' }
    ]
    wrapper = createWrapper({ 
      showMoreButton: true,
      moreActions 
    })
    
    expect(wrapper.find('.z-tabs__more-button').exists()).toBe(true)
  })

  // 更多操作测试
  it('handles more actions correctly', async () => {
    const moreActions = [
      { label: 'Refresh', command: 'refresh' }
    ]
    wrapper = createWrapper({ 
      showMoreButton: true,
      moreActions 
    })
    
    await wrapper.vm.handleMoreCommand('refresh')
    expect(wrapper.emitted('more-command')).toBeTruthy()
    expect(wrapper.emitted('more-command')[0]).toEqual(['refresh'])
  })

  // 自定义前置内容测试
  it('renders prefix slot correctly', () => {
    wrapper = createWrapper({}, {
      prefix: '<div class="custom-prefix">Prefix</div>'
    })
    expect(wrapper.find('.custom-prefix').exists()).toBe(true)
  })

  // 自定义后置内容测试
  it('renders suffix slot correctly', () => {
    wrapper = createWrapper({}, {
      suffix: '<div class="custom-suffix">Suffix</div>'
    })
    expect(wrapper.find('.custom-suffix').exists()).toBe(true)
  })

  // 自定义标签内容测试
  it('renders custom tab label correctly', () => {
    wrapper = createWrapper({}, {
      'label-tab1': '<div class="custom-label">Custom Label</div>'
    })
    expect(wrapper.find('.custom-label').exists()).toBe(true)
  })

  // 自定义组件渲染测试
  it('renders custom component correctly', () => {
    const CustomComponent = {
      template: '<div class="custom-component">Custom Content</div>'
    }
    const tabsWithComponent = [
      { 
        name: 'tab1', 
        label: 'Tab 1',
        component: CustomComponent
      }
    ]
    wrapper = createWrapper({ tabs: tabsWithComponent })
    
    expect(wrapper.find('.custom-component').exists()).toBe(true)
  })

  // 编辑模式测试
  it('handles edit mode correctly', async () => {
    wrapper = createWrapper({ editable: true })
    
    await wrapper.vm.handleEdit('tab1', 'remove')
    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')[0]).toEqual(['tab1', 'remove'])
  })

  // 自适应宽度测试
  it('handles stretch mode correctly', () => {
    wrapper = createWrapper({ stretch: true })
    expect(wrapper.find('.el-tabs').attributes('stretch')).toBe('true')
  })
})
