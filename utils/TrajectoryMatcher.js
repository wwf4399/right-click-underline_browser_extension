export const TrajectoryMatcher = {
	//计算两组轨迹的相似度 (0-100, 100表示完全相同)
		calculateSimilarity(pathA, pathB){
			if(pathA.length < 2 || pathB.length < 2){return 0;}
			//空间归一化。缩放到相对空间，消除位置和大小影响
				const normA = this.normalize(pathA);
				const normB = this.normalize(pathB);
			//重采样[确保两组点数量一致]
				const sampleSize = 20;//[通常 20 个点足够识别形状]
				const resampledA = this.resample(normA, sampleSize);
				const resampledB = this.resample(normB, sampleSize);
			//计算所有采样点之间的平均距离
				let totalDistance = 0;
				for(let i=0; i<sampleSize; i++){
					totalDistance += this.getDistance(resampledA[i], resampledB[i]);
				}
			//平均距离
				const avgDist = totalDistance / sampleSize;
			//将距离转换为分数，0-100%
				const score = Math.max(0, 1 - avgDist * 2) * 100;
			return Math.round(score);//使用 Math.round 取整，通常业务场景不需要小数点
		},
	//空间归一化[消除用户画图时位置和大小的影响][位置：图形移动到坐标原点(0,0)]
		normalize(points){
			const xs = points.map(p => p.x);
			const ys = points.map(p => p.y);
			const minX = Math.min(...xs);
			const maxX = Math.max(...xs);
			const minY = Math.min(...ys);
			const maxY = Math.max(...ys);
			
			const width = maxX - minX || 1;
			const height = maxY - minY || 1;
			//比例缩放[计算图形的宽度和高度，取较大值作为缩放比例][将所有点除以这个比例]
				const scale = Math.max(width, height);
			//使图形映射到一个坐标范围在 0到1 之间的单位正方形中
				return points.map(p => ({
					x: (p.x - minX) / scale,
					y: (p.y - minY) / scale
				}));
		},
	//标准化点的数量[确保无论用户划线的速度快慢、路径长短，最终参与比对的点数都是一致的]
		resample(points, n){
			const resampled = [points[0]];													//初始化重采样数组，直接放入轨迹的起点作为第一个点
			const totalLen = this.getPathLength(points);									//整条路径的物理像素总长度
			const interval = totalLen / (n - 1);											//目标点之间的固定间距（步长）：总长度 / (总点数 - 1)
			let accumulatedDist = 0;														//用于记录在遍历过程中，当前线段上距离上一个重采样点已经累积了多少长度
			for(let i = 1; i < points.length; i++){											//遍历原始点集，从第二个点开始，计算与前一个点的线段关系
				//计算当前原始点与其前一个点之间的欧氏距离
					let d = this.getDistance(points[i - 1], points[i]);
					let currentAccumulated = accumulatedDist;
				//如果“当前线段长度 + 已累积长度”超过了预设的步长，说明需要在这段路径上插入新点
					while(currentAccumulated + d >= interval){
						//利用线性插值公式计算新点的位置:
						//计算新的点应该处于当前线段的哪个比例位置 (ratio)
							const ratio = (interval - currentAccumulated) / d;
						//根据比例计算出新点的 X 和 Y 坐标
							const newNode = {
								x: points[i - 1].x + ratio * (points[i].x - points[i - 1].x),
								y: points[i - 1].y + ratio * (points[i].y - points[i - 1].y)
							};
						//将计算出的新点存入结果数组
							resampled.push(newNode);
						//如果已经采集够了预设的 n 个点，提前结束函数
							if(resampled.length === n){
								return resampled;
							}
						//更新剩余距离：将起点暂时移到新点位置，继续在剩余段中寻找下一个重采样点
							d = this.getDistance(newNode, points[i]);
							points[i-1] = newNode;
							currentAccumulated = 0;
					}
				//累加当前线段的剩余部分长度
					accumulatedDist = currentAccumulated + d;
			}

			//补齐逻辑：如果因为浮点数精度或路径极短导致点数不足，用最后一个原始点填充
				while(resampled.length < n){
					resampled.push(points[points.length - 1]);
				}
			return resampled;
		},
	//计算两点间距离
		getDistance(p1, p2){
			return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
		},
	//计算线的长度
		getPathLength(points){
			let len = 0;
			for(let i=1; i<points.length; i++){
				len += this.getDistance(points[i - 1], points[i]);
			}
			return len;
		}
};