import styled, { css } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import PropTypes from 'prop-types';
import SectionTitle from '../Text/SectionTitle';
import BackgroundButton from '../Buttons/BackgroundButton';

const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  z-index: 9999;
  right: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  ${(props) => css`
    ${props.show ? css`pointer-events: all;` : css`pointer-events: none;`};
  `}
`;

const ModalBackdrop = styled.div`
  ${(props) => css`
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      opacity: 0;
      z-index: 1;
      background-color: ${props.theme.flavors.bgBlue};
      ${props.theme.mixins.transition(['opacity', props.theme.modalTiming, 'ease-out'])};
      ${props.show ? css`opacity: 1; pointer-events: all;` : 'pointer-events: none;'};
  `}
`;
const ModalModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;
const ModalTitle = styled(SectionTitle)`
  margin-top: 0%;
  &::after {
    background-color: transparent;
  }
`;
const ModalModal = styled.div`
  ${(props) => css`
    opacity: 0;
    padding: 2em;
    min-height: 60%;
    min-width: 400px;
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
`;

export const Modal = ({
  showModal, setShowModal, title, content,
}) => (
  <ModalContainer show={showModal}>
    <ModalBackdrop onClick={() => setShowModal(false)} show={showModal} />
    <ModalModal show={showModal}>
      <ModalModalHeader>
        <ModalTitle>
          {title}
        </ModalTitle>
        <ModalButton onClick={() => setShowModal(false)}>
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </ModalButton>
      </ModalModalHeader>
      {content}
    </ModalModal>
  </ModalContainer>
);

Modal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  setShowModal: PropTypes.func.isRequired,
  title: PropTypes.node.isRequired,
  content: PropTypes.node.isRequired,
};

export default Modal;
