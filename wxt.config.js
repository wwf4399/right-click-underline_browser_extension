import { defineConfig } from 'wxt';
import AutoImport from 'unplugin-auto-import/vite';							//自动导入 JS 函数
import Components from 'unplugin-vue-components/vite';						//自动导入 Vue 组件
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

//该页面的配置文档 https://wxt.dev/api/config.html
export default defineConfig({
	modules: ['@wxt-dev/module-vue'],	// 告诉 WXT 框架，你的插件全面启用 Vue 3 开发支持
	extensionApi: 'chrome',				// 指定 WXT 系统在全局全局变量中，首选并强制使用哪套浏览器原生 API 命名空间
	manifest: {
		permissions: [
			'storage',		// 允许插件存储数据
			'downloads',	// 允许下载
			'search',		// 搜索
			'tabs',			// 标签
			'sessions'		// 会话（Session）历史管理权限
		],
		host_permissions: [	// 所有地址可以加载本插件
			'<all_urls>',
			'file:///*'
		],
		icons: {
			"16": "icon/16.png",
			"32": "icon/32.png",
			"48": "icon/48.png",
			"64": "icon/64.png",
			"128":"icon/128.png"
		},
	},
	vite: () => ({
		plugins: [
			//自动导入 Vue 相关函数 (ref, reactive 等) 和 Element Plus API
				AutoImport({
					resolvers: [ElementPlusResolver()],
				}),
			//自动导入 Element Plus 组件
				Components({
					resolvers: [
						ElementPlusResolver({
							importStyle: 'sass', //如果你想让组件跟随你的全局 SCSS 变量
						})
					],
				}),
		],
		css: {
			preprocessorOptions: {
				scss: {
					additionalData: `@use "@/assets/variables.scss" as *;`// 自动导入css变量
				}
			}
		},
	})
});