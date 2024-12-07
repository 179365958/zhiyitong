<template>
  <div class="z-upload">
    <!-- 文件上传 -->
    <template v-if="type === 'file'">
      <el-upload
        ref="uploadRef"
        :action="action"
        :headers="headers"
        :data="data"
        :multiple="multiple"
        :name="name"
        :with-credentials="withCredentials"
        :show-file-list="showFileList"
        :drag="drag"
        :accept="accept"
        :file-list="fileList"
        :auto-upload="autoUpload"
        :limit="limit"
        :on-exceed="handleExceed"
        :before-upload="handleBeforeUpload"
        :on-progress="handleProgress"
        :on-success="handleSuccess"
        :on-error="handleError"
        :on-remove="handleRemove"
        :disabled="disabled"
      >
        <template v-if="drag">
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处或 <em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip" v-if="tip">{{ tip }}</div>
          </template>
        </template>
        <template v-else>
          <el-button type="primary" :icon="Plus" :disabled="disabled">
            {{ buttonText }}
          </el-button>
          <template #tip>
            <div class="el-upload__tip" v-if="tip">{{ tip }}</div>
          </template>
        </template>
      </el-upload>
    </template>

    <!-- 图片上传 -->
    <template v-else-if="type === 'image'">
      <el-upload
        ref="uploadRef"
        :action="action"
        :headers="headers"
        :data="data"
        :multiple="multiple"
        :name="name"
        :with-credentials="withCredentials"
        :show-file-list="showFileList"
        :accept="accept || 'image/*'"
        :file-list="fileList"
        :auto-upload="autoUpload"
        :limit="limit"
        :list-type="listType"
        :on-exceed="handleExceed"
        :before-upload="handleBeforeUpload"
        :on-progress="handleProgress"
        :on-success="handleSuccess"
        :on-error="handleError"
        :on-remove="handleRemove"
        :on-preview="handlePreview"
        :disabled="disabled"
      >
        <template v-if="!hideUploadButton && (!limit || fileList.length < limit)">
          <el-icon class="avatar-uploader-icon"><plus /></el-icon>
        </template>
      </el-upload>

      <!-- 图片预览 -->
      <el-dialog v-model="previewVisible" title="预览" width="800px" append-to-body>
        <img :src="previewUrl" alt="Preview Image" style="width: 100%;" />
      </el-dialog>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus, UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  // 上传类型：file/image
  type: {
    type: String,
    default: 'file'
  },
  // 上传地址
  action: {
    type: String,
    required: true
  },
  // 请求头
  headers: {
    type: Object,
    default: () => ({})
  },
  // 上传时附带的额外参数
  data: {
    type: Object,
    default: () => ({})
  },
  // 是否支持多选
  multiple: {
    type: Boolean,
    default: false
  },
  // 上传的文件字段名
  name: {
    type: String,
    default: 'file'
  },
  // 是否支持发送 cookie 凭证信息
  withCredentials: {
    type: Boolean,
    default: false
  },
  // 是否显示已上传文件列表
  showFileList: {
    type: Boolean,
    default: true
  },
  // 是否启用拖拽上传
  drag: {
    type: Boolean,
    default: false
  },
  // 接受上传的文件类型
  accept: {
    type: String,
    default: ''
  },
  // 上传的文件列表
  fileList: {
    type: Array,
    default: () => []
  },
  // 是否自动上传
  autoUpload: {
    type: Boolean,
    default: true
  },
  // 最大允许上传个数
  limit: {
    type: Number,
    default: 0
  },
  // 文件大小限制（MB）
  maxSize: {
    type: Number,
    default: 10
  },
  // 上传按钮文字
  buttonText: {
    type: String,
    default: '点击上传'
  },
  // 提示文字
  tip: {
    type: String,
    default: ''
  },
  // 图片列表显示类型
  listType: {
    type: String,
    default: 'picture-card'
  },
  // 是否隐藏上传按钮
  hideUploadButton: {
    type: Boolean,
    default: false
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 上传前的回调
  beforeUpload: {
    type: Function,
    default: null
  }
})

const emit = defineEmits([
  'update:fileList',
  'exceed',
  'progress',
  'success',
  'error',
  'remove',
  'preview'
])

// 上传组件引用
const uploadRef = ref(null)
// 预览相关
const previewVisible = ref(false)
const previewUrl = ref('')

// 文件超出限制处理
const handleExceed = (files, uploadFiles) => {
  ElMessage.warning(`最多只能上传 ${props.limit} 个文件`)
  emit('exceed', files, uploadFiles)
}

// 上传前处理
const handleBeforeUpload = async (file) => {
  // 检查文件大小
  const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize
  if (!isLtMaxSize) {
    ElMessage.error(`文件大小不能超过 ${props.maxSize}MB!`)
    return false
  }

  // 自定义上传前处理
  if (props.beforeUpload) {
    try {
      return await props.beforeUpload(file)
    } catch (error) {
      return false
    }
  }

  return true
}

// 上传进度处理
const handleProgress = (event, file, fileList) => {
  emit('progress', { event, file, fileList })
}

// 上传成功处理
const handleSuccess = (response, file, fileList) => {
  emit('update:fileList', fileList)
  emit('success', { response, file, fileList })
}

// 上传失败处理
const handleError = (error, file, fileList) => {
  ElMessage.error(`${file.name} 上传失败`)
  emit('error', { error, file, fileList })
}

// 移除文件处理
const handleRemove = (file, fileList) => {
  emit('update:fileList', fileList)
  emit('remove', { file, fileList })
}

// 预览图片
const handlePreview = (file) => {
  previewUrl.value = file.url
  previewVisible.value = true
  emit('preview', file)
}

// 手动上传
const submit = () => {
  uploadRef.value?.submit()
}

// 清空上传列表
const clearFiles = () => {
  uploadRef.value?.clearFiles()
}

// 中止上传
const abort = () => {
  uploadRef.value?.abort()
}

// 暴露方法
defineExpose({
  uploadRef,
  submit,
  clearFiles,
  abort
})
</script>

<style scoped>
.z-upload {
  display: inline-block;
  width: 100%;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader-icon:hover {
  border-color: var(--el-color-primary);
}

:deep(.el-upload) {
  width: 100%;
}

:deep(.el-upload-dragger) {
  width: 100%;
}

:deep(.el-upload--picture-card) {
  --el-upload-picture-card-size: 148px;
}

:deep(.el-upload-list--picture-card) {
  --el-upload-list-picture-card-size: 148px;
}

:deep(.el-icon.avatar-uploader-icon) {
  font-size: 28px;
  color: #8c939d;
  width: 148px;
  height: 148px;
  text-align: center;
  border: 1px dashed #d9d9d9;
}

:deep(.el-upload-list__item) {
  transition: none !important;
}
</style>
