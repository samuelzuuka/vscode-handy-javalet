## openvsx 发布过程


### 1-创建namespace
npx ovsx create-namespace <name> -p <token>
### 2-声明namespace是你所有
https://github.com/EclipseFdn/open-vsx.org/issues/new/choose
如：
https://github.com/EclipseFdn/open-vsx.org/issues/4106

### 3-发布
ovsx publish -p <token>

### 4必须保证package.json中的publisher和你申请的namespace相同


## azure 市场发布过程

### 1-创建组织 <name>
### 2-创建publisher <name>
### 3- 发布
vsce publish -p <token>
发布后有几分钟的审核时间，进度查看界面：
https://marketplace.visualstudio.com/manage
审核通过后，可以访问具体链接，搜索中心以及vscode插件搜索到还需要几分钟到几小时不等
### 4-插件发布页
https://dev.azure.com/<name>/_settings/extensions?tab=installed