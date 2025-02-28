import { Focus } from './focus.js';
import { Condition } from './condition.js';
import { resizeCanvas, drawFocuses } from './utils/canvasUtils.js';
import { handleToggleGridSnap, handleToggleDarkMode, handleAddPrerequisiteGroup, handleSaveChanges, handleCreateNextFocus } from './utils/buttonHandlers.js';
import { populateIconGrid } from './utils/iconOverlay.js';

const canvas = document.getElementById('treeCanvas');
resizeCanvas(canvas);
const context = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;

const gridSize = 27;
let gridSnap = true;

const toggleGridSnapButton = document.getElementById('toggleGridSnap');
toggleGridSnapButton.addEventListener('click', () => {
  gridSnap = handleToggleGridSnap(gridSnap);
});

const snapToGrid = (value, gridSize) => {
  return Math.round(value / gridSize) * gridSize;
};

const focusWidth = 4; // in grid squares
const focusHeight = 4; // in grid squares

const focusPixelWidth = focusWidth * gridSize;
const focusPixelHeight = focusHeight * gridSize;

// Example data
const focuses = [new Focus("Root")];
focuses.push(Focus.fromPointer(focuses[0]));
focuses[1].name = 'children';

drawFocuses(context, focuses, gridSize, focusPixelWidth, focusPixelHeight);

let isDragging = false;
let dragFocus = null;
let offsetX, offsetY;

const inspectorMenu = document.getElementById('inspectorMenu');
const focusNameInput = document.getElementById('focusName');
const relativePositionSelect = document.getElementById('relativePosition');
const saveChangesButton = document.getElementById('saveChanges');

const focusCostInput = document.getElementById('focusCost');
const focusCostValue = document.getElementById('focusCostValue');

// Update the displayed cost value when the slider is moved
focusCostInput.addEventListener('input', () => {
  focusCostValue.textContent = focusCostInput.value;
});

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

addPrerequisiteGroupButton.addEventListener('click', () => handleAddPrerequisiteGroup(addPrerequisiteGroup));

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

const availabilityConditionsContainer = document.getElementById('availabilityConditions');

const addCondition = (container, condition = new Condition("Always"), isRoot = false) => {
  const conditionElement = document.createElement('div');
  conditionElement.classList.add('availability-condition');

  const typeSelect = document.createElement('select');
  typeSelect.classList.add('condition-type');
  Object.keys(Condition.getConditionTypes()).forEach(type => {
    const option = document.createElement('option');
    option.value = type;
    option.text = type;
    typeSelect.appendChild(option);
  });
  typeSelect.value = condition.type;
  conditionElement.appendChild(typeSelect);

  const inputsContainer = document.createElement('div');
  inputsContainer.classList.add('condition-inputs');
  conditionElement.appendChild(inputsContainer);

  const updateInputs = () => {
    inputsContainer.innerHTML = '';
    const inputs = Condition.getConditionTypes()[typeSelect.value];
    inputs.forEach(input => {
      const inputElement = Condition.createInputElement(input, condition.inputs[input]);
      inputsContainer.appendChild(inputElement);
      if (input === 'conditions') {
        const addSubConditionButton = document.createElement('button');
        addSubConditionButton.textContent = '+';
        addSubConditionButton.classList.add('add-condition');
        addSubConditionButton.addEventListener('click', () => addCondition(inputElement));
        inputsContainer.appendChild(addSubConditionButton);
      }
    });
  };

  typeSelect.addEventListener('change', updateInputs);
  updateInputs();

  container.appendChild(conditionElement);
};


const loadAvailabilityConditions = (focus) => {
  availabilityConditionsContainer.innerHTML = '';
  if (focus.available.length > 0) {
    addCondition(availabilityConditionsContainer, new Condition(focus.available[0].type, focus.available[0].inputs), true);
  } else {
    addCondition(availabilityConditionsContainer, new Condition("Always"), true);
  }
};

const saveAvailabilityConditions = (focus) => {
  focus.available = [];
  const conditions = availabilityConditionsContainer.querySelectorAll('.availability-condition');
  
  const parseCondition = (conditionElement) => {
    const condition = new Condition();
    condition.type = conditionElement.querySelector('.condition-type').value;
    const inputs = Condition.getConditionTypes()[condition.type];
    inputs.forEach(input => {
      if (input === 'conditions') {
        const subConditionsContainer = conditionElement.querySelector('.sub-conditions');
        const subConditions = subConditionsContainer.querySelectorAll('.availability-condition');
        condition.inputs[input] = Array.from(subConditions).map(parseCondition);
      } else {
        condition.inputs[input] = conditionElement.querySelector(`.condition-${input}`).value;
      }
    });
    return condition;
  };

  conditions.forEach(conditionElement => {
    focus.available.push(parseCondition(conditionElement));
  });
};

const openInspectorMenu = (focus) => {
  selectedFocus = focus;
  console.log(selectedFocus.name);
  focusNameInput.value = focus.name;
  focusCostInput.value = focus.cost || 0;
  focusCostValue.textContent = focus.cost || 0;
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
  loadAvailabilityConditions(focus);

  inspectorMenu.style.display = 'block';
};

const closeInspectorMenu = () => {
  if (iconOverlay.style.display === 'none') {
    inspectorMenu.style.display = 'none';
    selectedFocus = null;
  }
};


saveChangesButton.addEventListener('click', () => handleSaveChanges(selectedFocus, focusNameInput, relativePositionSelect, focuses, savePrerequisites, saveAvailabilityConditions, drawFocuses, context, gridSize, focusPixelWidth, focusPixelHeight, closeInspectorMenu));

const createNextFocusButton = document.getElementById('createNextFocus');

createNextFocusButton.addEventListener('click', () => handleCreateNextFocus(selectedFocus, Focus, focuses, drawFocuses, context, gridSize, focusPixelWidth, focusPixelHeight, closeInspectorMenu));

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
    drawFocuses(context, focuses, gridSize, focusPixelWidth, focusPixelHeight);
  }
});

canvas.addEventListener('mouseup', () => {
  isDragging = false;
  dragFocus = null;
});

const toggleDarkModeButton = document.getElementById('toggleDarkMode');
toggleDarkModeButton.addEventListener('click', () => {
  handleToggleDarkMode();
  drawFocuses(context, focuses, gridSize, focusPixelWidth, focusPixelHeight);
});

const chooseIconButton = document.getElementById('chooseIcon');
const iconOverlay = document.getElementById('iconOverlay');
const iconGrid = document.getElementById('iconGrid');
const closeOverlayButton = document.getElementById('closeOverlay');

chooseIconButton.addEventListener('click', () => {
  iconOverlay.style.display = 'flex';
  populateIconGrid(iconGrid, selectedFocus, drawFocuses, context, focuses, gridSize, focusPixelWidth, focusPixelHeight, iconOverlay);
});

closeOverlayButton.addEventListener('click', () => {
  iconOverlay.style.display = 'none';
  if (selectedFocus) {
    inspectorMenu.style.display = 'block';
  }
});

const generateCodeButton = document.getElementById('generateCode');

const generateFocusTreeCode = (focuses) => {
  let code = 'focus_tree = {\n';
  focuses.forEach((focus, index) => {
    const id = `XAQ_${focus.name.toLowerCase().replace(/\s+/g, '_')}`;
    code += `\tfocus = {\n`;
    code += `\t\tid = ${id}\n`;
    code += `\t\ticon = ${focus.icon}\n`;
    code += `\t\tx = ${focus.x}\n`;
    code += `\t\ty = ${focus.y}\n`;
    code += `\t\tprerequisite = { ${focus.prerequisite.map(group => group.map(prerequisite => `focus = XAQ_${prerequisite.name.toLowerCase().replace(/\s+/g, '_')}`).join(' ')).join(' ')} }\n`;
    code += `\t\tmutually_exclusive = { }\n`;
    code += `\t\tcost = ${focus.cost || 5}\n`;
    code += `\t\tai_will_do = {\n`;
    code += `\t\t\tfactor = 1\n`;
    code += `\t\t}\n`;
    code += `\t\tbypass = {\n`;
    code += `\t\t}\n`;
    code += `\t\tcancel_if_invalid = yes\n`;
    code += `\t\tcontinue_if_invalid = no\n`;
    code += `\t\tcompletion_reward = {\n`;
    code += `\t\t\tadd_political_power = 150\n`;
    code += `\t\t\tadd_stability = 0.05\n`;
    code += `\t\t}\n`;
    code += `\t}\n`;
  });
  code += '}';
  return code;
};

generateCodeButton.addEventListener('click', () => {
  const code = generateFocusTreeCode(focuses);
  console.log(code);
  alert('Focus tree code generated. Check the console for the output.');
});
