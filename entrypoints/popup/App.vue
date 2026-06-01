<template>
	<div class="popup-container">
		<span class="iconfont icon-shezhi_2" @click="openOptions"></span>
		<span class="iconfont icon-jichu_kaiguan" :class="{active: settings.isEnabled}" @click="settings.isEnabled = !settings.isEnabled"></span>
	</div>
</template>
<script setup>
import '@/assets/iconfont/iconfont.css';
import { ref, onMounted } from 'vue';
import { useSettings } from '../options/logic/useSettings';

const { settings, initSettings, exportSettings, importSettings, resetSettings } = useSettings();

onMounted(async () => {
	await initSettings();
});
//跳转到 Options 页面
	const openOptions = () => {
		//插件内部的独立URL
			const url = chrome.runtime.getURL('options.html');
		//先检查是否已经打开了该页面，避免重复打开
			chrome.tabs.query({url: url}, (tabs) => {
				if(tabs.length > 0){//如果已经打开了，就直接跳转到那个标签页
					chrome.tabs.update(tabs[0].id, {active: true});
				}else{
					chrome.tabs.create({url: url});
				}
			});
	};
</script>
<style lang="scss">
.popup-container{
	padding: 0 12px;
	.iconfont{
		color: #AFB4B8;
		font-size: 20px;
		line-height: 50px;
		padding: 0 10px;
		&.active{
			color: $primary-color;
		}
	}
}
</style>