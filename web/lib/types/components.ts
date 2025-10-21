export interface BaseComponent {
  children?: React.ReactNode;
  className?: string;
}

export interface FormElementProps extends BaseComponent {
  disabled?: boolean;
  id?: string;
  name?: string;
}

export interface ButtonProps extends BaseComponent {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

export interface InputProps extends FormElementProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface LabelProps extends BaseComponent {
  htmlFor?: string;
}

export interface CheckboxProps extends FormElementProps {
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface ModalProps extends BaseComponent {
  isOpen: boolean;
  onClose: () => void;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  title?: string;
}

export interface NavigationProps extends BaseComponent {
  token?: string;
  name?: string;
}

export interface SidebarProps extends BaseComponent {
  isOpen?: boolean;
  onToggle?: () => void;
}

export interface PlayerNavigationProps extends BaseComponent {
  token: string;
  name?: string;
}

export interface ScriptBoardProps extends BaseComponent {
  menuState?: boolean;
  onMenuToggle?: () => void;
}