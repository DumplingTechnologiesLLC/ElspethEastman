import styled, { css } from 'styled-components';
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { ReactComponent as Close } from '@Assets/svg/CloseX.svg';
import SectionTitle from '@Components/Text/SectionTitle';
import BackgroundButton from '@Components/Buttons/BackgroundButton';
import uuid from '@App/utils';

const ModalContainer = styled.div`
  position: fixed;
 
  display: flex;
  justify-content: center;
  align-items: center;
  ${(props) => css`
    z-index: ${props.theme.stacking.modal};
    ${props.theme.fixedOrAbsoluteFullCoverage}
    ${props.show ? css`pointer-events: all;` : css`pointer-events: none;`};
  `}
`;

const ModalBackdrop = styled.div`
  ${(props) => css`
      position: fixed;
      ${props.theme.fixedOrAbsoluteFullCoverage}
      opacity: 0;
      z-index: 1;
      background-color: ${props.theme.flavors.bgBlue};
      ${props.theme.mixins.transition(['opacity', props.theme.modalTiming, 'ease-out'])};
      ${props.show ? css`opacity: 1; pointer-events: all;` : 'pointer-events: none;'};
  `}
`;
const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;
const ModalTitle = styled(SectionTitle)`
  margin-top: 0%;
  &::after {
    background-color: transparent;
  }
`;
const ModalBody = styled.div`
  ${(props) => css`
    opacity: 0;
    padding: 2em;
    min-width: 100px;
    margin: 0 ${props.theme.spacing.md};
    max-width: 600px;
    width: 100%;
    border-radius: 5px;
    ${props.theme.mixins.boxShadow(props.theme.flavors.modalShadowBlue)};
    background-color: ${props.theme.flavors.background};
    z-index: 1;
    transform: translateY(-200px);
    ${props.theme.mixins.transition(
    ['opacity', props.theme.modalTiming, 'ease-out'],
    ['transform', props.theme.modalTiming, 'ease-out'],
  )};
    ${props.show ? css` 
      opacity: 1;
      transform: translateY(0);
      pointer-events: all;
    ` : 'pointer-events: none;'}
  `}
`;
const ModalButton = styled(BackgroundButton)`
  height: 35px;
  width: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  & svg {
    min-width: 20px;
    min-height: 20px;
  }
`;

export const Modal = ({
  showModal, setShowModal, title, content,
}) => {
  /* eslint-disable no-unused-vars */

  const modal = useRef(null);
  useEffect(() => {
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const captureFocus = (e) => {
      const focusableContent = modal.current.querySelectorAll(focusableElements);
      const firstFocusableElement = focusableContent[0];
      const lastFocusableElement = focusableContent[focusableContent.length - 1];
      const isTabPressed = e.key === 'Tab' || e.keyCode === 9;

      if (isTabPressed) {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus(); // add focus for the last focusable element
            e.preventDefault();
          }
        } else if (document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus(); // add focus for the first focusable element
          e.preventDefault();
        }
      }
    };
    document.addEventListener('keydown', captureFocus);

    return () => {
      document.removeEventListener('keydown', captureFocus);
    };
  });
  const [_uid, ...rest] = useState(uuid('modal'));
  return (
    <ModalContainer show={showModal}>
      <ModalBackdrop onClick={() => setShowModal(false)} show={showModal} />
      <ModalBody
        show={showModal}
        role="dialog"
        aria-labelledby={`${_uid}modalDialogTitle`}
        ref={modal}
      >
        <ModalHeader>
          <ModalTitle id={`${_uid}modalDialogTitle`}>
            {title}
          </ModalTitle>
          <ModalButton tabIndex={showModal ? '0' : '-1'} onClick={() => setShowModal(false)} aria-label="Close Modal">
            <Close />
          </ModalButton>
        </ModalHeader>
        {content}
      </ModalBody>
    </ModalContainer>
  );
};

Modal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  setShowModal: PropTypes.func.isRequired,
  title: PropTypes.node.isRequired,
  content: PropTypes.node.isRequired,
};

export default Modal;
