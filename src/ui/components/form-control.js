export default class FormControl extends HTMLElement {

  /** @type {HTMLElement | null} */
  #controller = null;
  static observedAttributes = ['label', 'for', 'labelClass'];

  constructor() {
    super();
  }

  /**
   * @param {HTMLElement} value
   */
  set controller(value) {
    this.#controller = value;
  }

  connectedCallback() {

    const label = document.createElement('label');

    label.setAttribute('for', this.getAttribute('for'));
    label.setAttribute('class', `yate:dark:text-zinc-300 ${this.getAttribute('labelClass')}`.trim());
    label.textContent = this.getAttribute('label');

    this.append(label, this.#controller);
    this.classList.add('yate:flex', 'yate:gap-3', 'yate:items-center');
  }
}

customElements.define('form-control', FormControl);
