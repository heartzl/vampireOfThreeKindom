let Utils = cc.Class({
    statics: {
        // 得到一个扇形
        getSector: function (position, radius, startAng, range) {
            let sector = {
                position: cc.v2(position.x, position.y),
                radius: radius,
                startAng: startAng,
                range: range > 360 ? 360 : 360
            }
            return sector;
        },

        // 得到一个椭圆
        getElliptic: function (position, long, short) {
            let elliptic = {
                position: cc.v2(position.x, position.y),
                long: long,
                short: short
            }
            return elliptic;
        },

        // 得到一个圆
        getCircle: function (position, r) {
            let circle = {
                position: cc.v2(position.x, position.y),
                radius: r,
            }
            return circle;
        },

        // 得到一个矩形
        getRect: function (position, height, width) {
            let rect = {
                position: cc.v2(position.x, position.y),
                height: height,
                width: width
            }
            return rect;
        },

        // 根据角度和距离获得一个二维向量
        getVec2ByAngAndDis: function (angle, distance) {
            let x = distance * Math.cos(angle * Math.PI / 180);
            let y = distance * Math.sin(angle * Math.PI / 180);
            return cc.v2(x, y);
        },

        // 根据两点获得的向量与水平向右方向向量的夹角(0~360)
        getAngleByTwoPoints: function (point1, point2) {
            let v = cc.v2((point2.x - point1.x), (point2.y - point1.y));
            let stdV = cc.v2(1, 0);
            let radian = stdV.signAngle(v);
            let angle = cc.misc.radiansToDegrees(radian);
            if (angle < 0) {
                angle += 360;
            }
            return angle;
        },

        // 两点间距离
        getDistanceByTwoPoints: function (point1, point2) {
            let v = cc.v2((point2.x - point1.x), (point2.y - point1.y));
            let dis = v.mag();
            return dis;
        },

        // 获得该角度从原点出发到椭圆边的距离
        getDistanceInElliptic: function (rotation, semi_majAxis, semi_minAxis) {
            let a = semi_majAxis;
            let b = semi_minAxis;
            let aPow = Math.pow(a, 2);
            let cosPow = Math.pow(Math.cos(rotation * Math.PI / 180.0), 2);
            let sinPow = Math.pow(Math.sin(rotation * Math.PI / 180.0), 2);
            let ecc = b / a;
            let eccPow = Math.pow(ecc, 2);
            return Math.sqrt(aPow / (cosPow + (1 / eccPow) * sinPow));
        },

        deepCopy: function (obj) {
            if (typeof obj !== 'object' || obj === null) {
                return obj;
            }
            let copy = Array.isArray(obj) ? [] : {};
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    copy[key] = this.deepCopy(obj[key]);
                }
            }
            return copy;
        },

        // 交换元素
        swap(arr, i, j) {
            const temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        },

        // 堆调整
        heapify(arr, i, len) {
            let largest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;

            if (left < len && arr[left] > arr[largest]) {
                largest = left;
            }

            if (right < len && arr[right] > arr[largest]) {
                largest = right;
            }

            if (largest !== i) {
                this.swap(arr, i, largest);
                this.heapify(arr, largest, len);
            }
        },

        buildMaxHeap(arr) {
            const len = arr.length;
            for (let i = Math.floor(len / 2); i >= 0; i--) {
                this.heapify(arr, i, len);
            }
        },

        // 堆排序
        heapSort(arr) {
            this.buildMaxHeap(arr);

            for (let i = arr.length - 1; i > 0; i--) {
                this.swap(arr, 0, i);
                this.heapify(arr, 0, i);
            }

            return arr;
        },

        // a星寻路算法
        a_StartFindWay: function (startPoint, endPoint, tileMatrix, isAround) {
            let stepOrder = 1
            startPoint.g = 0;
            startPoint.h = Math.abs(endPoint.x - startPoint.x) + Math.abs(endPoint.y - startPoint.y);
            startPoint.f = startPoint.g + startPoint.h;
            startPoint.order = stepOrder;
            let openList = [];
            let closeList = [startPoint];
            let checkTimes = isAround ? 8 : 4;

            while (1) {
                let lastPoint = closeList[closeList.length - 1];
                for (let i = 0; i < checkTimes; i++) {
                    let point = this.deepCopy(lastPoint);
                    switch (i) {
                        case 0:
                            point.y += 1;
                            break;
                        case 1:
                            point.y -= 1;
                            break;
                        case 2:
                            point.x -= 1;
                            break;
                        case 3:
                            point.x += 1;
                            break;
                        case 4:
                            point.x -= 1;
                            point.y += 1;
                            break;
                        case 5:
                            point.x += 1;
                            point.y += 1;
                            break;
                        case 6:
                            point.x -= 1;
                            point.y -= 1;
                            break;
                        case 7:
                            point.x += 1;
                            point.y -= 1;
                            break;
                    }
                    // 障碍物检测
                    if (tileMatrix) {
                        let isCanMove = true;
                        tileMatrix.forEach((element) => {
                            if (!isCanMove) {
                                return;
                            }
                            if (point.x === element[0] && point.y === element[1]) {
                                isCanMove = false;
                            }
                        });
                        if (!isCanMove) {
                            continue;
                        }
                    }
                    // 是否在封闭列表中
                    let isInCloseList = false;
                    closeList.forEach((element) => {
                        if (isInCloseList) {
                            return;
                        }
                        if (element.x === point.x && element.y === point.y) {
                            isInCloseList = true;
                        }
                    });
                    if (!isInCloseList) {
                        stepOrder++;
                        switch (i) {
                            case 0:
                                point.g += 10;
                                break;
                            case 1:
                                point.g += 10;
                                break;
                            case 2:
                                point.g += 10;
                                break;
                            case 3:
                                point.g += 10;
                                break;
                            case 4:
                                point.g += 14;
                                break;
                            case 5:
                                point.g += 14;
                                break;
                            case 6:
                                point.g += 14;
                                break;
                            case 7:
                                point.g += 14;
                                break
                        }
                        point.h = (Math.abs(endPoint.x - point.x) + Math.abs(endPoint.y - point.y)) * 10;
                        point.f = point.h + point.g;
                        point.order = stepOrder;
                        point.parent = lastPoint;
                        // 是否在开放列表中
                        let notInOpenList = true;
                        for (let index = 0; index < openList.length; index++) {
                            let openPoint = openList[index];
                            if (openPoint.x === point.x && openPoint.y === point.y) {
                                if (openPoint.g > point.g) {
                                    // 只更新g值，f值重新计算
                                    openPoint.g = point.g;
                                    openPoint.f = openPoint.g + openPoint.h;
                                    openPoint.parent = lastPoint;
                                }
                                notInOpenList = false;
                            }
                        }
                        if (notInOpenList) {
                            openList.push(point);
                        }
                    }
                }
                openList.sort(function (a, b) {
                    if (a.f === b.f) {
                        return b.order - a.order;
                    }
                    return a.f - b.f;
                })
                let perfectPoint = this.deepCopy(openList[0]);
                openList.splice(0, 1);
                closeList.push(perfectPoint);
                if (perfectPoint.x === endPoint.x && perfectPoint.y === endPoint.y) {
                    break;
                }
                //如果开启列表空了，没有通路，结果为空
                if (openList.length === 0) {
                    cc.log("没有通路");
                    break;
                }
            }
            let pathList = [];
            // 返回的数组中不包括起点
            for (let star = closeList.pop(); star.parent; star = star.parent) {
                pathList.push([star.x, star.y]);
            }
            return pathList;
        },

        randomInt: function (min, max) {
            if (min > max) {
                let temp = min;
                min = max;
                max = temp;
            }
            let randomNum = Math.floor(Math.random() * (max - min + 1) + min);
            return randomNum;
        },

        // 打乱数组
        disruptArray: function (array) {
            for (let i = array.length - 1; i > 0; i--) {
                let index = this.randomInt(0, i);
                let temp = array[i];
                array[i] = array[index];
                array[index] = temp;
            }
        },

        // 根据权重取随机数
        randomKeyByWeight: function (weightArr) {
            let max = 0;
            let rangeArr = [];
            for (let i = 0; i < weightArr.length; i++) {
                max += weightArr[i].value;
                rangeArr.push(max);
            }
            let num = this.randomInt(1, max);
            for (let i = 0; i < rangeArr.length; i++) {
                if (num <= rangeArr[i]) {
                    return weightArr[i].key;
                }
            }
        },

        // 数组去重
        deduplicateArray: function (array) {
            let arrayMap = {};
            let newArray = [];
            for (let i = 0; i < array.length; i++) {
                let element = array[i];
                if (!arrayMap[element]) {
                    newArray.push(element);
                    arrayMap[element] = 1;
                }
            }
            return newArray;
        },

        // 数组去重
        deduplicateArray2: function (spineNameList) {
            for (let i = 0, len = spineNameList.length; i < len; i++) {
                for (let j = i + 1, len = spineNameList.length; j < len; j++) {
                    if (spineNameList[i] == spineNameList[j]) {
                        spineNameList.splice(j, 1);
                        j--;        // 每删除一个数j的值就减1
                        len--;      // j值减小时len也要相应减1（减少循环次数，节省性能）
                    }
                }
            }
        },

        // 截取字符串
        cutStrByLength: function (str, length) {
            return str.slice(0, length);
        },

        // 获取当前毫秒数
        getTime: function () {
            return new Date().getTime();
        },
    }
})

module.exports = Utils;