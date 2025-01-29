class Condition {
  constructor(type, inputs = {}) {
    this.type = type;
    this.inputs = inputs;
  }

  static getConditionTypes() {
    return {
      "Always": [],
      "Political power": ["comparator", "limit"],
      "Has opinion of": ["target", "comparator", "limit"],
      "All Of": ["conditions"],
      "One of": ["conditions"],
      "Date": ["comparator", "date"]
    };
  }

  static createInputElement(inputType, value = '') {
    let inputElement;
	
    switch (inputType) {
      case 'comparator':
        inputElement = document.createElement('select');
        ['<', '>', '='].forEach(op => {
          const option = document.createElement('option');
          option.value = op;
          option.text = op;
          inputElement.appendChild(option);
		  inputElement.style.width = '50px';
        });
        break;
      case 'limit':
        inputElement = document.createElement('input');
        inputElement.type = 'number';
        break;
      case 'target':
        inputElement = document.createElement('input');
        inputElement.type = 'text';
		inputElement.addEventListener('input', function() {
		  this.value = this.value.toUpperCase().slice(0, 3);
		});
		inputElement.style.width = '30px';
        break;
      case 'date':
        inputElement = document.createElement('input');
        inputElement.type = 'date';
        break;
      case 'conditions':
        inputElement = document.createElement('div');
        inputElement.classList.add('sub-conditions');
        break;
      default:
        inputElement = document.createElement('input');
        inputElement.type = 'text';
    }
    inputElement.value = value;
    inputElement.classList.add(`condition-${inputType}`);
    return inputElement;
  }
}

export { Condition };
