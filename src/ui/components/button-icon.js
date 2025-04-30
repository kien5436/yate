export default class ButtonIcon extends HTMLElement {

  static observedAttributes = ['icon', 'href', 'title'];

  constructor() {
    super();

    this.onClick = new CustomEvent('yclick', {
      bubbles: false,
      cancelable: false,
    });
  }

  connectedCallback() {

    const iconEl = document.createElement('i');

    iconEl.setAttribute('class', `yate:font-icomoon yate:not-italic ${this.getAttribute('icon')}`);

    const href = this.getAttribute('href');
    let btnEl;

    if (href) {

      btnEl = document.createElement('a');

      btnEl.setAttribute('href', href);
      btnEl.setAttribute('target', '_blank');
      btnEl.setAttribute('rel', 'noreferrer noopener');
    }
    else {
      btnEl = document.createElement('button');

      btnEl.setAttribute('type', 'button');
    }

    btnEl.classList.add('yate:bg-transparent', 'yate:w-6', 'yate:h-6', 'yate:inline-flex', 'yate:justify-center', 'yate:items-center', 'yate:border-none');
    btnEl.setAttribute('title', this.getAttribute('title'));
    btnEl.append(iconEl);
    btnEl.addEventListener('click', () => this.dispatchEvent(this.onClick));
    this.append(btnEl);
    this.classList.add('yate:cursor-pointer');
  }
}

customElements.define('button-icon', ButtonIcon);
