<template>
	<div class="page-history">
		<div class="header">
			<h3>划线历史回溯</h3>
			<el-button type="danger" plain size="small">清空全部记录</el-button>
		</div>
		
		<el-divider />

		<el-empty description="正在读取存储中的划线数据..." />
	</div>
</template>

<style lang="scss" scoped>
.page-history {
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		h3 { margin: 0; }
	}
}
</style>