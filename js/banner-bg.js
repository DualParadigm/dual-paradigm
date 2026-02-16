/**
 * Banner 背景：从两端出发的闭合曲线，左 #FFA6A6→#FF6E9C，右 #64C3FF→#6FFFD6。
 */
var np = 300;
var blobRadius = 220;
var noiseAmp = 2.7;
var colLeftStart, colLeftEnd, colRightStart, colRightEnd;

function setup() {
	var container = document.getElementById('banner-canvas-container');
	if (!container) return;
	var w = container.offsetWidth || windowWidth;
	var h = Math.max(180, container.offsetHeight || 200);
	var c = createCanvas(w, h);
	c.parent('banner-canvas-container');
	background(255);
	noFill();
	noiseSeed(random(100));
	colLeftStart = color(255, 166, 166);   // #FFA6A6 左端
	colLeftEnd = color(255, 110, 156);     // #FF6E9C 左演变后
	colRightStart = color(100, 195, 255);  // #64C3FF 右端
	colRightEnd = color(111, 255, 214);     // #6FFFD6 右演变后
}

function draw() {
	var cy = height / 2 + 50 * sin(frameCount / 50);
	var cxLeft = frameCount * 2 - 200;
	var cxRight = width + 200 - frameCount * 2;

	drawBlob(cxLeft, cy, true);
	drawBlob(cxRight, cy, false);

	if (frameCount > width + 500) {
		noLoop();
	}
}

function drawBlob(cx, cy, isLeft) {
	beginShape();
	var sx, sy;
	for (var i = 0; i < np; i++) {
		var angle = map(i, 0, np, 0, TWO_PI);
		var xx = blobRadius * cos(angle + cx / 10);
		var yy = blobRadius * sin(angle + cx / 10);
		var v = createVector(xx, yy);
		var nx = (xx + cx) / 150;
		var ny = (yy + cy) / 150;
		v.mult(1 + noiseAmp * noise(nx, ny));
		vertex(cx + v.x, cy + v.y);
		if (i === 0) {
			sx = cx + v.x;
			sy = cy + v.y;
		}
	}
	// 左：FFA6A6 → FF6E9C；右：64C3FF → 6FFFD6
	var t;
	if (isLeft) {
		t = map(cx, -200, width / 2, 0, 1);
		t = constrain(t, 0, 1);
		stroke(lerpColor(colLeftStart, colLeftEnd, t));
	} else {
		t = map(cx, width / 2, width + 200, 1, 0);
		t = constrain(t, 0, 1);
		stroke(lerpColor(colRightStart, colRightEnd, t));
	}
	strokeWeight(0.1);
	vertex(sx, sy);
	endShape();
}

function windowResized() {
	var container = document.getElementById('banner-canvas-container');
	if (!container || !document.getElementsByClassName('p5Canvas').length) return;
	var w = container.offsetWidth || windowWidth;
	var h = Math.max(180, container.offsetHeight || 200);
	resizeCanvas(w, h);
}
