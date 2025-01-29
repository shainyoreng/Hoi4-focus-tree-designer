const resizeCanvas = (canvas) => {
  canvas.width = window.innerWidth * 0.7;
  canvas.height = window.innerHeight * 0.9;
};

const drawGrid = (context, width, height, gridSize) => {
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

const drawFocuses = (context, focuses, gridSize, focusPixelWidth, focusPixelHeight) => {
  const width = context.canvas.width;
  const height = context.canvas.height;
  context.clearRect(0, 0, width, height);
  drawGrid(context, width, height, gridSize);

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
      context.drawImage(img, pos.x + focusPixelWidth / 2 - focusPixelHeight * 0.4, pos.y + 5, focusPixelHeight * 0.8, focusPixelHeight * 0.8);
    };
    context.fillStyle = getComputedStyle(document.body).getPropertyValue('--focus-text-color');
    context.textAlign = 'center';
    context.textBaseline = 'bottom';
    context.font = '12px Arial';

    context.fillText(focus.name, pos.x + focusPixelWidth / 2, pos.y + focusPixelHeight);
  });
};

export { resizeCanvas, drawGrid, drawFocuses };
