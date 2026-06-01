<template><div class="settings-page">
	<section class="config-group">
		<h3>基础设置</h3>
		<div class="item">
			<span>是否开启右键划线</span>
			<el-switch
				v-model="settings.isEnabled"
				style="margin-left: 24px"
				inline-prompt
			/>
		</div>
		<div class="item">
			<span>线条颜色</span>
			<el-color-picker v-model="settings.lineColor" :predefine="predefineColors" />
		</div>
		<div class="item">
			<span>线条宽度</span>
			<el-slider v-model="settings.lineWidth" show-input :min="1" :max="20" />
		</div>
	</section>
	<section class="config-group actions">
		<h3>配置管理</h3>
		<div class="btn-group">
			<button @click="exportSettings" class="btn">备份配置</button>
			
			<label class="btn file-label">
				还原配置
				<input type="file" accept=".json" @change="handleFileChange" hidden>
			</label>
			
			<button @click="resetSettings" class="btn danger">重置默认</button>
		</div>
	</section>
</div></template>
<script setup>
import { ref, onMounted } from 'vue';
import { useSettings } from '../logic/useSettings';
//配置
	const { settings, initSettings, exportSettings, importSettings, resetSettings } = useSettings();
//响应式变量
	const predefineColors = ref([
		'#1F2937',
		'#ff4500',
		'#ff8c00',
		'#ffd700',
		'#90ee90',
		'#00ced1',
		'#1e90ff',
		'#c71585',
	]);
//挂载阶段[DOM 节点创建完毕、并成功插入到页面上之后触发]
	onMounted(async () => {
		await initSettings();//获取本地用户自定义配置[以覆盖默认配置]
		//监听
			//颜色值
				watch(() => settings.highlightColor, (newVal, oldVal) => {
					if(!newVal){//[如果用户点击了清空（导致值为 null），则强制恢复默认值]
						settings.highlightColor = oldVal; 
					}
				});
	});
//还原配置
	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) importSettings(file);
	};
</script>
<style lang="scss" scoped>
.settings-page {
	width: 800px;
	.config-group {
		margin-bottom: 30px;
		h3 { border-left: 4px solid $primary-color; padding-left: 10px; margin-bottom: 20px; }
		.item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 12px 0;
			border-bottom: 1px solid #f0f0f0;
		}
	}
	.btn-group {
		display: flex;
		gap: 12px;
		.btn {
			padding: 8px 16px;
			cursor: pointer;
			border: 1px solid $primary-color;
			background: #fff;
			border-radius: 4px;
			
			&:hover { border-color: $primary-color; color: $primary-color; }
			&.danger { color: #f56c6c; &:hover { background: #fef0f0; } }
		}
		.file-label { display: inline-block; }
	}
}
</style>