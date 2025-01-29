import { Condition } from './condition.js';

class Focus {
  constructor(name, children = [], prerequisite = [], available = [], bypass = [], icon = 'icons/goal_unknown.png') {
    this.name = name;
    this.x = 0;
    this.y = 0;
    this.relative_position_focus_pointer = null;
    this.prerequisite = prerequisite;
    this.available = available;
    this.bypass = bypass;
    this.icon = icon;
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
	setRelativeFocus(relative_position_focus_pointer) {
		if (relative_position_focus_pointer == null) {
			return;
		}
		else if (relative_position_focus_pointer.relative_position_focus_pointer === this) {
			alert("Warning: Circular reference detected. The relative focus pointer cannot be set to create a circular reference.");
			return;
		}
		const { x: old_relative_x, y: old_relative_y } = this.relative_position_focus_pointer ? this.relative_position_focus_pointer.getPosition() : { x: 0, y: 0 };
		const { x: new_relative_x, y: new_relative_y } = relative_position_focus_pointer.getPosition();
		const DeltaX = old_relative_x - new_relative_x;
		const DeltaY = old_relative_y - new_relative_y;
		this.changePosition(DeltaX, DeltaY);
		this.relative_position_focus_pointer = relative_position_focus_pointer;
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

		return new_focus;
	}
}

export { Focus };
