const utils = require("Utils");
let Collision = cc.Class({
    statics: {
        // 点在是否在矩形内
        checkPointInRect: function (a, b) {
            let bottom = b.y - b.height / 2;
            let top = b.y + b.height / 2;
            let left = b.x - b.width / 2;
            let right = b.x + b.width / 2;
            if (a.position.x <= right && a.position.x >= left) {
                return a.y <= top && a.y >= bottom;
            } else {
                return false;
            }
        },

        // 点是否在扇形内
        checkPointInSector: function (sector, target) {
            let distance = utils.getDistanceByTwoPoints(sector.position, target);
            if (distance <= sector.radius) {
                let minAng = sector.startAng;
                let maxAng = minAng + sector.range;
                let checkAngle = utils.getAngleByTwoPoints(sector.position, target);
                return checkAngle >= minAng && checkAngle <= maxAng;
            } else {
                return false;
            }
        },

        // 点是否在椭圆内
        checkPointInElliptic: function (a, b) {
            let long = b.width / 2;
            let short = b.height / 2;
            let bBox = cc.rect(b.x, b.y, long * 2, short * 2);
            let isInBox = this.checkPointInRect(a, bBox);
            if (isInBox) {
                let x = b.x - a.x;
                let y = b.y - a.y;
                let result = (x * x) / (b.a * b.a) + (y * y) / (b.b * b.b);
                return result <= 1;
            } else {
                return false;
            }
        },

        // 点到线段的距离(垂足不在线段上返回距离最近端点的距离)
        truePointLineDistance: function (point, start, end) {
            // 线段向量(起点指向终点)
            let v1 = end.sub(start);
            // 点与线段起始点的向量
            let v2 = point.sub(start);
            // 点与线段终点的向量
            let v3 = point.sub(end);
            // 点的垂足在终点右侧
            if (v1.dot(v2) < 0) {
                return v2.mag();
            }
            // 点的垂足在起点左侧
            else if (v1.dot(v3) > 0) {
                return v3.mag();
            }
            // 点的垂足在线段内
            else {
                return Math.abs(v1.cross(v2)) / v1.mag();
            }
        },

        // 点到线段的距离(垂足不在线段上返回-1)
        pointLineDistance: function (point, start, end) {
            // 线段向量(起点指向终点)
            let v1 = end.sub(start);
            // 点与线段起始点的向量
            let v2 = point.sub(start);
            // 点与线段终点的向量
            let v3 = point.sub(end);
            // 点的垂足在终点右侧
            if (v1.dot(v2) < 0) {
                return -1;
            }
            // 点的垂足在起点左侧
            else if (v1.dot(v3) > 0) {
                return -1;
            }
            // 点的垂足在线段内
            else {
                return Math.abs(v1.cross(v2)) / v1.mag();
            }
        },

        // 两线段是否相交
        lineLine: function (a1, a2, b1, b2) {
            // 快速排斥实验，先看两线段的投影是否相交
            if (Math.max(b1.x, b2.x) < Math.min(a1.x, a2.x) || Math.max(b1.y, b2.y) < Math.min(a1.y, a2.y) ||
                Math.max(a1.x, a2.x) < Math.min(b1.x, b2.x) || Math.max(a1.y, a2.y) < Math.min(b1.y, b2.y)) {
                return false;
            }
            // 跨立实验，看两线段是否相交
            // a1为第一条线段的起始点, a2为第一条线段的结尾点, b1为第二条线段的起始点, b2为第二条线段的结尾点
            let cross1 = this.crossProduct(a1, a2, a1, b1);
            let cross2 = this.crossProduct(a1, a2, a1, b2);
            let cross3 = this.crossProduct(b1, b2, b1, a1);
            let cross4 = this.crossProduct(b1, b2, b1, a2);
            return !(cross1 * cross2 > 0 || cross3 * cross4 > 0);
        },

        // 计算叉积
        crossProduct: function (point1, point2, point3, point4) {
            return (
                (point2.x - point1.x) * (point4.y - point3.y) -
                (point2.y - point1.y) * (point4.x - point3.x)
            );
        },

        // 圆与椭圆是否碰撞
        circularElliptic: function (circular, elliptic) {
            let distance = utils.getDistanceByTwoPoints(elliptic.position, circular.position);
            let angle = utils.getAngleByTwoPoints(elliptic.position, circular.position)
            let ellipticR = utils.getDistanceInElliptic(angle, elliptic.long / 2, elliptic.short / 2);
            return distance <= (ellipticR + circular.width / 2);
        },

        // 圆与扇形是否碰撞
        circularSector: function (sector, circular) {
            let distance = utils.getDistanceByTwoPoints(sector.position, circular.position);
            if (distance <= (sector.radius + circular.width / 2)) {
                let checkAng = utils.getDistanceByTwoPoints(sector.position, circular.position);
                let minAng = sector.startAng;
                let maxAng = minAng + sector.range;
                if (maxAng >= 360 && checkAng < minAng) {
                    checkAng += 360;
                }
                return checkAng > minAng && checkAng < maxAng;
            } else {
                return false;
            }
        },

        // 圆与矩形是否碰撞
        circularRect: function (circle, rect) {
            let lTPoint = cc.v2(rect.position.x - rect.width / 2, rect.position.y + rect.height / 2);
            let rTPoint = cc.v2(rect.position.x + rect.width / 2, rect.position.y + rect.height / 2);
            let rBPoint = cc.v2(rect.position.x + rect.width / 2, rect.position.y - rect.height / 2);
            let lBPoint = cc.v2(rect.position.x - rect.width / 2, rect.position.y - rect.height / 2);
            let pointList = [lTPoint, rTPoint, rBPoint, lBPoint];
            for (let i = 0; i < pointList.length; i++) {
                let nextIndex = (i + 1) % pointList.length;
                let start = pointList[i];
                let end = pointList[nextIndex];
                let distance = this.truePointLineDistance(circle.position, start, end);
                if (distance <= circle.radius) {
                    return true;
                }
            }
            return false;
        },

        // 两圆是否碰撞
        circularCircular: function (a, b) {
            let distance = utils.getDistanceByTwoPoints(a.position, b.position);
            return distance < a.radius + b.radius;
        },

        // 扇形与矩形是否碰撞
        sectorRect: function (sector, rect) {
            let lTPoint = cc.v2(rect.position.x - rect.width / 2, rect.position.y + rect.height / 2);
            let rTPoint = cc.v2(rect.position.x + rect.width / 2, rect.position.y + rect.height / 2);
            let rBPoint = cc.v2(rect.position.x + rect.width / 2, rect.position.y - rect.height / 2);
            let lBPoint = cc.v2(rect.position.x - rect.width / 2, rect.position.y - rect.height / 2);
            let pointList = [lTPoint, rTPoint, rBPoint, lBPoint];
            for (let i = 0; i < pointList.length; i++) {
                let point = pointList[i];
                let isInSector = this.checkPointInSector(sector, point);
                if (isInSector) {
                    return true
                }
            }
            return false;
        },

        // 两矩形是否碰撞
        rectRect: function (a, b) {
            // a的左上角、右下角坐标
            let aPointList = [a.position.x - a.width / 2, a.position.y + a.height / 2,
                a.position.x + a.width / 2, a.position.y - a.height / 2];
            let bPointList = [b.position.x - b.width / 2, b.position.y + b.height / 2,
                b.position.x + b.width / 2, b.position.y - b.height / 2];
            return !(aPointList[0] > bPointList[2] || aPointList[2] < bPointList[0] ||
                aPointList[1] < bPointList[3] || aPointList[3] > bPointList[1]);
        },
    }
})

module.exports = Collision;