import { Focus } from './focus.js';
import { Condition } from './condition.js';

const canvas = document.getElementById('treeCanvas');
const context = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;

const gridSize = 20;
let gridSnap = false;

const toggleGridSnapButton = document.getElementById('toggleGridSnap');
toggleGridSnapButton.addEventListener('click', () => {
  gridSnap = !gridSnap;
});

const snapToGrid = (value, gridSize) => {
  return Math.round(value / gridSize) * gridSize;
};

const drawGrid = () => {
  context.strokeStyle = getComputedStyle(document.body).getPropertyValue('--grid-line-color');
  context.lineWidth = 0.5;
  for (let x = 0; x < width; x += gridSize) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
};

const focusWidth = 5; // in grid squares
const focusHeight = 3; // in grid squares

const focusPixelWidth = focusWidth * gridSize;
const focusPixelHeight = focusHeight * gridSize;

// Example data
const focuses = [new Focus("Root")];
focuses.push(Focus.fromPointer(focuses[0]));
focuses[1].name = 'children'

console.log(focuses[1].getPosition());
// Draw focuses as rectangles with names
const drawFocuses = () => {
	context.clearRect(0, 0, width, height);
	drawGrid();
	focuses.forEach((focus) => {
		const pos = {
			x: focus.getPosition().x * gridSize,
			y: focus.getPosition().y * gridSize
		};
		context.fillStyle = getComputedStyle(document.body).getPropertyValue('--focus-background-color');
		context.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border-color');
		context.fillRect(pos.x, pos.y, focusPixelWidth, focusPixelHeight);
		context.strokeRect(pos.x, pos.y, focusPixelWidth, focusPixelHeight);
		context.fillStyle = getComputedStyle(document.body).getPropertyValue('--focus-text-color');
		context.fillText(focus.name, pos.x + 10, pos.y + 25);
	});
};

drawFocuses();
let isDragging = false;
let dragFocus = null;
let offsetX, offsetY;

canvas.addEventListener('mousedown', (e) => {
	const mouseX = e.offsetX;
	const mouseY = e.offsetY;

	focuses.forEach((focus) => {
		const pos = {
			x: focus.getPosition().x * gridSize,
			y: focus.getPosition().y * gridSize
		};
		if (mouseX > pos.x && mouseY > pos.y && mouseX < pos.x + focusPixelWidth && mouseY < pos.y + focusPixelHeight) {
			isDragging = true;
			dragFocus = focus;
			offsetX = mouseX - pos.x;
			offsetY = mouseY - pos.y;
		}
	});
});

canvas.addEventListener('mousemove', (e) => {
	if (isDragging) {
		let mouseX = e.offsetX-offsetX;
		let mouseY = e.offsetY-offsetY;
		if (gridSnap) {
			mouseX = snapToGrid(mouseX, gridSize);
			mouseY = snapToGrid(mouseY, gridSize);
		}
		dragFocus.setPosition(mouseX/gridSize, mouseY/gridSize);
		drawFocuses();
	}
});

canvas.addEventListener('mouseup', () => {
	isDragging = false;
	dragFocus = null;
});

const toggleDarkModeButton = document.getElementById('toggleDarkMode');
toggleDarkModeButton.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  drawFocuses();
});