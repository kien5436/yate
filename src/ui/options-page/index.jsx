import { runtime } from 'webextension-polyfill';

import '../common/base.css';
import '../common/fonts.css';
import ButtonLink from '../components/button-link.jsx';
import '../components/preferences-pane.js';
import { extensionUrl } from '../../settings.js';
import { h, Fragment, render } from '../common/dom.js';

const versionTag = document.getElementById('version');

versionTag.textContent = runtime.getManifest().version;

function LinkGroup() {

  return (
    <Fragment>
      <ButtonLink icon="feather-star-empty" label="I love it" href={extensionUrl} />
      <ButtonLink icon="feather-help-circle" label="Privacy policy" href="https://kien5436.github.io/yate/privacy.html" />
      <ButtonLink icon="feather-github" label="Github" href="https://kien5436.github.io/yate/" />
    </Fragment>
  );
}

render(<LinkGroup />, document.getElementById('footer'));
