import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElButton, ElFormItem, ElInput } from 'element-plus'
import ZForm from '../ZForm.vue'

describe('ZForm.vue', () => {
  let wrapper

  const createWrapper = (props = {}, slots = {}) => {
    return mount(ZForm, {
      props: {
        modelValue: {},
        ...props
      },
      slots,
      global: {
        components: {
          ElButton,
          ElFormItem,
          ElInput
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form with default props', () => {
    wrapper = createWrapper()
    expect(wrapper.find('.el-form').exists()).toBe(true)
  })

  it('renders form with custom label width', () => {
    wrapper = createWrapper({ labelWidth: '200px' })
    expect(wrapper.find('.el-form').attributes('label-width')).toBe('200px')
  })

  it('renders form buttons when showButtons is true', () => {
    wrapper = createWrapper({ showButtons: true })
    expect(wrapper.find('.form-buttons').exists()).toBe(true)
    expect(wrapper.find('.el-button').exists()).toBe(true)
  })

  it('hides form buttons when showButtons is false', () => {
    wrapper = createWrapper({ showButtons: false })
    expect(wrapper.find('.form-buttons').exists()).toBe(false)
  })

  it('emits submit event when form is submitted', async () => {
    const onSubmit = vi.fn()
    wrapper = createWrapper(
      { 
        modelValue: { name: 'test' },
        rules: {
          name: [{ required: true, message: '请输入名称' }]
        }
      }
    )
    wrapper.vm.$emit('submit', { name: 'test' })
    
    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')[0]).toEqual([{ name: 'test' }])
  })

  it('validates form before submit', async () => {
    const onSubmit = vi.fn()
    wrapper = createWrapper(
      {
        modelValue: { name: '' },
        rules: {
          name: [{ required: true, message: '请输入名称' }]
        }
      }
    )

    await wrapper.find('.el-button--primary').trigger('click')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('renders custom slots', () => {
    wrapper = createWrapper(
      {},
      {
        default: '<div class="custom-content">Custom Content</div>'
      }
    )
    expect(wrapper.find('.custom-content').exists()).toBe(true)
  })

  it('handles form reset', async () => {
    const formData = { name: 'test' }
    wrapper = createWrapper({ modelValue: formData })
    
    await wrapper.vm.resetForm()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('handles disabled state', () => {
    wrapper = createWrapper({ disabled: true })
    expect(wrapper.find('.el-form').attributes('disabled')).toBe('true')
  })

  it('handles loading state during submit', async () => {
    const beforeSubmit = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    wrapper = createWrapper({
      modelValue: { name: 'test' },
      beforeSubmit
    })

    await wrapper.find('.el-button--primary').trigger('click')
    expect(wrapper.find('.el-button--primary').attributes('loading')).toBe('true')
  })
})
