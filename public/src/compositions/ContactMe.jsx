import React, { useState } from 'react';
import PropTypes from 'prop-types';

import ColoredText from '../components/Text/ColoredText';

import SectionTitleUnderText from '../components/Text/SectionTitleUnderText';
import API from '../api';
import FormInput, { FormTextArea } from '../components/Form/FormInput';
import StyledForm from '../components/Form/StyledForm';
import PrimaryButton from '../components/Buttons/PrimaryButton';
import Modal from '../components/Modal/Modal';

export const ContactMe = ({ showForm, setContactMeVisibility }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const [errors, setErrors] = useState({
    name: '',
    email: '',
  });

  /* eslint-disable-next-line consistent-return */
  const submitForm = async (event) => {
    event.preventDefault();
    if (!name || !email) {
      return setErrors({
        name: name ? '' : 'Name is required',
        email: email ? '' : 'Email is required',
      });
    }
    const response = await API.submitContactMe({
      name,
      email,
      message,
    });
    if (response.ok) {
      // TODO: Toast
      setName('');
      setEmail('');
      setMessage('');
    } else {
      // TODO: Toast
    }
  };

  return (
    <Modal
      showModal={showForm}
      setShowModal={setContactMeVisibility}
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
        <StyledForm>
          <FormInput
            hasError={Boolean(errors.name)}
            errorMessage={errors.name}
            name="Name"
            label="Your Name (Required)"
            type="text"
            setValue={setName}
            value={name}
          />
          <FormInput
            hasError={Boolean(errors.email)}
            errorMessage={errors.email}
            name="Email"
            label="Your Email (Required)"
            type="email"
            setValue={setEmail}
            value={email}
          />
          <FormTextArea
            name="Message"
            label="Your Message"
            setValue={setMessage}
            value={message}
          />
          <PrimaryButton onClick={(e) => submitForm(e)}>Get in touch</PrimaryButton>
        </StyledForm>
      )}
    />
  );
};

ContactMe.propTypes = {
  showForm: PropTypes.bool.isRequired,
  setContactMeVisibility: PropTypes.func.isRequired,
};

export default ContactMe;
