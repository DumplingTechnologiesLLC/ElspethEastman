import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import ColoredText from '@Components/Text/ColoredText';
import SectionTitleUnderText from '@Components/Text/SectionTitleUnderText';
import FormInput, { FormTextArea } from '@Components/Form/FormInput';
import StyledForm from '@Components/Form/StyledForm';
import PrimaryButton from '@Components/Buttons/PrimaryButton';
import Modal from '@Components/Modal/Modal';
import { ToastContext } from '@Components/ToastManager';
import API from '@App/api';

export const ContactMe = ({ showForm, setContactMeVisibility }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [inFlight, setInFlight] = useState(false);
  const { toast, flavors } = useContext(ToastContext);
  const [initialLoad, setInitialLoad] = useState(true);

  const initialErrorState = {
    name: '',
    email: '',
    message: '',
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
    setInitialLoad(true);
    setName('');
    setEmail('');
    setMessage('');
    setErrors(initialErrorState);
    setContactMeVisibility(false);
  };

  useEffect(() => {
    setInitialLoad(false);
  }, [initialLoad]);

  /* eslint-disable-next-line consistent-return */
  const submitForm = async (event) => {
    event.preventDefault();
    if (!name || !email) {
      return setErrors({
        name: name ? '' : 'Name is required',
        email: email ? '' : 'Email is required',
        message: message ? '' : 'Message is required',
      });
    }
    setInFlight(true);
    try {
      const response = await API.submitContactMe({
        name,
        email,
        message,
      });

      if (response.status === 200) {
        toast(
          'Success!',
          'Submitted form. I\'ll be in touch soon!',
          flavors.success,
        );
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setErrors({
          ...initialErrorState,
          ...response.data,
        });
        toast(
          'Error',
          'Failed to submit form. Please try again later.',
          flavors.error,
        );
      }
    } catch (error) {
      toast(
        'Error',
        'Failed to submit form. Please try again later.',
        flavors.error,
      );
    } finally {
      setInFlight(false);
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
                autoFocus={initialLoad}
                hasError={Boolean(errors.name)}
                errorMessage={errors.name}
                name="Name"
                label="Your Name (Required)"
                type="text"
                onChange={setNameAndClearErrors}
                value={name}
              />
              <FormInput
                hasError={Boolean(errors.email)}
                errorMessage={errors.email}
                name="Email"
                label="Your Email (Required)"
                type="email"
                onChange={setEmailAndClearErrors}
                value={email}
              />
              <FormTextArea
                hasError={Boolean(errors.message)}
                errorMessage={errors.message}
                name="Message (Required)"
                label="Your Message"
                onChange={setMessage}
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
