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
        <el-button>
          <el-icon><ArrowLeft /></el-icon>打印
        </el-button>
        <el-dropdown>
          <el-button>
            更多<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>选项1</el-dropdown-item>
              <el-dropdown-item>选项2</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div> 
      <div class="toolbar-right">
        <el-button>
          <el-icon><ArrowLeft /></el-icon>快捷键
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
        <div class="date-attachment">
          <el-date-picker
            v-model="voucherForm.date"
            type="date"
            size="small"
            style="width: 120px;"
          />
          <span class="attachment">附单据 {{ voucherForm.attachments }} 张</span>
        </div>
      </div>

      <!-- 表格部分 -->
      <div class="table-container">
        <table class="voucher-table">
          <thead>
            <tr>
              <th style="width: 40px">序号</th>
              <th style="width: 220px">摘要</th>
              <th style="width: 300px">会计科目</th>
              <th class="amount-col">
                <div>借方金额</div>
              </th>
              <th class="amount-col">
                <div>贷方金额</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(entry, index) in voucherForm.entries" :key="index">
              <td>{{ index + 1 }}</td>
              <td>
                <input 
                  type="text" 
                  v-model="entry.summary"
                  class="text-input"
                  @keydown.enter="focusNextInput($event, index, 'subject')"
                >
              </td>
              <td>
                <el-select
                  v-model="entry.subject"
                  filterable
                  remote
                  placeholder=""
                  :remote-method="handleSearchSubject"
                  @change="handleSubjectChange(entry)"
                  class="subject-select"
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
                >
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
                >
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
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { 
  Document,
  Plus,
  ArrowLeft,
  ArrowRight
} from '@element-plus/icons-vue'

const router = useRouter()

// 凭证表单数据
const voucherForm = ref({
  date: new Date().toISOString().split('T')[0],
  type: '记',
  number: '',
  attachments: 0,
  files: [],
  entries: [
    { summary: '', subject: '', debit: '', credit: '', debitFocused: false, creditFocused: false },
    { summary: '', subject: '', debit: '', credit: '', debitFocused: false, creditFocused: false },
    { summary: '', subject: '', debit: '', credit: '', debitFocused: false, creditFocused: false },
    { summary: '', subject: '', debit: '', credit: '', debitFocused: false, creditFocused: false }
  ],
  creator: '当前用户',
  reviewer: '',
  bookkeeper: ''
})

// 科目选项数据
const subjectOptions = ref([
  { code: '1001', name: '库存现金', type: '资产' },
  { code: '1002', name: '银行存款', type: '资产' },
  { code: '1012', name: '其他货币资金', type: '资产' },
  { code: '1101', name: '短期投资', type: '资产' },
  { code: '1121', name: '应收票据', type: '资产' },
  { code: '1122', name: '应收账款', type: '资产' },
  { code: '1123', name: '预付账款', type: '资产' },
  { code: '1131', name: '应收股利', type: '资产' },
  { code: '1132', name: '应收利息', type: '资产' },
  { code: '1221', name: '其他应收款', type: '资产' }
])

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

// 搜索科目
const handleSearchSubject = (query) => {
  if (query) {
    return subjectOptions.value.filter(item => 
      item.code.includes(query) || 
      item.name.includes(query) ||
      item.type.includes(query)
    )
  }
  return subjectOptions.value
}

// 科目变更处理
const handleSubjectChange = (row) => {
  const subject = subjectOptions.value.find(item => item.code === row.subject)
  if (subject) {
    if (['资产', '费用'].includes(subject.type)) {
      row.debit = row.debit || ''
      row.credit = ''
    } else if (['负债', '收入', '所有者权益'].includes(subject.type)) {
      row.credit = row.credit || ''
      row.debit = ''
    }
  }
}

// 处理金额输入
const formatAmount = (value) => {
  // 移除非数字和小数点
  value = value.replace(/[^\d.]/g, '')
  // 确保只有一个小数点
  const parts = value.split('.')
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('')
  }
  // 限制小数位数为2位
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
    // 如果有值，确保有两位小数
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

// 处理金额输入框聚焦
const handleAmountFocus = (row, type) => {
  if (type === 'debit') {
    row.credit = ''
  } else {
    row.debit = ''
  }
}

// 添加分录行
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

// 删除分录
const removeEntry = (index) => {
  if (voucherForm.value.entries.length <= 4) {
    ElMessage.warning('至少保留4行分录')
    return
  }
  voucherForm.value.entries.splice(index, 1)
}

// 快速填充摘要
const fillSummary = (summary, row) => {
  row.summary = summary
}

// 键盘导航和快捷键处理
const handleKeyDown = (e, row, index, field) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    const nextField = getNextField(field)
    if (nextField) {
      focusField(index, nextField)
    } else if (index < voucherForm.value.entries.length - 1) {
      focusField(index + 1, 'summary')
    } else {
      addEntry()
      focusField(index + 1, 'summary')
    }
  }
  
  if (e.key === 'Tab') {
    e.preventDefault()
    const nextField = getNextField(field)
    if (nextField) {
      focusField(index, nextField)
    }
  }
  
  if (e.key === 'ArrowUp' && index > 0) {
    e.preventDefault()
    focusField(index - 1, field)
  }
  if (e.key === 'ArrowDown' && index < voucherForm.value.entries.length - 1) {
    e.preventDefault()
    focusField(index + 1, field)
  }
}

// 获取下一个字段
const getNextField = (currentField) => {
  const fields = ['summary', 'subject', 'debit', 'credit']
  const currentIndex = fields.indexOf(currentField)
  return fields[currentIndex + 1]
}

// 聚焦指定字段
const focusField = (rowIndex, field) => {
  nextTick(() => {
    const el = document.querySelector(`#entry_${rowIndex}_${field}`)
    if (el) {
      el.focus()
    }
  })
}

// 下一个输入框焦点
const focusNextInput = (event, currentIndex, nextField) => {
  event.preventDefault()
  const inputs = document.querySelectorAll('.voucher-table input, .voucher-table .el-select')
  const currentInput = event.target
  const nextInput = inputs[currentIndex + 1]
  if (nextInput) {
    nextInput.focus()
  }
}

// 文件上传处理
const handleFileChange = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
  if (!allowedTypes.includes(file.raw.type)) {
    ElMessage.error('只能上传图片或PDF文件')
    return false
  }
  
  if (file.raw.size > 10 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过10MB')
    return false
  }
  
  voucherForm.value.files.push(file)
  voucherForm.value.attachments = voucherForm.value.files.length
  return true
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
  console.log(numberToChinese(totalDebit.value))
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

// 获取借方金额数字
const getDebitDigit = (entry, index) => {
  if (!entry.debit || entry.debit === '') return ''
  const value = entry.debit.toString().replace(/[^\d.]/g, '')
  if (!value) return ''
  const [intPart = '', decPart = ''] = value.split('.')
  const digits = intPart.padStart(11, ' ')
  return digits[index] || ' '
}

// 获取贷方金额数字
const getCreditDigit = (entry, index) => {
  if (!entry.credit || entry.credit === '') return ''
  const value = entry.credit.toString().replace(/[^\d.]/g, '')
  if (!value) return ''
  const [intPart = '', decPart = ''] = value.split('.')
  const digits = intPart.padStart(11, ' ')
  return digits[index] || ' '
}
</script>

<style scoped>
/* styles.css */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.voucher-container {
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  box-sizing: border-box;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.toolbar-left, .toolbar-right {
  display: flex;
  gap: 10px;
}

.voucher-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.type-no {
  font-size: 1.2em;
}

.date-attachment {
  display: flex;
  align-items: center;
}

.attachment {
  margin-left: 10px;
}

.table-container {
  margin-bottom: 20px;
}

.voucher-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
  table-layout: fixed;
  border: 1px solid #000000;
  background-color: white;
}

.voucher-table td {
  border: 1px solid #000000;
  padding: 0;
  text-align: center;
  position: relative;
  height: 48px;
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

.amount-grid {
  display: none;
}

.text-input,
.amount-input,
.voucher-table :deep(.el-input__wrapper) {
  box-shadow: none !important;
  border-radius: 0;
  background-color: transparent;
  border: none;
  box-sizing: border-box;
}

.text-input:focus,
.amount-input:focus,
.voucher-table :deep(.el-input__wrapper.is-focus) {
  background-color: #f5f7fa;
}

.voucher-table :deep(.el-input__inner) {
  height: 48px;
  line-height: 48px;
  font-size: 13px;
  padding: 0 8px;
  border: none;
  background-color: transparent;
}

.voucher-table th:nth-child(1),
.voucher-table td:nth-child(1) {
  width: 40px;  /* 序号列 */
}

.voucher-table th:nth-child(2),
.voucher-table td:nth-child(2) {
  width: 220px;  /* 摘要列 */
}

.voucher-table th:nth-child(3),
.voucher-table td:nth-child(3) {
  width: 300px;  /* 会计科目列 */
}

.voucher-table th:nth-child(4),
.voucher-table td:nth-child(4),
.voucher-table th:nth-child(5),
.voucher-table td:nth-child(5) {
  width: 200px;  /* 借方贷方列 */
}

.voucher-footer {
  margin-top: 20px;
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

.amount-col {
  position: relative;
  height: 52px;
}

.amount-col > div {
  height: 52px;
  line-height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.voucher-table td {
  border: 1px solid #000000;
  padding: 0;
  text-align: center;
  position: relative;
  height: 48px;
  box-sizing: border-box;
  vertical-align: middle;
  overflow: hidden;
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

.text-input:focus {
  background-color: #f5f7fa;
}

.voucher-table :deep(.el-input) {
  height: 48px;
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
  border: none;
  padding: 0 8px;
  font-size: 13px;
  background-color: transparent;
}
</style>
