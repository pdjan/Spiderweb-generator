"use strict";
var currCanvas = "myCanvas",
	memorySlots = {"slot1" : [],
		"slot2" : [],
		"slot3" : [],
		"slot4" : [],
		"slot5" : [],
		"slot6" : []
	    };

var slider_circles = document.getElementById('circles');
slider_circles.addEventListener('input', onSliderChange);

var slider_nodes = document.getElementById('nodes');
slider_nodes.addEventListener('input', onSliderChange);

var slider_distance = document.getElementById('distance');
slider_distance.addEventListener('input', onSliderChange);

var slider_radius = document.getElementById('radius');
slider_radius.addEventListener('input', onSliderChange);

var slider_tension = document.getElementById('tension');
slider_tension.addEventListener('input', onSliderChange);
		
function Point(x, y) {
    this.x = x;
    this.y = y;
}
function drawLine(x1, y1, x2, y2, ccanvas) {
    var ctx = document.getElementById(ccanvas).getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    if (ccanvas === "myCanvas") {
        ctx.lineWidth = 3;
    } else {
        ctx.lineWidth = 1;
    }
    ctx.strokeStyle = 'black';
    ctx.stroke();
}

function drawCurves(a, t, ccanvas) {
    var m,
        pointOnMedianX,
        pointOnMedianY,
        controlX,
        controlY,
	context = document.getElementById(ccanvas).getContext('2d'),
	webx = document.getElementById(ccanvas).width / 2,
	weby = document.getElementById(ccanvas).height / 2;
    
    context.beginPath();
	
    for (m = 0; m < a.length - 1; m = m + 1) {
	context.moveTo(a[m].x, a[m].y);
	pointOnMedianX = (a[m].x + a[m + 1].x) / 2;
	pointOnMedianY = (a[m].y + a[m + 1].y) / 2;
	controlX = t * webx + (1 - t) * pointOnMedianX;
	controlY = t * weby + (1 - t) * pointOnMedianY;
	context.quadraticCurveTo(controlX, controlY, a[m + 1].x, a[m + 1].y);
    }
    context.moveTo(a[a.length - 1].x, a[a.length - 1].y);
	
    pointOnMedianX = (a[a.length - 1].x + a[0].x) / 2;
    pointOnMedianY = (a[a.length - 1].y + a[0].y) / 2;
    controlX = t * webx + (1 - t) * pointOnMedianX;
    controlY = t * weby + (1 - t) * pointOnMedianY;
	
    context.quadraticCurveTo(controlX, controlY, a[0].x, a[0].y);
    if (ccanvas === "myCanvas") {
        context.lineWidth = 2;
    } else {
        context.lineWidth = 0.7;
    }
    context.strokeStyle = 'black';
    context.stroke();
}

function trim(num) {
    var nstr = parseInt(num * 100, 10);
    return Number(nstr / 100);
}

function makeWeb(circles, nodes, distance, radius, tension, ccanvas) {
	var canvas = document.getElementById(ccanvas),
	    webx = canvas.width / 2,
	    weby = canvas.height / 2,
	    coords = [],
            angle,
	    currentRadius = radius,
	    angleStep = 360 / nodes,
            i,
            j,
            z1,
            z2,
            point,
            l;

	for (i = 0; i < circles; i = i + 1) {
		currentRadius += currentRadius * distance;
		for (j = 0; j < nodes; j = j + 1) {
			angle = angleStep * (j + 1);
			angle = angle * Math.PI / 180;
			z1 = webx + trim(currentRadius * Math.cos(angle));
			z2 = weby + trim(currentRadius * Math.sin(angle));
			
			point = new Point(z1, z2);
			coords.push(point);

		}
		drawCurves(coords, tension, ccanvas);
		if (i === circles - 1) {
			for (l = 0; l < coords.length; l = l + 1) {
				drawLine(webx, weby, coords[l].x, coords[l].y, ccanvas);
			}
		}
		coords.splice(0, nodes);
	}
}

function initWeb() {
    
	var circlesValue = Number(document.getElementById('circles').value),
	    nodesValue = Number(document.getElementById('nodes').value),
	    distanceValue = Number(document.getElementById('distance').value),
	    radiusValue = Number(document.getElementById('radius').value),
	    tensionValue = Number(document.getElementById('tension').value),
	    c = document.getElementById("myCanvas"),
	    ctx = c.getContext("2d");
    
	ctx.clearRect(0, 0, c.width, c.height);
	makeWeb(circlesValue, nodesValue, distanceValue, radiusValue, tensionValue, "myCanvas");
}
function saveWeb() {
    var kez,
	circlesValue = Number(document.getElementById('circles').value),
        nodesValue = Number(document.getElementById('nodes').value),
        distanceValue = Number(document.getElementById('distance').value),
        radiusValue = Number(document.getElementById('radius').value),
        tensionValue = Number(document.getElementById('tension').value),
        slotname,
        c,
        ctx;
		
    for (kez in memorySlots) {
        // if array is empty, memory slot is available
		if (memorySlots[kez].length === 0) {
			memorySlots[kez] = [circlesValue, nodesValue, distanceValue, radiusValue, tensionValue];
			makeWeb(circlesValue, nodesValue, distanceValue, radiusValue / 10, tensionValue, kez);
			break; // exit for loop
		}
    }
}
function restoreWeb(clicked_id) {
    // this function restores spiderweb from memory slot into main canvas
    var c = document.getElementById("myCanvas"),
	ctx = c.getContext("2d"),
        key;
    // take info from slot1 and draw makeWeb into myCanvas
    for (key in memorySlots) {
        if (key === clicked_id && memorySlots[key].length > 0) {
            ctx.clearRect(0, 0, c.width, c.height);
            makeWeb(memorySlots[key][0], memorySlots[key][1],
                    memorySlots[key][2], memorySlots[key][3],
                    memorySlots[key][4], "myCanvas");
            break;
        }
    }
}
function deleteWeb(clicked_id) {
    // this function clears clicked canvas
    var c = document.getElementById(clicked_id),
        ctx = c.getContext("2d"),
        key,
        str = "Delete web in " + clicked_id + " ?";
    // and empties slot array
    for (key in memorySlots) {
        if (key === clicked_id && memorySlots[key].length > 0) {
            if (window.confirm(str)) {
                memorySlots[key] = [];
                ctx.clearRect(0, 0, c.width, c.height);
                break;
            } else {
                break; 
            }
        }
    }
}

function onSliderChange() {
	// update web on any slider change
	initWeb()
}

makeWeb(5, 7, 0.4, 20, 0.25, currCanvas);
