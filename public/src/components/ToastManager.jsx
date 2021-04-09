import React, {
  createContext, useMemo, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import ContentParagraph from './Text/ContentParagraph';
import { ReactComponent as Warning } from '../assets/svg/warning.svg';
import { ReactComponent as Error } from '../assets/svg/error.svg';
import { ReactComponent as Success } from '../assets/svg/success.svg';
import { ReactComponent as Info } from '../assets/svg/info.svg';

const StyledToast = styled.div`
  ${({ theme, time }) => css`
    ${theme.toasts.toast};
    animation: ${theme.animations.styledtoast} .3s ease-out, ${theme.animations.cancelled} ${time / 1000}s ease-out .3s;
  `}
`;

const ToastEndCap = styled.div`
  ${(props) => css`
    ${props.theme.toasts.toastCap};
    background-color: ${props.theme.flavors.toasts[props.flavor]};
  `}
`;
const ToastTitle = styled.p`
  margin-top: 0;
  ${(props) => css`
    margin-bottom: ${props.theme.spacing.xs};
    ${props.theme.text.smallTitleFontSize};
    ${props.theme.text.baseContentFont};
    font-weight: bold;
  `}
`;
const ToastTextContent = styled.div`
  ${(props) => css`
    padding: 0 ${props.theme.spacing.md};
    flex: 1;
  `}
`;
const ToastTextIconContainer = styled.div`
  ${(props) => css`
    & svg {
      height: 30px;
      fill: ${props.theme.flavors.toasts[props.flavor]};
    }
    width: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
  `}
`;

const ToastRack = styled.div`
  position: fixed;
  padding-top: 8em;
  right: 0;
  top: 0;
  bottom: 0;
  pointer-events: none;
  width: 300px;
  display: flex;
  flex-direction: column;
  ${(props) => css`
    padding-right: ${props.theme.spacing.lg};
    z-index: ${props.theme.stacking.toasts};
    ${StyledToast} + ${StyledToast} {
      margin-top: ${props.theme.spacing.md};
    }
  `}
`;
const ToastContent = styled(ContentParagraph)`
  margin: 0;
`;

const Toast = ({
  flavor, title, content, time,
}) => {
  const iconMapping = {
    info: <Info />,
    error: <Error />,
    warning: <Warning />,
    success: <Success />,
  };
  return (
    <StyledToast
      aria-live={flavor === 'info' ? 'polite' : 'assertive'}
      role="alert"
      time={time}
    >
      <ToastEndCap flavor={flavor} />
      <ToastTextIconContainer flavor={flavor}>
        {iconMapping[flavor]}
      </ToastTextIconContainer>
      <ToastTextContent>
        {title ? (<ToastTitle>{title}</ToastTitle>) : ''}
        <ToastContent>{content}</ToastContent>
      </ToastTextContent>
    </StyledToast>
  );
};

Toast.propTypes = {
  flavor: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  time: PropTypes.number.isRequired,
};

export const ToastContext = createContext();
export const ToastManager = ({ children }) => {
  const toasts = useRef([]);
  /**
   * We don't care about forceRerender, we just need to toggle it to force rerender
   */
  /* eslint-disable no-unused-vars */
  const [forceRerender, setForceRerender] = useState(-1);

  const defaultTime = 6000;

  /* eslint-disable no-underscore-dangle */
  const _toast = (title, content, flavor, time) => {
    toasts.current = [...toasts.current, {
      title,
      content,
      flavor,
      time: time ?? defaultTime,
      id: Date.now(),
    }];

    setForceRerender(toasts.current.length);
    setTimeout(() => {
      toasts.current.splice(0, 1);
      setForceRerender(toasts.current.length);
    }, time ?? defaultTime);
  };

  const contextData = useMemo(() => ({
    flavors: {
      info: 'info',
      warning: 'warning',
      success: 'success',
      error: 'error',
    },
    toast: _toast,
  /**
   * Disabled because we don't want this to rerender despite the fact that toast is updating every time internally
   * due to the ticking id
   */
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }), []);
  return (
    <>
      <ToastContext.Provider value={contextData}>
        <div key="staticStringToPreventRe">
          {children}
        </div>
      </ToastContext.Provider>
      <ToastRack>
        {toasts.current.map((toast) => (
          <Toast
            key={toast.id}
            flavor={toast.flavor}
            title={toast.title}
            content={toast.content}
            time={toast.time}
          />
        ))}
      </ToastRack>
    </>
  );
};

ToastManager.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ToastManager;
