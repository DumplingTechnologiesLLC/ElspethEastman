import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import ColoredText from '../components/Text/ColoredText';
import SectionTitle from '../components/Text/SectionTitle';
import SectionTitleUnderText from '../components/Text/SectionTitleUnderText';
import BackgroundButton from '../components/Buttons/BackgroundButton';
import FormInput from '../components/Form/FormInput';
import StyledForm from '../components/Form/StyledForm';

const ContactMeContainer = styled.div`
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

const ContactMeBackdrop = styled.div`
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
const ContactMeModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;
const ModalTitle = styled(SectionTitle)`
  margin-top: 0%;
  &::after {
    background-color: transparent;
  }
`;
const ContactMeModal = styled.div`
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

export const ContactMe = ({ showForm, setContactMeVisibility }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <ContactMeContainer show={showForm}>
      <ContactMeBackdrop onClick={() => setContactMeVisibility(false)} show={showForm} />
      <ContactMeModal show={showForm}>
        <ContactMeModalHeader>
          <ModalTitle>
            Contact
            {' '}
            <ColoredText flavor="pink">Me</ColoredText>
            <br />
            <SectionTitleUnderText>Let&apos;s get to know one another!</SectionTitleUnderText>
          </ModalTitle>
          <ModalButton onClick={() => setContactMeVisibility(false)}>
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </ModalButton>
        </ContactMeModalHeader>
        <StyledForm>
          <FormInput name="Name" label="Your Name (Required)" type="text" setValue={setName} value={name} />
          <FormInput name="Email" label="Your Email (Required)" type="email" setValue={setEmail} value={email} />
        </StyledForm>
      </ContactMeModal>
    </ContactMeContainer>
  );
};

ContactMe.propTypes = {
  showForm: PropTypes.bool.isRequired,
  setContactMeVisibility: PropTypes.func.isRequired,
};

export default ContactMe;
