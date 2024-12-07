import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ZTable from '../ZTable.vue'

// 模拟测试数据
const mockTableData = [
  { id: 1, name: '测试1', code: '001' },
  { id: 2, name: '测试2', code: '002' },
  { id: 3, name: '测试3', code: '003' }
]

describe('ZTable 组件', () => {
  let wrapper

  // 每个测试用例前都重新挂载组件
  beforeEach(() => {
    wrapper = mount(ZTable, {
      props: {
        data: mockTableData
      }
    })
  })

  // 测试组件渲染
  it('正确渲染表格组件', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.classes()).toContain('z-table')
  })

  // 测试数据显示
  it('正确显示表格数据', () => {
    const rows = wrapper.findAll('.el-table__row')
    expect(rows).toHaveLength(mockTableData.length)
  })

  // 测试工具栏功能
  it('工具栏按钮正确显示', () => {
    const toolbar = wrapper.find('.table-toolbar')
    expect(toolbar.exists()).toBe(true)

    const refreshBtn = wrapper.find('[title="刷新"]')
    expect(refreshBtn.exists()).toBe(true)
  })

  // 测试分页功能
  it('分页器正确显示', () => {
    const pagination = wrapper.find('.table-pagination')
    expect(pagination.exists()).toBe(true)
  })

  // 测试选择功能
  it('多选功能正常工作', async () => {
    await wrapper.setProps({ selectionType: 'checkbox' })
    
    const checkboxes = wrapper.findAll('.el-checkbox')
    await checkboxes[1].trigger('click')
    
    const emitted = wrapper.emitted('selection-change')
    expect(emitted).toBeTruthy()
    expect(emitted[0][0]).toHaveLength(1)
  })

  // 测试排序功能
  it('排序功能正常工作', async () => {
    const sortableColumn = wrapper.find('.el-table__column-sort')
    await sortableColumn.trigger('click')
    
    const emitted = wrapper.emitted('sort-change')
    expect(emitted).toBeTruthy()
  })

  // 测试刷新功能
  it('刷新按钮点击事件正常触发', async () => {
    const refreshBtn = wrapper.find('[title="刷新"]')
    await refreshBtn.trigger('click')
    
    const emitted = wrapper.emitted('refresh')
    expect(emitted).toBeTruthy()
  })

  // 测试密度设置
  it('密度设置正常工作', async () => {
    await wrapper.setProps({ showDensity: true })
    
    const densityBtn = wrapper.find('.density-button')
    await densityBtn.trigger('click')
    
    const dropdown = wrapper.find('.el-dropdown-menu')
    expect(dropdown.exists()).toBe(true)
  })

  // 测试列设置
  it('列设置功能正常工作', async () => {
    await wrapper.setProps({ showSetting: true })
    
    const settingBtn = wrapper.find('.setting-button')
    await settingBtn.trigger('click')
    
    const drawer = wrapper.find('.el-drawer')
    expect(drawer.exists()).toBe(true)
  })
})
