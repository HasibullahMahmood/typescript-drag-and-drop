// DRAG AND DROP INTERFACES
namespace App {
	export interface Draggable {
		dragStartHandler(event: DragEvent): void;
		dragEndHandler(event: DragEvent): void;
	}

	export interface Droppable {
		dragOverHandler(event: DragEvent): void;
		dropHandler(event: DragEvent): void;
		dragLeaveHandler(event: DragEvent): void;
	}
}
