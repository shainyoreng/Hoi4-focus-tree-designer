import { Condition } from './condition.js';

class Focus {
  constructor(name, children = [], prerequisite = [], available = [], bypass = []) {
    this.name = name;
    this.x = 0;
    this.y = 0;
    this.relative_position_focus_pointer = null;
    this.prerequisite = prerequisite;
    this.available = available;
    this.bypass = bypass;
  }

    getPosition() {
		if (this.relative_position_focus_pointer) {
			const { x: relative_focus_x, y: relative_focus_y } = this.relative_position_focus_pointer.getPosition();
			return { x: this.x + relative_focus_x, y: this.y + relative_focus_y };
		}
		else {
			return { x: this.x, y: this.y };
		}
	}
	setPosition(x, y) {
		if (this.relative_position_focus_pointer) {
			const { x: relative_focus_x, y: relative_focus_y } = this.relative_position_focus_pointer.getPosition();
			this.x = x - relative_focus_x;
			this.y = y - relative_focus_y;
		}
		else {
			this.x = x;
			this.y = y;
		}
	}
	changePosition(x, y) {
		this.x += x;
		this.y += y;
	}

	static fromPointer(relative_position_focus_pointer, x=0, y=6) {
		let new_focus = new Focus(
			"New Focus",
			[],
			[[relative_position_focus_pointer]],
			[],
			[]
		);
		new_focus.setPosition(x, y);
		new_focus.relative_position_focus_pointer = relative_position_focus_pointer;
		console.log(new_focus.getPosition());

		return new_focus;
	}
}

export { Focus };
