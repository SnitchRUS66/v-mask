
import masker from './masker';
import tokens from './tokens';

const preDefined = new Map();
preDefined.set('credit-card', '#### - #### - #### - ####');
preDefined.set('date', '##/##/####');
preDefined.set('date-with-time', '##/##/#### ##:##');
preDefined.set('phone', '(###) ### - ####');
preDefined.set('social', '###-##-####');
preDefined.set('time', '##:##');
preDefined.set('time-with-seconds', '##:##:##');
preDefined.set('code-postal', 'A#A #A#');

const defaultDelimiters = /[-!$%^&*()_+|~=`{}[\]:";'<>?,./\\ ]/;

const unmaskText = (text: string): string => {
  return text ? String(text).replace(
    new RegExp(defaultDelimiters, 'g'), '') : text;
};

function event(name: string) {
  const evt = document.createEvent('Event');
  evt.initEvent(name, true, true);
  return evt;
}

export const mask = {
  bind(el: any, binding: any, vnode: any) {
    // console.log ('bind');
    let config = binding.value || {};

    if (Array.isArray(config) || typeof config === 'string') {
      config = {
        masked: true,
        mask: config,
        unmaskedVar: null,
        tokens
      };
    }
    const m = preDefined.get(config.mask);
    config.mask = m ||  config.mask || '';

    if (el.tagName.toLocaleUpperCase() !== 'INPUT') {
      const els = el.getElementsByTagName('input');
      if (els.length !== 1) {
        throw new Error('v-mask directive requires 1 input, found '
        + els.length);
      } else {
        el = els[0];
      }
    }

    el.oninput = function(evt: any) {
      if (!evt.isTrusted) { return; } // avoid infinite loop
      // by default, keep cursor at same position as before the mask
      let position = el.selectionEnd;
      // save the character just inserted
      const digit = el.value[position - 1];
      el.value = masker(el.value, config.mask, config.masked, config.tokens);
      // if the digit was changed, increment position until find the digit again
      while (position < el.value.length &&
            el.value.charAt(position - 1) !== digit) {
        position++;
      }
      if (el === document.activeElement) {
        el.setSelectionRange(position, position);
        setTimeout(function() {
          el.setSelectionRange(position, position);
        }, 0);
      }
      if (config.unmaskedVar) {
        const uv = unmaskText(el.value);
        vnode.context[config.unmaskedVar] = uv;
      }
      el.dispatchEvent(event('input'));
    };

    const newDisplay = masker(el.value,
                              config.mask,
                              config.masked,
                              config.tokens);
    if (newDisplay !== el.value) {
      el.value = newDisplay;
      if (config.unmaskedVar) {
        const uv = unmaskText(el.value);
        vnode.context[config.unmaskedVar] = uv;
      }
      el.dispatchEvent(event('input'));
    }
  }
};
