import { Focus } from './focus.js';
import { Condition } from './condition.js';

const canvas = document.getElementById('treeCanvas');
function resizeCanvas() {
	canvas.width = window.innerWidth * 0.7;
	canvas.height = window.innerHeight * 0.9;
}
resizeCanvas();
const context = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;

const gridSize = 20;
let gridSnap = true;

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
focuses[1].name = 'children';

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
    const img = new Image();
    img.src = focus.icon;
    img.onload = () => {
      context.drawImage(img, pos.x + 5, pos.y + 5, 40, 40);
    };
    context.fillStyle = getComputedStyle(document.body).getPropertyValue('--focus-text-color');
    context.fillText(focus.name, pos.x + 50, pos.y + 25);
  });
};

drawFocuses();
let isDragging = false;
let dragFocus = null;
let offsetX, offsetY;

const inspectorMenu = document.getElementById('inspectorMenu');
const focusNameInput = document.getElementById('focusName');
const relativePositionSelect = document.getElementById('relativePosition');
const saveChangesButton = document.getElementById('saveChanges');

let selectedFocus = null;

const openInspectorMenu = (focus) => {
  selectedFocus = focus;
  console.log(selectedFocus.name);
  focusNameInput.value = focus.name;
  relativePositionSelect.innerHTML = '';
  
  const noneOption = document.createElement('option');
  noneOption.value = null;
  noneOption.text = 'None';
  relativePositionSelect.appendChild(noneOption);

  focuses.forEach((f, index) => {
    if (f !== focus) {
      const option = document.createElement('option');
      option.value = index;
      option.text = f.name;
      if (focus.relative_position_focus_pointer === f) {
        option.selected = true;
      }
      relativePositionSelect.appendChild(option);
    }
  });

  inspectorMenu.style.display = 'block';
};

const closeInspectorMenu = () => {
  if (iconOverlay.style.display === 'none') {
    inspectorMenu.style.display = 'none';
    selectedFocus = null;
  }
};

saveChangesButton.addEventListener('click', () => {
  if (selectedFocus) {
    selectedFocus.name = focusNameInput.value;
    console.log(focuses[relativePositionSelect.value].name);
    selectedFocus.setRelativeFocus(focuses[relativePositionSelect.value]);
    drawFocuses();
    closeInspectorMenu();
  }
});

const createNextFocusButton = document.getElementById('createNextFocus');

createNextFocusButton.addEventListener('click', () => {
  if (selectedFocus) {
    const newFocus = Focus.fromPointer(selectedFocus);
    focuses.push(newFocus);
    drawFocuses();
    closeInspectorMenu();
  }
});

// Close inspector menu when clicking outside of it
document.addEventListener('click', (e) => {
  if (!inspectorMenu.contains(e.target) && !canvas.contains(e.target) && iconOverlay.style.display === 'none') {
    closeInspectorMenu();
  }
});

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
      openInspectorMenu(focus);
    }
  });
});

canvas.addEventListener('mousemove', (e) => {
  if (isDragging) {
    let mouseX = e.offsetX - offsetX;
    let mouseY = e.offsetY - offsetY;
    if (gridSnap) {
      mouseX = snapToGrid(mouseX, gridSize);
      mouseY = snapToGrid(mouseY, gridSize);
    }
    dragFocus.setPosition(mouseX / gridSize, mouseY / gridSize);
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

const chooseIconButton = document.getElementById('chooseIcon');
const iconOverlay = document.getElementById('iconOverlay');
const iconGrid = document.getElementById('iconGrid');
const closeOverlayButton = document.getElementById('closeOverlay');

chooseIconButton.addEventListener('click', () => {
  iconOverlay.style.display = 'flex';
  populateIconGrid();
});

closeOverlayButton.addEventListener('click', () => {
  iconOverlay.style.display = 'none';
  if (selectedFocus) {
    inspectorMenu.style.display = 'block';
  }
});

const populateIconGrid = async () => {
  iconGrid.innerHTML = '';
  const icons = await getIconNames('icons');
  icons.forEach(icon => {
    const img = document.createElement('img');
    img.src = `icons/${icon}`;
    img.alt = icon;
    img.addEventListener('click', () => {
      if (selectedFocus) {
        selectedFocus.icon = `icons/${icon}`;
        drawFocuses();
        iconOverlay.style.display = 'none';
      }
    });
    iconGrid.appendChild(img);
  });
};

const getIconNames = async (dir) => {
  try {
    const response = await fetch(dir);
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const icons = Array.from(doc.querySelectorAll('a'))
      .map(link => link.href.split('/').pop())
      .filter(name => name.endsWith('.png'));
    return icons;
  } catch (err) {
    console.error('Error fetching icons:', err);
    return [];
  }
};
