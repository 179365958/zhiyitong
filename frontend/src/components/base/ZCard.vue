<template>
  <el-card
    ref="cardRef"
    :class="[
      'z-card',
      `z-card--${type}`,
      {
        'z-card--hoverable': hoverable,
        'z-card--selected': selected,
        'z-card--loading': loading,
        'z-card--disabled': disabled
      }
    ]"
    :body-style="bodyStyle"
    :shadow="shadow"
    v-bind="$attrs"
    @click="handleClick"
  >
    <!-- 封面图片 -->
    <template #cover v-if="$slots.cover || cover">
      <slot name="cover">
        <div class="z-card__cover">
          <el-image
            :src="cover"
            :alt="title"
            fit="cover"
            :preview-src-list="previewSrcList"
            :initial-index="0"
            :preview-teleported="true"
          />
        </div>
      </slot>
    </template>

    <!-- 标题区域 -->
    <template #header v-if="$slots.header || title || subtitle || extra || avatar">
      <slot name="header">
        <div class="z-card__header">
          <div class="z-card__header-left">
            <slot name="avatar">
              <el-avatar
                v-if="avatar"
                :size="avatarSize"
                :src="avatar"
                :shape="avatarShape"
                class="z-card__avatar"
              />
            </slot>
            <div class="z-card__title-wrapper">
              <div v-if="title || $slots.title" class="z-card__title" :title="title">
                <slot name="title">{{ title }}</slot>
                <slot name="title-suffix" />
              </div>
              <div v-if="subtitle || $slots.subtitle" class="z-card__subtitle">
                <slot name="subtitle">{{ subtitle }}</slot>
              </div>
            </div>
          </div>
          <div v-if="extra || $slots.extra" class="z-card__extra">
            <slot name="extra">{{ extra }}</slot>
          </div>
        </div>
      </slot>
    </template>

    <!-- 内容区域 -->
    <template v-if="loading">
      <div class="z-card__loading">
        <slot name="loading">
          <el-skeleton :rows="3" animated />
        </slot>
      </div>
    </template>
    <template v-else>
      <slot />
    </template>

    <!-- 底部区域 -->
    <template v-if="$slots.footer || actions.length > 0">
      <div class="z-card__footer">
        <slot name="footer">
          <div v-if="actions.length > 0" class="z-card__actions">
            <template v-for="(action, index) in actions" :key="index">
              <div
                class="z-card__action-item"
                :class="{ 'z-card__action-item--disabled': action.disabled }"
                @click="handleActionClick(action, index)"
              >
                <el-icon v-if="action.icon" :size="16">
                  <component :is="action.icon" />
                </el-icon>
                <span>{{ action.text }}</span>
              </div>
              <el-divider
                v-if="index !== actions.length - 1"
                direction="vertical"
              />
            </template>
          </div>
        </slot>
      </div>
    </template>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { ElCard, ElAvatar, ElImage, ElSkeleton, ElDivider, ElIcon } from 'element-plus'

const props = defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'success', 'warning', 'danger', 'info'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  extra: {
    type: String,
    default: ''
  },
  cover: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  avatarSize: {
    type: [Number, String],
    default: 32
  },
  avatarShape: {
    type: String,
    default: 'circle',
    validator: (value) => ['circle', 'square'].includes(value)
  },
  actions: {
    type: Array,
    default: () => []
  },
  hoverable: {
    type: Boolean,
    default: false
  },
  selected: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  shadow: {
    type: String,
    default: 'always'
  },
  bodyStyle: {
    type: Object,
    default: () => ({})
  },
  previewSrcList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['click', 'action-click'])
const cardRef = ref(null)

// 处理卡片点击
const handleClick = (event) => {
  if (props.disabled) return
  emit('click', event)
}

// 处理操作按钮点击
const handleActionClick = (action, index) => {
  if (props.disabled || action.disabled) return
  emit('action-click', action, index)
}

defineExpose({
  cardRef
})
</script>

<style lang="scss">
.z-card {
  &--hoverable {
    cursor: pointer;
    transition: box-shadow 0.3s, border-color 0.3s;

    &:hover {
      box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16),
        0 3px 6px 0 rgba(0, 0, 0, 0.12),
        0 5px 12px 4px rgba(0, 0, 0, 0.09);
    }
  }

  &--selected {
    border-color: var(--el-color-primary);
  }

  &--disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__title-wrapper {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__title {
    font-size: 16px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__subtitle {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }

  &__extra {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }

  &__cover {
    width: 100%;
    height: 200px;
    overflow: hidden;

    .el-image {
      width: 100%;
      height: 100%;
    }
  }

  &__footer {
    margin-top: 16px;
    border-top: 1px solid var(--el-border-color-lighter);
    padding-top: 16px;
  }

  &__actions {
    display: flex;
    align-items: center;
  }

  &__action-item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    cursor: pointer;
    color: var(--el-text-color-regular);
    transition: color 0.3s;

    &:hover {
      color: var(--el-color-primary);
    }

    &--disabled {
      cursor: not-allowed;
      opacity: 0.6;

      &:hover {
        color: var(--el-text-color-regular);
      }
    }
  }
}
</style>
