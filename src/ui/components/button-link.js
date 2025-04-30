customElements.define('button-link', class extends HTMLElement {

  static observedAttributes = ['icon', 'label', 'href'];

  constructor() {
    super();
  }

  connectedCallback() {

    const iconEl = document.createElement('i');
    const iconWrapperEl = document.createElement('span');

    iconEl.setAttribute('class', `yate:inline-block yate:text-base yate:font-icomoon yate:not-italic ${this.getAttribute('icon')}`);
    iconWrapperEl.setAttribute('class', 'yate:inline-flex yate:h-6 yate:w-6 yate:items-center yate:justify-center');
    iconWrapperEl.append(iconEl);

    const labelEl = document.createElement('span');

    labelEl.textContent = this.getAttribute('label');

    const a = document.createElement('a');

    a.setAttribute('href', this.getAttribute('href'));
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noreferrer');
    a.setAttribute('class', 'yate:flex yate:items-center yate:rounded yate:border yate:border-blue-400 yate:px-2 yate:py-1 yate:text-sm yate:text-blue-400 yate:transition yate:hover:bg-blue-400 yate:hover:text-white');
    a.append(iconWrapperEl, labelEl);

    this.append(a);
  }

  attributeChangedCallback(name, oldValue, newValue) {

    if ('href' === name)
      this.querySelector('a')?.setAttribute('href', newValue);
  }
});
