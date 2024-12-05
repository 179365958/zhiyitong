# Git 个人开发使用指南

## 一、基本概念

### 1.1 分支说明
- `master`: 主分支，存放稳定的代码版本
- `dev`: 开发分支，日常开发在这个分支上进行
- `feature/*`: 功能分支，开发具体功能时使用

### 1.2 建议的分支结构
```
master（主分支）
  ├── dev（开发分支）
  └── feature/*（具体功能分支）
    ├── feature/login（登录功能）
    ├── feature/voucher（凭证功能）
    └── ...
```

## 二、日常开发流程

### 2.1 创建开发分支（首次使用时）
```bash
# 1. 切换到master分支
git checkout master

# 2. 创建并切换到dev分支
git checkout -b dev

# 3. 推送dev分支到远程
git push origin dev
```

### 2.2 开发新功能
```bash
# 1. 确保在dev分支上
git checkout dev

# 2. 创建功能分支（以开发登录功能为例）
git checkout -b feature/login

# 3. 在功能分支上开发，并经常提交
git add .
git commit -m "feat: 添加登录表单"

# 4. 完成功能后，合并回dev分支
git checkout dev
git merge feature/login

# 5. 推送到远程dev分支
git push origin dev

# 6. 确认无问题后，合并到master
git checkout master
git merge dev
git push origin master
```

### 2.3 提交规范
提交信息格式：`类型: 描述`

类型包括：
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

示例：
```bash
git commit -m "feat: 完成用户登录功能"
git commit -m "fix: 修复登录验证码不显示的问题"
```

## 三、常用命令

### 3.1 基本操作
```bash
# 查看状态
git status

# 查看分支
git branch           # 查看本地分支
git branch -r        # 查看远程分支
git branch -a        # 查看所有分支

# 切换分支
git checkout <分支名>

# 拉取更新
git pull            # 拉取并合并远程更改
```

### 3.2 临时保存
```bash
# 保存当前修改
git stash save "临时保存"

# 查看保存列表
git stash list

# 恢复保存的修改
git stash pop       # 恢复并删除
git stash apply     # 仅恢复
```

### 3.3 版本管理
```bash
# 查看提交历史
git log --oneline --graph

# 创建标签
git tag -a v1.0.0 -m "第一个正式版本"
git push origin v1.0.0
```

## 四、最佳实践

### 4.1 日常习惯
1. 经常提交代码（每完成一个小功能就提交）
2. 提交信息要清晰明确
3. 每天工作结束前推送到远程
4. 重要更改前先创建分支
5. 及时删除已合并的功能分支

### 4.2 注意事项
1. 不要直接在master分支上开发
2. 推送前先拉取最新代码
3. 合并分支前先测试
4. 重要操作前先备份

## 五、常见问题处理

### 5.1 撤销修改
```bash
# 撤销工作区修改
git checkout -- <文件名>

# 撤销暂存区修改
git reset HEAD <文件名>

# 撤销提交
git reset --soft HEAD^    # 保留修改
git reset --hard HEAD^    # 完全撤销
```

### 5.2 解决冲突
1. 当合并分支出现冲突时，使用编辑器解决冲突
2. 解决后重新提交：
```bash
git add .
git commit -m "fix: 解决冲突"
```

## 六、建议的工作流程

1. 每天开始工作：
   ```bash
   git checkout dev
   git pull origin dev
   ```

2. 开发新功能：
   ```bash
   git checkout -b feature/新功能
   # 开发...
   git add .
   git commit -m "feat: 完成xxx功能"
   ```

3. 完成功能：
   ```bash
   git checkout dev
   git merge feature/新功能
   git push origin dev
   ```

4. 发布版本：
   ```bash
   git checkout master
   git merge dev
   git tag -a v1.0.0 -m "版本说明"
   git push origin master --tags
   ```

## 七、Git 分支合并指南

## 将 dev 分支合并到 master 的步骤

### 1. 确保工作区清洁
```bash
git status
```
确保当前工作区没有未提交的更改。

### 2. 切换到 master 分支
```bash
git checkout master
```

### 3. 拉取最新的 master 分支代码
```bash
git pull origin master
```

### 4. 合并 dev 分支
```bash
git merge dev
```

### 5. 解决冲突（如果有）
如果出现冲突，需要手动解决冲突，然后：
```bash
git add .
git commit -m "解决合并冲突"
```

### 6. 推送到远程仓库
```bash
git push origin master
```

## 注意事项
1. 合并前先确保 dev 分支的代码已经经过测试
2. 建议在重要合并前创建备份分支
3. 如果不确定，可以先创建临时分支进行测试合并

## 如果需要取消合并
```bash
# 如果合并出现问题，可以取消合并
git merge --abort

# 如果已经合并，想要回退
git reset --hard HEAD^
```
