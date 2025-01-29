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

const gridSize = 27;
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

const focusWidth = 4; // in grid squares
const focusHeight = 4; // in grid squares

const focusPixelWidth = focusWidth * gridSize;
const focusPixelHeight = focusHeight * gridSize;

// Example data
const focuses = [new Focus("Root")];
focuses.push(Focus.fromPointer(focuses[0]));
focuses[1].name = 'children';

// Draw focuses as rectangles with names
const drawFocuses = () => {
  context.clearRect(0, 0, width, height);
  drawGrid();
  
  // Draw lines first
  focuses.forEach((focus) => {
    focus.prerequisite.forEach(group => {
      const isDotted = group.length > 1;
      group.forEach(prerequisite => {
        const startPos = {
          x: focus.getPosition().x * gridSize + focusPixelWidth / 2,
          y: focus.getPosition().y * gridSize
        };
        const endPos = {
          x: prerequisite.getPosition().x * gridSize + focusPixelWidth / 2,
          y: prerequisite.getPosition().y * gridSize + focusPixelHeight
        };
        context.beginPath();
        context.moveTo(startPos.x, startPos.y);
        context.lineTo(endPos.x, endPos.y);
        context.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border-color');
        if (isDotted) {
          context.setLineDash([5, 5]);
        } else {
          context.setLineDash([]);
        }
        context.stroke();
		context.setLineDash([]);
      });
    });
  });

  // Draw focuses
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
      context.drawImage(img, pos.x + focusPixelWidth/2 -  focusPixelHeight*0.4, pos.y + 5, focusPixelHeight*0.8, focusPixelHeight*0.8);
    };
    context.fillStyle = getComputedStyle(document.body).getPropertyValue('--focus-text-color');
	context.textAlign = 'center';
	context.textBaseline = 'bottom';
	context.font = '12px Arial';
	
	context.fillText(focus.name, pos.x + focusPixelWidth / 2, pos.y + focusPixelHeight);
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

const prerequisitesContainer = document.getElementById('prerequisites');
const addPrerequisiteGroupButton = document.getElementById('addPrerequisiteGroup');

const updatePrerequisiteOptions = (selectElement, currentFocus) => {
  selectElement.innerHTML = '';
  focuses.forEach((focus, index) => {
    if (focus !== currentFocus) {
      const option = document.createElement('option');
      option.value = index;
      option.text = focus.name;
      selectElement.appendChild(option);
    }
  });
};

const addPrerequisite = (groupElement, currentFocus) => {
	const selectElement = document.createElement('select');
	selectElement.classList.add('prerequisite');
	updatePrerequisiteOptions(selectElement, currentFocus);
	groupElement.insertBefore(selectElement, groupElement.querySelector('.add-prerequisite'));
};

const addPrerequisiteGroup = () => {
	const groupElement = document.createElement('div');
	groupElement.classList.add('prerequisite-group');
	addPrerequisite(groupElement, selectedFocus);
	const addButton = document.createElement('button');
	addButton.textContent = '+';
	addButton.classList.add('add-prerequisite');
	addButton.addEventListener('click', () => addPrerequisite(groupElement, selectedFocus));
	const deleteButton = document.createElement('button');
	deleteButton.textContent = '-';
	deleteButton.classList.add('delete-prerequisite');
	deleteButton.addEventListener('click', () => {
	  const prerequisites = groupElement.querySelectorAll('.prerequisite');
	  if (prerequisites.length > 1) {
	    prerequisites[prerequisites.length - 1].remove();
	  } else {
	    groupElement.remove();
	  }
	});
	groupElement.appendChild(addButton);
	groupElement.appendChild(deleteButton);
	prerequisitesContainer.appendChild(groupElement);
};

addPrerequisiteGroupButton.addEventListener('click', addPrerequisiteGroup);

const loadPrerequisites = (focus) => {
  prerequisitesContainer.innerHTML = '';
  focus.prerequisite.forEach(group => {
    const groupElement = document.createElement('div');
    groupElement.classList.add('prerequisite-group');
    group.forEach(prerequisite => {
      const selectElement = document.createElement('select');
      selectElement.classList.add('prerequisite');
      updatePrerequisiteOptions(selectElement, focus);
      selectElement.value = focuses.indexOf(prerequisite);
      groupElement.appendChild(selectElement);
    });
    const addButton = document.createElement('button');
    addButton.textContent = '+';
    addButton.classList.add('add-prerequisite');
    addButton.addEventListener('click', () => addPrerequisite(groupElement, focus));
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '-';
    deleteButton.classList.add('delete-prerequisite');
    deleteButton.addEventListener('click', () => {
      const prerequisites = groupElement.querySelectorAll('.prerequisite');
      if (prerequisites.length > 1) {
        prerequisites[prerequisites.length - 1].remove();
      } else {
        groupElement.remove();
      }
    });
    groupElement.appendChild(addButton);
    groupElement.appendChild(deleteButton);
    prerequisitesContainer.appendChild(groupElement);
  });
};

const savePrerequisites = (focus) => {
  focus.prerequisite = [];
  const groups = prerequisitesContainer.querySelectorAll('.prerequisite-group');
  groups.forEach(group => {
    const prerequisites = [];
    const selects = group.querySelectorAll('.prerequisite');
    selects.forEach(select => {
      prerequisites.push(focuses[select.value]);
    });
    focus.prerequisite.push(prerequisites);
  });
};

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

  loadPrerequisites(focus);

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
    selectedFocus.setRelativeFocus(focuses[relativePositionSelect.value]);
    savePrerequisites(selectedFocus);
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
  icons.forEach((icon, index) => {
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
    if (index % 6 === 0) {
      const row = document.createElement('div');
      row.classList.add('icon-row');
      iconGrid.appendChild(row);
    }
    iconGrid.lastChild.appendChild(img);
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
