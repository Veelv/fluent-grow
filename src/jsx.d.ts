/**
 * @fileoverview TypeScript type declarations for Fluent Grow intrinsic elements
 * 
 * This file provides type declarations for using Fluent Grow with React,
 * allowing custom components to be used in JSX with full type checking
 * and autocomplete support in the editor.
 * 
 * @author Veelv
 * @license MIT
 */

/**
 * JSX namespace that extends the default interfaces to include Fluent Grow components
 * 
 * This declaration allows the use of Fluent Grow Web Components
 * directly in React/JSX code with proper TypeScript typing.
 */
declare namespace JSX {
  /**
   * Interface that defines the intrinsic elements available in JSX
   * 
   * Each element is mapped to its respective HTML interfaces
   * with appropriate attributes and properties.
   */
  interface IntrinsicElements {
    'fluent-button': React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
    'fluent-input': React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    'fluent-select': React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
    'fluent-textarea': React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
    'fluent-checkbox': React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    'fluent-radio': React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    'fluent-switch': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'fluent-slider': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'fluent-progress': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'fluent-spinner': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'fluent-badge': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'fluent-chip': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'fluent-avatar': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'fluent-avatar-group': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'fluent-tooltip': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'fluent-popover': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'fluent-dropdown': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'fluent-menu': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'fluent-tabs': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'fluent-accordion': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'fluent-modal': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'fluent-notification': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'fluent-toast': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'fluent-card': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'fluent-breadcrumb': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'fluent-pagination': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'fluent-skeleton': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'fluent-label': React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
    'fluent-text': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'fluent-title': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'fluent-form': React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
    'fluent-form-message': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'fluent-datepicker': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'fluent-autocomplete': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'fluent-table': React.DetailedHTMLProps<React.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
    'fluent-stepper': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  }
}

export {};