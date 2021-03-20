import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';

import ColoredText from '../components/Text/ColoredText';

import SectionTitleUnderText from '../components/Text/SectionTitleUnderText';
import API from '../api';
import FormInput, { FormTextArea } from '../components/Form/FormInput';
import StyledForm from '../components/Form/StyledForm';
import PrimaryButton from '../components/Buttons/PrimaryButton';
import Modal from '../components/Modal/Modal';
import { ToastContext } from '../components/ToastManager';

export const ContactMe = ({ showForm, setContactMeVisibility }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [inFlight, setInFlight] = useState(false);
  const { toast, flavors } = useContext(ToastContext);

  const initialErrorState = {
    name: '',
    email: '',
  };
  const [errors, setErrors] = useState(initialErrorState);

  const setNameAndClearErrors = (value) => {
    setName(value);
    setErrors({ ...errors, name: '' });
  };

  const setEmailAndClearErrors = (value) => {
    setEmail(value);
    setErrors({ ...errors, email: '' });
  };

  const closeAndClear = () => {
    setName('');
    setEmail('');
    setMessage('');
    setErrors(initialErrorState);
    setContactMeVisibility(false);
  };

  /* eslint-disable-next-line consistent-return */
  const submitForm = async (event) => {
    event.preventDefault();
    if (!name || !email) {
      return setErrors({
        name: name ? '' : 'Name is required',
        email: email ? '' : 'Email is required',
      });
    }
    setInFlight(true);
    const response = await API.submitContactMe({
      name,
      email,
      message,
    });
    setInFlight(false);
    if (response.ok) {
      toast(
        'Success!',
        'Submitted form. I\'ll be in touch soon!',
        flavors.success,
      );
      setName('');
      setEmail('');
      setMessage('');
    } else {
      toast(
        'Error',
        'Failed to submit form. Please try again later.',
        flavors.error,
      );
      // TODO: Toast
    }
  };

  return (
    <Modal
      showModal={showForm}
      setShowModal={closeAndClear}
      title={(
        <div>
          Contact
          {' '}
          <ColoredText flavor="pink">Me</ColoredText>
          <br />
          <SectionTitleUnderText>Let&apos;s get to know one another!</SectionTitleUnderText>
        </div>
    )}
      content={(
        showForm
          ? (
            <StyledForm>
              <FormInput
                autoFocus
                hasError={Boolean(errors.name)}
                errorMessage={errors.name}
                name="Name"
                label="Your Name (Required)"
                type="text"
                setValue={setNameAndClearErrors}
                value={name}
              />
              <FormInput
                hasError={Boolean(errors.email)}
                errorMessage={errors.email}
                name="Email"
                label="Your Email (Required)"
                type="email"
                setValue={setEmailAndClearErrors}
                value={email}
              />
              <FormTextArea
                name="Message"
                label="Your Message"
                setValue={setMessage}
                value={message}
              />
              <PrimaryButton
                disabled={inFlight}
                ariaDisabled={inFlight}
                onClick={(e) => submitForm(e)}
              >
                Get in touch

              </PrimaryButton>
            </StyledForm>
          ) : ''
      )}
    />
  );
};

ContactMe.propTypes = {
  showForm: PropTypes.bool.isRequired,
  setContactMeVisibility: PropTypes.func.isRequired,
};

export default ContactMe;
