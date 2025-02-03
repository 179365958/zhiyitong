<template>
  <div class="page-container">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" @click="handleSaveAndNew">
          <el-icon><Document /></el-icon>保存并新增
        </el-button>
        <el-button @click="handleSave">
          <el-icon><Plus /></el-icon>保存
        </el-button>
        <el-button @click="handlePrint">
          <el-icon><Printer /></el-icon>打印
        </el-button>
        <el-dropdown>
          <el-button>
            更多<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleClear">清空凭证</el-dropdown-item>
              <el-dropdown-item @click="handleExport">导出凭证</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="toolbar-right">
        <el-button @click="handleShortcut">
          <el-icon><Key /></el-icon>快捷键
        </el-button>
        <el-button @click="handlePrev">
          <el-icon><ArrowLeft /></el-icon>上一页
        </el-button>
        <el-button @click="handleNext">
          <el-icon><ArrowRight /></el-icon>下一页
        </el-button>
      </div>
    </div>

    <!-- 凭证容器 -->
    <div class="voucher-container">
      <!-- 凭证信息 -->
      <div class="voucher-info">
        <div class="type-no">
          <span class="type">{{ voucherForm.type }}</span>
          <span class="no">{{ voucherForm.number }}</span>
        </div>
        <div class="date-container">
          <el-date-picker
            v-model="voucherForm.date"
            type="date"
            size="small"
            style="width: 120px;"
            placeholder="选择日期"
          />
        </div>
        <div class="attachment">
          附单据 {{ voucherForm.attachments }} 张
        </div>
      </div>

      <!-- 表格部分 -->
      <div class="table-container">
        <table class="voucher-table">
          <thead>
            <tr>
              <th style="width: 40px">操作</th>
              <th style="width: 40px">序号</th>
              <th style="width: 150px">摘要</th>
              <th style="width: 220px">会计科目</th>
              <th class="amount-col">
                <div>借方金额</div>
              </th>
              <th class="amount-col">
                <div>贷方金额</div>
              </th>
              <th style="width: 40px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(entry, index) in voucherForm.entries" :key="index" @mouseenter="showDropdown[index] = true" @mouseleave="showDropdown[index] = false">
              <td>
                <el-button type="primary" size="small" @click="addEntryBefore(index)">
                  <el-icon><Plus /></el-icon>
                </el-button>
              </td>
              <td>{{ index + 1 }}</td>
              <td>
                <input
                  type="text"
                  v-model="entry.summary"
                  class="text-input"
                  @keydown.enter="focusNextInput($event, index, 'subject')"
                />
              </td>
              <td>
                <el-dropdown trigger="click" @command="handleSelectSubject(entry, index)" v-if="showDropdown[index]" class="dropdown-right">
  <el-button type="text" class="dropdown-button">
    <el-icon><MoreFilled /></el-icon>
  </el-button>
  <template #dropdown>
    <el-dropdown-menu>
      <el-dropdown-item
        v-for="item in subjectOptions"
        :key="item.code"
        :command="item.code"
      >
        <span style="font-family: SimSun, 宋体, serif">{{ item.code }} - {{ item.name }}</span>
      </el-dropdown-item>
    </el-dropdown-menu>
  </template>
</el-dropdown>
              </td>
              <td class="amount-cell">
                <input
                  type="text"
                  v-model="entry.debit"
                  class="amount-input"
                  @input="(e) => handleAmountInput(e, index, 'debit')"
                  @focus="entry.debitFocused = true"
                  @blur="handleAmountBlur(entry, 'debit')"
                  @keydown.enter="focusNextInput($event, index, 'credit')"
                />
              </td>
              <td class="amount-cell">
                <input
                  type="text"
                  v-model="entry.credit"
                  class="amount-input"
                  @input="(e) => handleAmountInput(e, index, 'credit')"
                  @focus="entry.creditFocused = true"
                  @blur="handleAmountBlur(entry, 'credit')"
                  @keydown.enter="focusNextInput($event, index + 1, 'summary')"
                />
              </td>
              <td>
                <el-button type="danger" size="small" @click="removeEntry(index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 底部信息 -->
      <div class="voucher-footer">
        <div class="total-row">
          <span>合计：</span>
          <span class="amount-words">{{ amountInWords }}</span>
        </div>
        <div class="amount-row">
          <span>借方：{{ formatDecimal(totalDebit) }}</span>
          <span>贷方：{{ formatDecimal(totalCredit) }}</span>
        </div>
        <div class="approver-row">
          <div class="approver-item">制单人：{{ voucherForm.creator }}</div>
          <div class="approver-item">审核人：{{ voucherForm.reviewer }}</div>
          <div class="approver-item">记账人：{{ voucherForm.bookkeeper }}</div>
        </div>
      </div>
    </div>

    <!-- 科目选择对话框 -->
    <el-dialog
      title="选择科目"
      v-model="subjectDialogVisible"
      width="50%"
      :before-close="handleClose"
    >
      <el-input
        v-model="searchQuery"
        placeholder="搜索科目"
        @input="handleSearchSubject"
        style="margin-bottom: 10px;"
      />
      <el-select
        v-model="selectedSubject"
        filterable
        remote
        placeholder="选择科目"
        :remote-method="handleSearchSubject"
        :loading="loading"
        style="width: 100%;"
      >
        <el-option
          v-for="item in subjectOptions"
          :key="item.code"
          :label="item.name"
          :value="item.code"
        >
          <span style="font-family: SimSun, 宋体, serif">{{ item.code }} - {{ item.name }}</span>
        </el-option>
      </el-select>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="subjectDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="selectSubject">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Plus, ArrowLeft, ArrowRight, Printer, Key, Delete, MoreFilled } from '@element-plus/icons-vue'
import axios from 'axios'
import { getSubjects } from '@/api/subject';


const subjectDialogVisible = ref(false)

// 处理对话框关闭
const handleClose = (done) => {
  // 可以在这里添加关闭前的确认逻辑
  subjectDialogVisible.value = false
  done() // 必须调用 done() 来关闭对话框
}

// 修改 handleSelectSubject 方法（如果存在）
const handleSelectSubject = (entry, index) => {
  currentEntry.value = entry
  currentIndex.value = index
  subjectDialogVisible.value = true // 打开对话框
}

// 凭证表单数据
const voucherForm = ref({
  date: new Date().toISOString().split('T')[0],
  type: '记',
  number: '',
  attachments: 0,
  files: [],
  entries: [],
  creator: '当前用户',
  reviewer: '',
  bookkeeper: ''
})

// 初始化凭证条目，确保至少有四行
const initializeEntries = () => {
  const initialEntries = [
    { summary: '', subject: '', debit: '', credit: '', debitFocused: false, creditFocused: false },
    { summary: '', subject: '', debit: '', credit: '', debitFocused: false, creditFocused: false },
    { summary: '', subject: '', debit: '', credit: '', debitFocused: false, creditFocused: false },
    { summary: '', subject: '', debit: '', credit: '', debitFocused: false, creditFocused: false }
  ]
  voucherForm.value.entries = initialEntries
}

// 声明 subjectOptions 并初始化为空数组
const subjectOptions = ref([])

// 加载状态
const loading = ref(false)

// 获取科目选项数据
const fetchSubjectOptions = async () => {
  try {
    loading.value = true
    const response = await getSubjects(); // 假设 getSubjects 是一个从后台获取科目数据的 API
    subjectOptions.value = response.data.data; // 确保从 response.data 中获取数据
  } catch (error) {
    console.error('获取科目选项失败:', error);
    ElMessage.error('获取科目选项失败，请重试');
  } finally {
    loading.value = false
  }
}

// 搜索科目
const handleSearchSubject = async (query) => {
  if (query) {
    try {
      loading.value = true
      const response = await axios.get('/api/subjects', { params: { query } });
      subjectOptions.value = response.data.data; // 确保从 response.data 中获取数据
    } catch (error) {
      console.error('搜索科目失败:', error);
      ElMessage.error('搜索科目失败，请重试');
    } finally {
      loading.value = false
    }
  } else {
    fetchSubjectOptions(); // 重新获取所有科目选项
  }
}

// 计算借方合计
const totalDebit = computed(() => {
  return voucherForm.value.entries.reduce((sum, entry) => {
    return sum + (parseFloat(entry.debit) || 0)
  }, 0)
})

// 计算贷方合计
const totalCredit = computed(() => {
  return voucherForm.value.entries.reduce((sum, entry) => {
    return sum + (parseFloat(entry.credit) || 0)
  }, 0)
})

// 计算金额大写
const amountInWords = computed(() => {
  return numberToChinese(totalDebit.value)
})

// 科目变更处理
const handleSubjectChange = (entry) => {
  const subject = subjectOptions.value.find(item => item.code === entry.subject)
  if (subject) {
    if (['资产', '费用'].includes(subject.type)) {
      entry.debit = entry.debit || ''
      entry.credit = ''
    } else if (['负债', '收入', '所有者权益'].includes(subject.type)) {
      entry.credit = entry.credit || ''
      entry.debit = ''
    }
  }
}

// 处理金额输入
const formatAmount = (value) => {
  value = value.replace(/[^\d.]/g, '')
  const parts = value.split('.')
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('')
  }
  if (parts.length === 2 && parts[1].length > 2) {
    value = parts[0] + '.' + parts[1].slice(0, 2)
  }
  return value
}

const handleAmountInput = (event, index, type) => {
  const value = formatAmount(event.target.value)
  event.target.value = value
  if (type === 'debit') {
    voucherForm.value.entries[index].debit = value
  } else {
    voucherForm.value.entries[index].credit = value
  }
}

const handleAmountBlur = (entry, type) => {
  let value = type === 'debit' ? entry.debit : entry.credit
  if (value) {
    if (!value.includes('.')) {
      value = value + '.00'
    } else {
      const parts = value.split('.')
      if (parts[1].length === 0) {
        value = value + '00'
      } else if (parts[1].length === 1) {
        value = value + '0'
      }
    }
    if (type === 'debit') {
      entry.debit = value
    } else {
      entry.credit = value
    }
  }
}

// 保存凭证
const handleSave = () => {
  if (!voucherForm.value.date) {
    ElMessage.error('请选择凭证日期')
    return false
  }

  if (!voucherForm.value.entries.some(entry => entry.summary || entry.subject || entry.debit || entry.credit)) {
    ElMessage.error('请至少填写一条分录')
    return false
  }

  if (totalDebit.value !== totalCredit.value) {
    ElMessage.error('借贷不平衡，请调整金额')
    return false
  }

  // 保存逻辑
  console.log('保存凭证:', voucherForm.value)
  ElMessage.success('凭证保存成功')
}

// 保存并新增
const handleSaveAndNew = () => {
  handleSave()
  initializeEntries()
}

// 打印凭证
const handlePrint = () => {
  window.print()
}

// 清空凭证
const handleClear = () => {
  initializeEntries()
  ElMessage.success('凭证已清空')
}

// 导出凭证
const handleExport = () => {
  // 导出逻辑
  console.log('导出凭证:', voucherForm.value)
  ElMessage.success('凭证导出成功')
}

// 快捷键提示
const handleShortcut = () => {
  ElMessage.info('快捷键：Ctrl + S 保存，Ctrl + N 新增')
}

// 上一页
const handlePrev = () => {
  ElMessage.info('上一页')
}

// 下一页
const handleNext = () => {
  ElMessage.info('下一页')
}

// 格式化金额
const formatDecimal = (num) => {
  return num.toFixed(2)
}

// 数字转中文
const numberToChinese = (num) => {
  const fraction = ['角', '分']
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const unit = [
    ['元', '万', '亿'],
    ['', '拾', '佰', '仟']
  ]
  const head = num < 0 ? '欠' : ''
  num = Math.abs(num)

  let s = ''
  const decimalPart = Math.floor(num * 100) % 100
  if (decimalPart === 0) {
    s = '整'
  } else {
    const jiao = Math.floor(decimalPart / 10)
    const fen = decimalPart % 10
    if (jiao > 0) {
      s += digit[jiao] + '角'
      if (fen > 0) s += digit[fen] + '分'
    } else {
      s += '零' + digit[fen] + '分'
    }
  }
  num = Math.floor(num)

  for (let i = 0; i < unit[0].length && num > 0; i++) {
    let p = ''
    for (let j = 0; j < unit[1].length && num > 0; j++) {
      p = digit[num % 10] + unit[1][j] + p
      num = Math.floor(num / 10)
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s
  }

  return head + s.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零').replace(/^整$/, '零元整')
}

// 初始化凭证编号
const generateVoucherNumber = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000)
  return `${year}${month}${day}-${random}`
}

// 增加分录
const addEntry = () => {
  voucherForm.value.entries.push({
    summary: '',
    subject: '',
    debit: '',
    credit: '',
    debitFocused: false,
    creditFocused: false
  })
}

// 在指定位置增加分录
const addEntryBefore = (index) => {
  voucherForm.value.entries.splice(index, 0, {
    summary: '',
    subject: '',
    debit: '',
    credit: '',
    debitFocused: false,
    creditFocused: false
  })
}

// 删除分录
const removeEntry = (index) => {
  if (voucherForm.value.entries.length > 4) {
    voucherForm.value.entries.splice(index, 1)
  } else {
    ElMessage.warning('至少需要保留四条分录')
  }
}

// 对话框相关变量
const selectedSubject = ref('')
const currentEntry = ref(null)
const currentIndex = ref(null)
const searchQuery = ref('')

// 显示下拉菜单的状态
const showDropdown = ref(voucherForm.value.entries.map(() => false))

// 打开科目选择对话框
const openSubjectDialog = (entry, index) => {
  currentEntry.value = entry
  currentIndex.value = index
  selectedSubject.value = entry.subject
  searchQuery.value = ''
  fetchSubjectOptions()
}

// 选择科目
const selectSubject = () => {
  if (currentEntry.value && selectedSubject.value) {
    currentEntry.value.subject = selectedSubject.value
    handleSubjectChange(currentEntry.value)
  }
}

// 聚焦下一个输入框
const focusNextInput = (event, index, field) => {
  const nextIndex = field === 'summary' ? index : index + 1
  const nextField = field === 'summary' ? 'subject' : field === 'subject' ? 'debit' : 'summary'
  const inputElement = document.querySelector(`input[data-index="${nextIndex}"][data-field="${nextField}"]`)
  if (inputElement) {
    inputElement.focus()
  }
}

onMounted(() => {
  voucherForm.value.number = generateVoucherNumber()
  initializeEntries()
  fetchSubjectOptions()
})
</script>

<style scoped>
/* styles.css */
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
}

.page-container {
  max-width: 1050px; /* 最大宽度 */
  min-width: 1050px; /* 设置最小宽度 */
  margin: 0 auto;
  padding: 10px;
  background-color: #f9f9f9; /* 背景颜色 */
  border-radius: 8px; /* 圆角 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* 阴影 */
}

.voucher-container {
  background-color: white;
  margin: 10px;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  max-width: 1000px; /* 保持最大宽度为 1000px */
  box-sizing: border-box;
}

.toolbar {
  display: flex;
  margin: 10px;
  justify-content: space-between;
  margin-bottom: 10px;
  max-width: 960px;
  background-color: white; /* 设置背景颜色为白色 */
  padding: 10px 20px; /* 添加内边距 */
  border-radius: 4px; /* 添加圆角 */
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); /* 添加阴影 */
}

.toolbar-left, .toolbar-right {
  display: flex;
  gap: 10px;
}

.voucher-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  background-color: #f5f7fa; /* 背景颜色 */
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); /* 阴影 */
}

.type-no {
  font-size: 1.2em;
  font-weight: bold;
}

.date-container {
  flex-grow: 1;
  text-align: center;
}

.attachment {
  margin-left: 10px;
  font-size: 0.9em;
  color: #606266;
}

.table-container {
  margin-bottom: 20px;
}

.voucher-table {
  width: 100%; /* 确保表格宽度为 100% */
  border-collapse: collapse;
  margin-bottom: 15px;
  table-layout: fixed; /* 固定布局 */
  border: 1px solid #000000;
  background-color: white;
}

.voucher-table th {
  background-color: #f5f7fa;
  height: 52px;
  padding: 0;
  text-align: center;
  font-size: 13px;
  font-weight: normal;
  color: #606266;
  border: 1px solid #000000;
  box-sizing: border-box;
}

.voucher-table td {
  border: 1px solid #000000;
  padding: 0;
  text-align: center;
  position: relative;
  height: 50px;
  box-sizing: border-box;
  vertical-align: middle;
  overflow: hidden;
}

.amount-cell {
  position: relative;
  padding: 0;
  height: 48px;
}

.amount-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  padding: 0 8px;
  text-align: right;
  background-color: transparent;
  font-family: inherit;
  font-size: 13px;
  box-sizing: border-box;
  line-height: 48px;
}

.text-input {
  width: 100%;
  height: 48px;
  border: none;
  outline: none;
  padding: 0 8px;
  font-size: 13px;
  background-color: transparent;
  box-sizing: border-box;
  line-height: 48px;
}

.text-input:focus,
.amount-input:focus {
  background-color: #f5f7fa;
}

.voucher-table :deep(.el-input__wrapper) {
  height: 48px;
  box-shadow: none !important;
  border-radius: 0;
  background-color: transparent;
  border: none;
}

.voucher-table :deep(.el-input__inner) {
  height: 48px;
  line-height: 48px;
  font-size: 13px;
  padding: 0 8px;
  border: none;
  background-color: transparent;
}

.voucher-table :deep(.el-select) {
  width: 100%;
}

.voucher-table :deep(.el-select .el-input__inner) {
  height: 48px;
  line-height: 48px;
  font-size: 13px;
  padding: 0 8px;
  border: none;
  background-color: transparent;
  box-shadow: none !important;
  border-radius: 0;
}

.voucher-table :deep(.el-select .el-input__suffix) {
  display: block; /* 显示下拉箭头 */
}

.voucher-footer {
  margin-top: 20px;
  background-color: #f5f7fa; /* 背景颜色 */
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); /* 阴影 */
}

.total-row, .amount-row {
  margin-bottom: 10px;
}

.amount-words {
  font-weight: bold;
}

.approver-row {
  display: flex;
  padding: 0 20px;
  font-size: 14px;
  color: #666;
  margin-top: 20px;
  position: relative;
}

.approver-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.approver-item:first-child {
  position: absolute;
  left: 10px;
}

.approver-item:nth-child(2) {
  margin: 0 auto;
}

.approver-item:last-child {
  position: absolute;
  right: 80px;
}

.add-entry-button {
  text-align: right;
  margin-top: 10px;
}

.add-entry-button .el-button {
  height: 48px;
  line-height: 48px;
  padding: 0 15px;
  font-size: 13px;
  border-radius: 0;
  box-shadow: none !important;
}

.dropdown-button {
  padding: 8px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  text-align: right; /* 使按钮靠右对齐 */
}

.dropdown-button .el-icon {
  font-size: 16px;
}

.dropdown-right {
  display: flex;
  justify-content: flex-end; /* 使内容靠右对齐 */
}

.dropdown-button {
  padding: 8px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  text-align: right; /* 使按钮靠右对齐 */
  margin-left: auto; /* 使按钮靠右 */
}

</style>