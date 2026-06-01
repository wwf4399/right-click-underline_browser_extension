<template>
	<div class="options-layout">
		<aside class="aside-menu">
			<!--
			<div class="logo">
				<i class="iconfont icon-draw"></i>
				<span>设置</span>
			</div>
			-->
			<nav class="menu-list">
				<div 
					v-for="(label, index) in menuItems" 
					:key="index"
					class="menu-item"
					:class="{'is-active': activeTabIndex === index}"
					@click="activeTabIndex = index"
				>
					<span>{{label.name}}</span>
				</div>
			</nav>
		</aside>
		<main class="main-content">
			<div class="content-card">
				<component :is="menuItems[activeTabIndex].tab" />
			</div>
		</main>
	</div>
</template>
<script setup>
import {ref} from 'vue';
//分页
	import Gestures from './pages/Gestures.vue';
	import drag from './pages/drag.vue';
	import picture_download from './pages/picture_download.vue';
	import settings from './pages/settings.vue';
	import About from './pages/About.vue';
//响应式变量
	const activeTabIndex = ref(0);
	const menuItems = [
		{name: '手势', tab: Gestures},
		{name: '拖拽', tab: drag},
		{name: '图片下载', tab: picture_download},
		{name: '设置', tab: settings},
		{name: '关于', tab: About},
	];
</script>
<style lang="scss" scoped>
.options-layout {
	display: flex;
	height: 100vh;
	background-color: #f0f2f5;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
	.aside-menu {
		width: 220px;
		background: #fff;
		border-right: 1px solid #dcdfe6;
		display: flex;
		flex-direction: column;
		.logo {
			height: 60px;
			display: flex;
			align-items: center;
			padding-left: 20px;
			font-weight: bold;
			font-size: 16px;
			color: $primary-color; // 使用全局 SCSS 变量
			border-bottom: 1px solid #f0f0f0;
		}
		.menu-list {
			padding: 8px 0;
			flex: 1;
			.menu-item {
				height: 50px;
				display: flex;
				align-items: center;
				padding: 0 20px;
				cursor: pointer;
				color: #606266;
				transition: all 0.2s ease;
				font-size: 14px;
				border-right: 3px solid rgba(0,0,0,0);
				&:hover {
					background-color: #f5f7fa;
					color: $primary-color;
				}
				&.is-active {
					background-color: rgba($primary-color, 0.1);
					color: $primary-color;
					font-weight: 600;
					border-right: 3px solid $primary-color;
				}
			}
		}
	}
	.main-content {
		flex: 1;
		padding: 24px;
		overflow-y: auto;
		.content-card {
			background: #fff;
			padding: 24px;
			border-radius: 8px;
			min-height: 100%;
			box-shadow: 0 1px 4px rgba(0,0,0,0.05);
			box-sizing: border-box;
		}
	}
}
</style>