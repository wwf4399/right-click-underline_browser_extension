import {handleGesture} from '@/utils/handleGesture.js'					// 匹配右键划线的手势
import {TrajectoryMatcher} from '@/utils/TrajectoryMatcher.js'			// 与划线相关的
import {settings, initAndListenSettings} from '@/utils/loadSettings.js'	// 加载用户diy的配置

//配置项-异步获取与实时监听
	initAndListenSettings();
//变量定义
	let shadowHost, canvas, ctx;
	let points1 = [];								// 用于绘图的高精度点
	let points2 = [];								// 用于逻辑匹配的稀疏点
	let isDrawing = false;							// 是否正在绘制划线
	let controller;									// 监听事件的控制器
	const isTopWindow = (window === window.top);	// 当前是否为顶层窗口（false=在iframe中）
	const SAMPLING_DISTANCE = 15;					// 距离阈值：只有当移动距离超过 15 像素时，才记录到 points2
	const DRAW_SAMPLING_DISTANCE = 3;				// 绘图点阈值：减少 points1 的堆积
	const MIN_PATH_LENGTH = 200;					// 只有当用户划过的物理像素长度超过一定数值（例如 30 像素）时才触发
	const myOptions = {
		capture: true,								// true=优先拦截
		passive: false								// true=性能优先。不能调用 preventDefault()，页面滚动更顺滑。false=控制优先。允许调用 preventDefault() 来拦截浏览器默认行为。
	};
//顶层窗口监听来自子 iframe 的跨域消息
	if(isTopWindow){
		window.addEventListener('message', (msg) => {
			if(typeof(msg.data)==='object' && msg.data.owner==='gesture-extension'){
				const { type, clientX, clientY } = msg.data;
				//找出发送该消息的 iframe 元素以换算坐标
					const targetIframe = Array.from(document.querySelectorAll('iframe')).find(iframe => iframe.contentWindow === msg.source) || null;
				//模拟顶层鼠标动作，由主页面接管 Canvas 绘制
					if(type === 'pointerdown'){
						pointerdown_itemFn(getAbsolutePageCoords({ clientX, clientY }, targetIframe));
					}else if(type === 'pointermove'){
						pointer_move_itemFn(getAbsolutePageCoords({ clientX, clientY }, targetIframe));
					}else if(type === 'pointerup'){
						pointer_up_itemFn();
					}else if(type === 'blur'){
						resetState();
					}
			}
		});
		//将 iframe 里的相对坐标转为主页面的绝对坐标
			function getAbsolutePageCoords(e, iframeElement = null){
				let x = e.clientX;
				let y = e.clientY;
				if(iframeElement){
					const rect = iframeElement.getBoundingClientRect();//尝试各种办法优化过了的，还是老老实实每次都去获取实时位置吧
					x += rect.left;
					y += rect.top;
				}
				return { x, y };
			}
	}
//鼠标按下
	function pointerdown_itemFn(currentPoint){
		points1 = [currentPoint];//绘图点
		points2 = [{...currentPoint}];//这么写好像可以避免，修改到points1的时候，points2被影响。好像、好像、好像
		initCanvas();
	}
	window.addEventListener('pointerdown', (e) => {
		if(settings.isEnabled && e.pointerType==='mouse' && e.buttons===2){//配置页开启了右键划线 && 仅限物理鼠标右键 && 是右键单独按下
			if(isTopWindow){
				pointerdown_itemFn({x: e.clientX, y: e.clientY});
			}else{
				window.top.postMessage({
					owner: 'gesture-extension',
					type: 'pointerdown',
					clientX: e.clientX,
					clientY: e.clientY
				}, '*');
			}
			//控制器[控制监听事件失效]
				//如果上一次动作没结束，直接全部取消
					if(controller){
						controller.abort();
						controller = null;
					}
				//创建一个新的控制器
					controller = new AbortController();
					const { signal } = controller;
			//监听鼠标移动
				window.addEventListener('pointermove',	pointer_move,	{...myOptions, signal});
				window.addEventListener('mousemove',	mouse_move,		{...myOptions, signal});//仅一个目的：阻止事件传播
			//监听鼠标抬起
				window.addEventListener('pointerup',	pointer_up,		{...myOptions, signal});
				window.addEventListener('mouseup',		mouse_up,		{...myOptions, signal});//仅一个目的：阻止事件传播
			//整个页面失去焦点[例如切换标签页、alt+tab切换窗口]
				window.addEventListener('blur', (e) => {
					//判断是否来自于iframe内部的失焦，如果是的话，不做处理
						if(document.activeElement === e.target){return;}
					if(isTopWindow===false){
						window.top.postMessage({ owner: 'gesture-extension', type: 'blur' }, '*');
					}
					if(controller){
						controller.abort();
						controller = null;
					}
					resetState();
				}, {signal});
		}
	}, {capture: true});
//右键菜单触发
	window.addEventListener('contextmenu', (e) => {
		if(isDrawing){
			//阻止事件传播
				finalBlocker(e);
			//重置状态
				resetState();
			return false;
		}
	}, myOptions);
//初始化canvas
	function initCanvas(){
		if(isTopWindow){
			const dpr = window.devicePixelRatio || 1;
			if(!shadowHost){
				//创建 Shadow DOM 的宿主元素
					shadowHost = document.createElement('div');
					shadowHost.id = 'gesture-extension-shadow-host-' + Math.random().toString().slice(-6);
					shadowHost.style.cssText = `
						position: fixed !important;
						top: 0 !important;
						left: 0 !important;
						width: 0 !important;
						height: 0 !important;
						z-index: 2147483647 !important;
						pointer-events: none !important;
					`;
				//附加 shadow root (mode: 'closed' 可以最大程度防止原网页脚本探测和修改)
					const shadowRoot = shadowHost.attachShadow({ mode: 'closed' });
				//创建真正的 canvas 元素
					canvas = document.createElement('canvas');
					canvas.style.cssText = `
						position: fixed !important;
						top: 0 !important;
						left: 0 !important;
						width: 100vw !important;
						height: 100vh !important;
						z-index: 2147483647 !important;
						pointer-events: auto !important;/* 不允许穿透到原网页 */
						display: none;
						background: transparent !important;
						border: none !important;
						margin: 0 !important;
						padding: 0 !important;
						opacity: 1 !important;
						box-shadow: none !important;
						mix-blend-mode: normal !important;
					`;
				//将 canvas 挂载到影子根节点下，再将宿主挂载到 html
					shadowRoot.appendChild(canvas);
					document.documentElement.appendChild(shadowHost);
					ctx = canvas.getContext('2d');
			}
			//页面的尺寸有可能会变化的，所以每次都需要动态设置
				canvas.width = window.innerWidth * dpr;
				canvas.height = window.innerHeight * dpr;
				ctx.scale(dpr, dpr);
		}
	}
//绘制路径
	function drawPath(){
		if(isTopWindow){
			if(points1.length < 3){
				//如果是刚开始画，先画出第一段
					const p1 = points1[0];
					const p2 = points1[1];
					ctx.beginPath();
					ctx.moveTo(p1.x, p1.y);
					ctx.lineTo((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
					ctx.stroke();
			}else{
				ctx.beginPath();
				ctx.lineWidth = settings.lineWidth || 9;
				ctx.strokeStyle = settings.lineColor || '#3498db';//1F2937
				ctx.lineJoin = 'round';//拐角圆润
				ctx.lineCap = 'round';//末端圆润

				// 获取最后三个点来计算平滑曲线
				const p0 = points1[points1.length - 3];
				const p1 = points1[points1.length - 2];
				const p2 = points1[points1.length - 1];

				// 计算前两个点的中点作为起点
				const mid1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
				// 计算后两个点的中点作为终点
				const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

				ctx.moveTo(mid1.x, mid1.y);//将画笔移到起点
				ctx.quadraticCurveTo(p1.x, p1.y, mid2.x, mid2.y);//贝塞尔曲线路径
				ctx.stroke();//把画好的路径画出来
			}
		}
	}
//阻止事件传播
	function finalBlocker(e){
		//让同级和上下级的监听都变成“聋子”
			e.stopImmediatePropagation();
		//告诉浏览器不要执行与此事件关联的“默认动作”（例如：不要触发滚动、不要选择文字）
			if(e.cancelable){//cancelable是一个布尔值属性，它表示：当前这个事件的默认行为是否可以用 e.preventDefault() 来取消
				e.preventDefault();
			}
	}
//重置状态
	function resetState(){
		setTimeout(() => {//因为mouseup和contextmenu都会重置，为了避免产生冲突，延后执行重置
			isDrawing = false;
			points1 = [];
			points2 = [];
			if(canvas){
				canvas.style.display = 'none';
				ctx.clearRect(0, 0, canvas.width, canvas.height);
			}
		}, 0)
	}
//鼠标移动
	function pointer_move_itemFn(currentPoint){
		//points1 记录逻辑
			if(TrajectoryMatcher.getDistance(points1.at(-1), currentPoint) > DRAW_SAMPLING_DISTANCE){//增加距离过滤，避免点位过密。只有移动超过一定像素后才记录到绘图点 points1
				points1.push(currentPoint);
				//只有点数足够才开始绘图
					if(points1.length >= 3){
						if(isDrawing === false){
							isDrawing = true;
							canvas.style.display = 'block';
						}
						drawPath();
						//性能优化：清理 points1
						//绘图只需要最后三个点来保证下一段曲线的连贯性
						//我们保留最后三个点，删掉前面已经画过的旧点
							if(points1.length > 3){
								points1.splice(0, points1.length - 3);
							}
					}
			}
		//points2 疏松记录逻辑
			if(TrajectoryMatcher.getDistance(points2.at(-1), currentPoint) > SAMPLING_DISTANCE){
				points2.push(currentPoint);
			}
	}
	function pointer_move(e){
		if(e.pointerType==='mouse' && e.buttons&2){//仅限物理鼠标右键 && (位运算)(右键是按住的状态)
			//阻止事件传播
				finalBlocker(e);
			if(isTopWindow){
				pointer_move_itemFn({x: e.clientX, y: e.clientY});
			}else{
				window.top.postMessage({
					owner: 'gesture-extension',
					type: 'pointermove',
					clientX: e.clientX,
					clientY: e.clientY
				}, '*');
			}
		}
	}
	function mouse_move(e){
		if(isDrawing){//这里千万别使用“e.button===2”进行判断，因为在mousemove事件中是没有e.button的。用isDrawing判断应该是够了的
			finalBlocker(e);
		}
	}
//鼠标抬起
	function pointer_up_itemFn(){
		if(isDrawing){
			//确保最后一个点也被记录，保证手势完整
				if(points2.at(-1) !== points1.at(-1)){
					points2.push(points1.at(-1));
				}
			//只有当用户划过的物理像素长度超过一定数值时才触发
				if(TrajectoryMatcher.getPathLength(points2) > MIN_PATH_LENGTH){
					handleGesture(points2);
				}
			resetState();
		}
	}
	function pointer_up(e){
		if(e.button===2){
			//动作完成，销毁该次动作产生的所有监听器
				if(controller){
					controller.abort();
					controller = null;
				}
			//阻止事件传播
				finalBlocker(e);
			if(isTopWindow){
				pointer_up_itemFn();
			}else{
				window.top.postMessage({
					owner: 'gesture-extension',
					type: 'pointerup',
					clientX: e.clientX,
					clientY: e.clientY
				}, '*');
			}
		}
	}
	function mouse_up(e){
		if(isDrawing && e.button===2){
			//阻止事件传播
				finalBlocker(e);
			//动作完成，销毁该次动作产生的所有监听器
				if(controller){
					controller.abort();
					controller = null;
				}
		}
	}