import Component from './base-component';
import { Draggable } from '../models/drag-drop';
import { Project } from '../models/project';
import { AutoBind } from '../decorators/autoBind';

export default class ProjectItem extends Component<HTMLLIElement, HTMLUListElement> implements Draggable {
	private project: Project;

	get persons() {
		if (this.project.people === 1) {
			return '1 person';
		} else {
			return `${this.project.people} persons`;
		}
	}

	constructor(hostId: string, prj: Project) {
		super('single-project', hostId, false, prj.id);
		this.project = prj;

		this.configure();
		this.renderContent();
	}

	@AutoBind
	dragStartHandler(event: DragEvent): void {
		event.dataTransfer!.setData('text/plain', this.project.id);
	}

	@AutoBind
	dragEndHandler(_: DragEvent): void {
		console.log('drag end');
	}

	configure(): void {
		this.templateRenderEl.addEventListener('dragstart', this.dragStartHandler);
		this.templateRenderEl.addEventListener('dragend', this.dragEndHandler);
	}

	renderContent(): void {
		this.templateRenderEl.querySelector('h2')!.textContent = this.project.title;
		this.templateRenderEl.querySelector('h3')!.textContent = this.persons + ` assigned`;
		this.templateRenderEl.querySelector('p')!.textContent = this.project.description;
	}
}
