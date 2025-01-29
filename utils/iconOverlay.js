const populateIconGrid = async (iconGrid, selectedFocus, drawFocuses, context, focuses, gridSize, focusPixelWidth, focusPixelHeight, iconOverlay) => {
  iconGrid.innerHTML = '';
  const icons = await getIconNames('icons');
  icons.forEach((icon, index) => {
    const img = document.createElement('img');
    img.src = `icons/${icon}`;
    img.alt = icon;
    img.addEventListener('click', () => {
      if (selectedFocus) {
        selectedFocus.icon = `icons/${icon}`;
        drawFocuses(context, focuses, gridSize, focusPixelWidth, focusPixelHeight);
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

export { populateIconGrid, getIconNames };
