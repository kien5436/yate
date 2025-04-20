import '../common/scrollbar.css';

export default class ComboBox extends HTMLElement {

  /** @type {HTMLUListElement | null} */
  #listEl = null;
  /** @type {HTMLInputElement | null} */
  #inputEl = null;
  /** @type {HTMLDivElement | null} */
  #dropdown = null;
  /** @type {HTMLButtonElement | null} */
  #labelBtn = null;
  /** @type {HTMLLIElement | null} */
  #focusedOption = null;
  #currentValue = '';
  static observedAttributes = ['placeholder'];

  constructor() {
    super();

    /** @type {string[]} */
    this.options = [];
    this.selected = '';
  }

  connectedCallback() {

    const labelBtn = document.createElement('button');

    labelBtn.setAttribute('type', 'button');
    labelBtn.setAttribute('class', 'yate:cursor-pointer yate:border yate:border-zinc-300 yate:rounded yate:px-2 yate:py-1 yate:text-sm yate:w-full yate:min-w-full yate:bg-transparent yate:max-h-8 yate:transition yate:focus:outline-none yate:focus:shadow-none yate:focus:border-blue-400 yate:dark:text-zinc-200 yate:dark:border-zinc-700');
    labelBtn.textContent = this.selected;
    labelBtn.addEventListener('click', this.#toggleDropdown2.bind(this));

    const input = document.createElement('input');

    input.setAttribute('class', 'yate:border yate:border-zinc-300 yate:rounded yate:px-2 yate:py-1 yate:text-sm yate:w-full yate:min-w-full yate:bg-transparent yate:max-h-8 yate:transition yate:focus:outline-none yate:focus:shadow-none yate:focus:border-blue-400 yate:dark:text-zinc-200 yate:dark:border-zinc-700');
    input.setAttribute('type', 'text');
    input.setAttribute('placeholder', this.getAttribute('placeholder'));
    input.value = this.selected;
    input.addEventListener('input', this.#onInput.bind(this));
    this.#inputEl = input;

    const inputWrapper = document.createElement('div');

    inputWrapper.setAttribute('class', 'yate:m-2');
    inputWrapper.append(input);

    const ul = document.createElement('ul');

    ul.setAttribute('class', 'yate:py-1 yate:box-border yate:max-h-30 yate:overflow-y-auto has-scrollbar yate:text-sm yate:m-0');
    ul.append(this.#createOptions());

    const dropdown = document.createElement('div');

    dropdown.setAttribute('class', 'yate:absolute yate:box-border yate:left-0 yate:top-6 yate:w-full yate:rounded-b yate:shadow-md yate:bg-white yate:overflow-hidden yate:z-10 yate:border yate:border-t-0 yate:border-solid yate:border-blue-400 yate:hidden yate:dark:bg-zinc-900');
    dropdown.append(inputWrapper, ul);
    dropdown.addEventListener('click', this.#select.bind(this));

    this.setAttribute('class', 'yate:relative');
    this.#labelBtn = labelBtn;
    this.#listEl = ul;
    this.#dropdown = dropdown;
    this.append(labelBtn, dropdown);
    this.addEventListener('keyup', this.#onKeyup.bind(this));
  }

  #createOptions() {

    const fragment = document.createDocumentFragment();

    for (const option of this.options)

      if (option.toLowerCase().includes(this.#currentValue.toLowerCase())) {

        const optionEl = this.#createOption(option);

        fragment.append(optionEl);
      }

    return fragment;
  }

  /**
  * @param {string} option
  */
  #createOption(option) {

    const li = document.createElement('li');

    li.setAttribute('class', 'yate:cursor-pointer dark:yate:hover:bg-blue-600 yate:box-border yate:w-full yate:px-4 yate:py-1 yate:whitespace-nowrap yate:transition-colors yate:hover:bg-blue-400 yate:hover:text-zinc-50 yate:dark:text-zinc-200 yate:focus-visible:outline-none');
    li.setAttribute('data-value', option);
    li.setAttribute('tabindex', '-1');
    li.textContent = option;

    return li;
  }

  /**
  * @param {InputEvent} e
  */
  #onInput(e) {

    this.#currentValue = e.target.value.trim();
    this.#listEl.replaceChildren(this.#createOptions());
  }

  /**
  * @param {boolean} show
  */
  #toggleDropdown(show) {

    if (show) {

      this.#dropdown.classList.remove('yate:hidden');
      this.#labelBtn.classList.add('yate:border-blue-400');
      this.#labelBtn.classList.remove('yate:border-zinc-300', 'yate:dark:border-zinc-700');

      if (null !== this.#focusedOption) {

        this.#focusedOption.classList.add('yate:bg-blue-400', 'yate:text-zinc-50', 'dark:yate:bg-blue-600');
        this.#focusedOption.focus();
      }

      this.#inputEl.focus();
    }
    else {
      this.#dropdown.classList.add('yate:hidden');
      this.#labelBtn.classList.remove('yate:border-blue-400');
      this.#labelBtn.classList.add('yate:border-zinc-300', 'yate:dark:border-zinc-700');

      this.#labelBtn.focus();
    }
  }

  /**
  * @param {MouseEvent | KeyboardEvent} e
  */
  #select(e) {

    if ('LI' === e.target.tagName) {

      this.selected = e.target.getAttribute('data-value');
      this.#labelBtn.textContent = this.selected;
      this.#focusedOption = e.target;

      this.#toggleDropdown(false);
    }
  }

  /**
  * @param {KeyboardEvent} e
  */
  #onKeyup(e) {

    e.preventDefault();

    if ('Escape' === e.key) {
      this.#toggleDropdown(false);
    }
    else if ('Enter' === e.key) {
      this.#select(e);
    }
    else if ('ArrowDown' === e.key) {

      if (null !== this.#focusedOption)
        this.#focusedOption.classList.remove('yate:bg-blue-400', 'yate:text-zinc-50', 'dark:yate:bg-blue-600');

      if (null === this.#focusedOption)
        this.#focusedOption = this.#listEl.firstElementChild;
      else
        this.#focusedOption = this.#focusedOption.nextElementSibling;

      if (null !== this.#focusedOption) {

        this.#focusedOption.classList.add('yate:bg-blue-400', 'yate:text-zinc-50', 'dark:yate:bg-blue-600');
        this.#focusedOption.focus();
      }
    }
    else if ('ArrowUp' === e.key) {

      if (null !== this.#focusedOption)
        this.#focusedOption.classList.remove('yate:bg-blue-400', 'yate:text-zinc-50', 'dark:yate:bg-blue-600');

      if (null === this.#focusedOption)
        this.#focusedOption = this.#listEl.lastElementChild;
      else
        this.#focusedOption = this.#focusedOption.previousElementSibling;

      if (null !== this.#focusedOption) {

        this.#focusedOption.classList.add('yate:bg-blue-400', 'yate:text-zinc-50', 'dark:yate:bg-blue-600');
        this.#focusedOption.focus();
      }
    }
  }

  #toggleDropdown2() {

    this.#toggleDropdown(this.#dropdown.classList.contains('yate:hidden'));
  }
}

customElements.define('combo-box', ComboBox);
