export default abstract class Component<T extends HTMLElement, U extends HTMLElement> {
	templateEl: HTMLTemplateElement;
	templateRenderEl: T;
	hostEl: U;

	constructor(templateId: string, hostId: string, insertAtFirst: boolean, templateRenderElId?: string) {
		this.templateEl = document.querySelector(`#${templateId}`)! as HTMLTemplateElement;
		this.hostEl = document.querySelector(`#${hostId}`)! as U;
		this.templateRenderEl = document.importNode(this.templateEl.content, true).firstElementChild as T;
		if (templateRenderElId) {
			this.templateRenderEl.id = templateRenderElId;
		}

		this.attach(insertAtFirst);
	}

	private attach(insertAtBeginning: boolean) {
		this.hostEl.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend', this.templateRenderEl);
	}

	abstract renderContent(): void;
	abstract configure(): void;
}
