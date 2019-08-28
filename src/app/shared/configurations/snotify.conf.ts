/**
 * Snotify default configuration object
 * @type {SnotifyDefaults}
 */
import {SnotifyPosition} from 'ng-snotify';

export const NotifierConfig = {
  global: {
    newOnTop: true,
    maxOnScreen: 8,
    maxAtPosition: 8,
    filterDuplicates: false
  },
  toast: {
    type: 'simple',
    showProgressBar: false,
    timeout: 3000,
    closeOnClick: true,
    pauseOnHover: true,
    bodyMaxLength: 150,
    titleMaxLength: 22,
    backdrop: -1,
    icon: null,
    iconClass: null,
    html: null,
    position: SnotifyPosition.rightBottom,
    animation: {enter: 'fadeIn', exit: 'fadeOut', time: 400}
  },
  type: {
    ['prompt']: {
      timeout: 0,
      closeOnClick: false,
      buttons: [
        {text: 'Ok', action: null, bold: true},
        {text: 'Cancel', action: null, bold: false},
      ],
      placeholder: 'Enter answer here...',
      type: 'prompt',
    },
    ['confirm']: {
      timeout: 0,
      closeOnClick: false,
      buttons: [
        {text: 'Ok', action: null, bold: true},
        {text: 'Cancel', action: null, bold: false},
      ],
      type: 'confirm',
    },
    ['simple']: {
      type: 'simple',
      icon: null
    },
    ['success']: {
      type: 'success',
      icon: null
    },
    ['error']: {
      type: 'error'
    },
    ['warning']: {
      type: 'warning'
    },
    ['info']: {
      type: 'info'
    },
    ['async']: {
      pauseOnHover: false,
      closeOnClick: false,
      timeout: 0,
      showProgressBar: false,
      type: 'async'
    }
  }
};
