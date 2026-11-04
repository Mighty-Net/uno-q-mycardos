import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import type {
  ChangeEvent,
  CSSProperties,
  FocusEvent,
  KeyboardEvent,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react';
import { animated, useSpring } from '@react-spring/web';
import styled from 'styled-components';

type ThemeMode = 'dark' | 'light' | string;

export type TextAreaRef = HTMLTextAreaElement & {
  showHint: () => void;
  hideHint: () => void;
  setError: (status: boolean) => void;
};

type TextAreaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  | 'children'
  | 'onBlur'
  | 'onChange'
  | 'onFocus'
  | 'onInput'
  | 'onKeyDown'
  | 'style'
  | 'value'
> & {
  hintMsg?: ReactNode;
  pattern?: string;
  style?: CSSProperties;
  textStyle?: CSSProperties;
  themeMode?: ThemeMode;
  type?: string;
  value?: TextareaHTMLAttributes<HTMLTextAreaElement>['value'];
  onBlur?: (event: FocusEvent<HTMLTextAreaElement>) => void;
  onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onEnter?: (value: string, event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onFocus?: (event: FocusEvent<HTMLTextAreaElement>) => void;
  onInput?: (
    value: string,
    target: HTMLTextAreaElement,
    event: ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
};

const Input = styled.textarea<{ $themeMode: ThemeMode }>`
  height: 150px;
  resize: none;
  overflow: auto;
  width: 100%;
  min-width: 110px;
  background-color: ${(props) => (props.$themeMode === 'dark' ? '#222e33' : '#fff')};
  border-radius: 6px;
  font-family: 'Noto Sans TC', sans-serif;
  font-weight: 300;
  padding: 2px 10px;
  border: 2px solid #dce5f0;
  
  box-shadow:
  0 2px 6px rgba(30, 58, 95, 0.06),
  0 1px 3px rgba(30, 58, 95, 0.04);

  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease;

  &:focus {
    outline: none;
    border-color: #43a0b0;

    box-shadow:
      0 0 0 3px rgba(67, 160, 176, 0.12),
      0 2px 8px rgba(67, 160, 176, 0.15);
  }

  &.error {
    border-color: #ef4444;

    box-shadow:
      0 0 0 3px rgba(239, 68, 68, 0.10),
      0 2px 8px rgba(239, 68, 68, 0.12);
  }

  &.error:focus {
    border-color: #dc2626;

    box-shadow:
      0 0 0 3px rgba(220, 38, 38, 0.16),
      0 2px 8px rgba(220, 38, 38, 0.18);
  }
`;

const ErrorView = styled.div`
  position: absolute;
  width: fit-content;
  background-color: #222;
  padding: 0 10px;
  height: 30px;
  top: 32px;
  right: 7px;
  border-radius: 4px;
  color: #fff;
  -webkit-box-shadow: 2px 2px 4px -2px #fff;
  box-shadow: 2px 2px 4px -2px #fff;
  font-size: 16px;

  &:after {
    content: '';
    border-top: 6px solid transparent;
    position: absolute;
    border-bottom: 6px solid #222;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    left: 1px;
    top: -11px;
  }
`;

const AnimatedErrorView = animated(ErrorView);

const TextArea = forwardRef<TextAreaRef, TextAreaProps>(
  (
    {
      className = '',
      hintMsg,
      maxLength,
      name,
      onBlur,
      onChange,
      onEnter,
      onFocus,
      onInput,
      onKeyDown,
      pattern,
      placeholder,
      readOnly = false,
      style,
      textStyle,
      themeMode = 'light',
      type: _type,
      value = '',
      ...props
    },
    ref,
  ) => {
    const [hintVisible, setHintVisible] = React.useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const animatedStyles = useSpring({
      opacity: hintVisible ? 1 : 0,
      config: {
        duration: 100,
      },
    });

    const showHint = () => {
      setHintVisible(true);
    };

    const hideHint = () => {
      setHintVisible(false);
    };

    const setError = (status: boolean) => {
      inputRef.current?.classList.toggle('error', status);
    };

    useImperativeHandle(
      ref,
      () => {
        return Object.assign(inputRef.current!, {
          showHint,
          hideHint,
          setError,
        });
      },
      [],
    );

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      const target = event.currentTarget;

      if (pattern && !new RegExp(pattern).test(target.value)) {
        return;
      }

      onChange?.(event);
      onInput?.(target.value, target, event);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
      onKeyDown?.(event);

      if (!event.defaultPrevented && event.key === 'Enter') {
        onEnter?.(event.currentTarget.value, event);
      }
    };

    return (
      <div style={{ position: 'relative', ...style }}>
        <Input
          {...props}
          ref={inputRef}
          $themeMode={themeMode}
          className={`fieldValue ${className}`}
          style={textStyle}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          name={name}
          readOnly={readOnly}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={(event) => {
            hideHint();
            onFocus?.(event);
          }}
          onBlur={(event) => {
            onBlur?.(event);
          }}
        />
        {hintMsg && hintVisible ? (
          <AnimatedErrorView style={animatedStyles} className="text-sm flex items-center">
            {hintMsg}
          </AnimatedErrorView>
        ) : null}
      </div>
    );
  },
);

TextArea.displayName = 'TextArea';

export default TextArea;
