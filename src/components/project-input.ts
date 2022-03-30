namespace App {
	export class ProjectInput extends Component<HTMLFormElement, HTMLDivElement> {
		titleEl: HTMLInputElement;
		descriptionEl: HTMLInputElement;
		peopleEl: HTMLInputElement;

		constructor() {
			super('project-input', 'app', true, 'user-input');
			this.titleEl = this.templateRenderEl.querySelector('#title') as HTMLInputElement;
			this.descriptionEl = this.templateRenderEl.querySelector('#description') as HTMLInputElement;
			this.peopleEl = this.templateRenderEl.querySelector('#people') as HTMLInputElement;

			this.configure();
		}

		configure() {
			this.templateRenderEl.addEventListener('submit', this.submitHandler);
		}

		renderContent() {}

		private getInputs(): [string, string, number] | void {
			const title = this.titleEl.value;
			const desc = this.descriptionEl.value;
			const people = this.peopleEl.value;

			if (
				!validate({ value: title, required: true }) ||
				!validate({ value: desc, required: true, minLength: 5 }) ||
				!validate({ value: people, required: true, min: 1, max: 5 })
			) {
				alert('Invalid input, please try again!');
				return;
			} else {
				return [title, desc, +people];
			}
		}

		private clearInputs() {
			this.titleEl.value = '';
			this.descriptionEl.value = '';
			this.peopleEl.value = '';
		}

		@AutoBind
		private submitHandler(event: Event) {
			event.preventDefault();
			const inputs = this.getInputs();

			if (Array.isArray(inputs)) {
				const [title, desc, people] = inputs;
				projectsState.addProject(title, desc, people);
				this.clearInputs();
			}
		}
	}
}
