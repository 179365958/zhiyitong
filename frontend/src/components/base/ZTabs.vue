<template>
  <div
    class="z-tabs"
    :class="{
      'z-tabs--card': type === 'card',
      'z-tabs--border-card': type === 'border-card',
      [`z-tabs--${tabPosition}`]: true
    }"
  >
    <!-- 标签页头部 -->
    <div class="z-tabs__header">
      <div
        ref="navWrapRef"
        class="z-tabs__nav-wrap"
        :class="{ 'is-scrollable': isScrollable }"
      >
        <!-- 自定义前置内容 -->
        <div v-if="$slots.prefix" class="z-tabs__prefix">
          <slot name="prefix" />
        </div>

        <!-- 标签导航 -->
        <el-tabs
          ref="tabsRef"
          v-model="activeTab"
          :type="type"
          :tab-position="tabPosition"
          :stretch="stretch"
          :closable="closable"
          :addable="addable"
          :editable="editable"
          :before-leave="handleBeforeLeave"
          @tab-click="handleTabClick"
          @tab-remove="handleTabRemove"
          @tab-add="handleTabAdd"
          @edit="handleEdit"
        >
          <el-tab-pane
            v-for="tab in visibleTabs"
            :key="tab.name"
            :label="tab.label"
            :name="tab.name"
            :closable="tab.closable ?? closable"
            :disabled="tab.disabled"
            :lazy="tab.lazy"
          >
            <template #label>
              <slot :name="`label-${tab.name}`" :tab="tab">
                <div
                  class="z-tabs__label"
                  :class="{ 'is-active': activeTab === tab.name }"
                >
                  <el-icon v-if="tab.icon" :size="16">
                    <component :is="tab.icon" />
                  </el-icon>
                  <span>{{ tab.label }}</span>
                  <el-badge
                    v-if="tab.badge"
                    :value="tab.badge"
                    :type="tab.badgeType || 'danger'"
                    :max="tab.badgeMax || 99"
                    :is-dot="tab.badgeIsDot"
                  />
                </div>
              </slot>
            </template>
            
            <!-- 标签内容 -->
            <div
              class="z-tabs__content"
              :class="{ 'is-active': activeTab === tab.name }"
            >
              <slot :name="tab.name" :tab="tab">
                <keep-alive v-if="tab.keepAlive">
                  <component
                    :is="tab.component"
                    v-bind="tab.props || {}"
                    :key="tab.name"
                  />
                </keep-alive>
                <component
                  v-else
                  :is="tab.component"
                  v-bind="tab.props || {}"
                  :key="tab.name"
                />
              </slot>
            </div>
          </el-tab-pane>
        </el-tabs>

        <!-- 自定义后置内容 -->
        <div v-if="$slots.suffix" class="z-tabs__suffix">
          <slot name="suffix" />
        </div>

        <!-- 更多操作下拉菜单 -->
        <el-dropdown
          v-if="showMoreButton && moreActions.length > 0"
          trigger="click"
          @command="handleMoreCommand"
        >
          <el-button
            class="z-tabs__more-button"
            :size="buttonSize"
            :disabled="!hasMoreActions"
            text
          >
            <el-icon><more /></el-icon>
          </el-button>
          
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="action in moreActions"
                :key="action.command"
                :command="action.command"
                :disabled="action.disabled"
                :divided="action.divided"
                :class="{ 'is-active': action.active }"
              >
                <el-icon v-if="action.icon">
                  <component :is="action.icon" />
                </el-icon>
                <span>{{ action.label }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 标签内容区域 -->
    <div class="z-tabs__main">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { More } from '@element-plus/icons-vue'
import { ElTabs, ElTabPane, ElIcon, ElBadge, ElButton, ElDropdown, ElDropdownMenu, ElDropdownItem, ElMessageBox } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true
  },
  tabs: {
    type: Array,
    default: () => [],
    validator: (value) => {
      return value.every(tab => tab.name && tab.label)
    }
  },
  type: {
    type: String,
    default: '',
    validator: (value) => ['', 'card', 'border-card'].includes(value)
  },
  tabPosition: {
    type: String,
    default: 'top',
    validator: (value) => ['top', 'right', 'bottom', 'left'].includes(value)
  },
  closable: {
    type: Boolean,
    default: false
  },
  addable: {
    type: Boolean,
    default: false
  },
  editable: {
    type: Boolean,
    default: false
  },
  stretch: {
    type: Boolean,
    default: false
  },
  showMoreButton: {
    type: Boolean,
    default: false
  },
  moreActions: {
    type: Array,
    default: () => []
  },
  buttonSize: {
    type: String,
    default: 'default',
    validator: (value) => ['large', 'default', 'small'].includes(value)
  },
  beforeClose: {
    type: Function,
    default: null
  },
  beforeLeave: {
    type: Function,
    default: null
  }
})

const emit = defineEmits([
  'update:modelValue',
  'tab-click',
  'tab-remove',
  'tab-add',
  'edit',
  'more-command'
])

const tabsRef = ref(null)
const navWrapRef = ref(null)
const activeTab = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 可见的标签页
const visibleTabs = computed(() => {
  return props.tabs.filter(tab => !tab.hidden)
})

// 是否有更多操作
const hasMoreActions = computed(() => {
  return props.moreActions.some(action => !action.disabled)
})

// 是否可滚动
const isScrollable = ref(false)

// 检查是否需要滚动
const checkScrollable = () => {
  if (!navWrapRef.value) return

  const navWrap = navWrapRef.value
  const navWidth = navWrap.offsetWidth
  const navScrollWidth = navWrap.scrollWidth

  isScrollable.value = navScrollWidth > navWidth
}

// 标签切换前的处理
const handleBeforeLeave = async (newName, oldName) => {
  if (props.beforeLeave) {
    try {
      await props.beforeLeave(newName, oldName)
      return true
    } catch {
      return false
    }
  }
  return true
}

// 处理标签点击
const handleTabClick = (tab) => {
  emit('tab-click', tab)
}

// 处理标签移除
const handleTabRemove = async (name) => {
  if (props.beforeClose) {
    try {
      await props.beforeClose(name)
    } catch {
      return
    }
  }

  const index = props.tabs.findIndex(tab => tab.name === name)
  if (index === -1) return

  // 如果关闭的是当前标签，需要激活相邻的标签
  if (activeTab.value === name) {
    const nextTab = props.tabs[index + 1] || props.tabs[index - 1]
    if (nextTab) {
      activeTab.value = nextTab.name
    }
  }

  emit('tab-remove', name)
}

// 处理标签新增
const handleTabAdd = () => {
  emit('tab-add')
}

// 处理编辑操作
const handleEdit = (targetName, action) => {
  if (action === 'add') {
    handleTabAdd()
  } else if (action === 'remove') {
    handleTabRemove(targetName)
  }
  emit('edit', targetName, action)
}

// 处理更多操作
const handleMoreCommand = (command) => {
  emit('more-command', command)
}

// 监听窗口大小变化
const handleResize = () => {
  nextTick(() => {
    checkScrollable()
  })
}

// 监听标签变化
watch(
  () => props.tabs,
  () => {
    nextTick(() => {
      checkScrollable()
    })
  },
  { deep: true }
)

onMounted(() => {
  checkScrollable()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

defineExpose({
  tabsRef,
  activeTab,
  visibleTabs
})
</script>

<style lang="scss" scoped>
.z-tabs {
  position: relative;
  width: 100%;

  &--card,
  &--border-card {
    :deep(.el-tabs__header) {
      border-bottom: none;
    }
  }

  &--right,
  &--left {
    display: flex;

    .z-tabs__main {
      flex: 1;
      min-width: 0;
    }
  }

  &__header {
    position: relative;
    margin-bottom: 15px;
  }

  &__nav-wrap {
    position: relative;
    display: flex;
    align-items: center;
    overflow: hidden;

    &.is-scrollable {
      padding: 0 20px;
    }
  }

  &__prefix,
  &__suffix {
    flex-shrink: 0;
    padding: 0 10px;
  }

  &__label {
    display: inline-flex;
    align-items: center;
    gap: 4px;

    .el-icon {
      margin-right: 4px;
    }

    &.is-active {
      color: var(--el-color-primary);
    }
  }

  &__content {
    display: none;
    padding: 15px;

    &.is-active {
      display: block;
    }
  }

  &__more-button {
    margin-left: 8px;
  }

  &__main {
    position: relative;
    padding: 15px 0;
  }
}

:deep(.el-tabs__nav-wrap) {
  &::after {
    height: 1px;
  }
}

:deep(.el-tabs__item) {
  &.is-active {
    font-weight: 500;
  }

  &.is-disabled {
    cursor: not-allowed;
  }
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 4px;

  &.is-active {
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
  }
}
</style>
