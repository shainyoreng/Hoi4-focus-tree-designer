const handleToggleGridSnap = (gridSnap) => {
  return !gridSnap;
};

const handleToggleDarkMode = () => {
  document.body.classList.toggle('dark-mode');
};

const handleAddPrerequisiteGroup = (addPrerequisiteGroup) => {
  addPrerequisiteGroup();
};

const handleSaveChanges = (selectedFocus, focusNameInput, relativePositionSelect, focuses, savePrerequisites, saveAvailabilityConditions, drawFocuses, context, gridSize, focusPixelWidth, focusPixelHeight, closeInspectorMenu) => {
  if (selectedFocus) {
    selectedFocus.name = focusNameInput.value;
	selectedFocus.cost = parseInt(focusCostInput.value, 10);
    selectedFocus.setRelativeFocus(focuses[relativePositionSelect.value]);
    savePrerequisites(selectedFocus);
    saveAvailabilityConditions(selectedFocus);
    drawFocuses(context, focuses, gridSize, focusPixelWidth, focusPixelHeight);
    closeInspectorMenu();
  }
};

const handleCreateNextFocus = (selectedFocus, Focus, focuses, drawFocuses, context, gridSize, focusPixelWidth, focusPixelHeight, closeInspectorMenu) => {
  if (selectedFocus) {
    const newFocus = Focus.fromPointer(selectedFocus);
    focuses.push(newFocus);
    drawFocuses(context, focuses, gridSize, focusPixelWidth, focusPixelHeight);
    closeInspectorMenu();
  }
};

export { handleToggleGridSnap, handleToggleDarkMode, handleAddPrerequisiteGroup, handleSaveChanges, handleCreateNextFocus };
