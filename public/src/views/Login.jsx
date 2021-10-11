import { HTTP_BAD_SUBMISSION, HTTP_SUCCESS, performAPIAction } from '@App/api/utils';
import PrimaryButton from '@Components/Buttons/PrimaryButton';
import CMSNavbar from '@Components/CMS/CMSNavbar';
import FormInput from '@Components/Form/FormInput';
import StyledForm from '@Components/Form/StyledForm';
import { ToastContext } from '@Components/ToastManager';
import { useContext, useState } from 'react';
import styled, { css } from 'styled-components';
import API from '@App/api';
import PropTypes from 'prop-types';
import HeroImage from '@Assets/hero2.webp';
import { StyledCMSContent } from './CMS';

const Layout = styled(StyledCMSContent)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
`;

const Card = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.flavors.background};
    border-radius: 5px;
    box-shadow: 0px 0px 2px 2px ${theme.flavors.modalShadowBlue};
    padding: 1em;
    min-width: 400px;
  `}
`;
const LoginForm = styled(StyledForm)`
  align-items: center;
`;

const DEFAULT_ERROR_STATE = {
  username: '',
  password: '',
  form: '',
};

const DEFAULT_STATE = {
  username: '',
  password: '',
};

const imageDimension = 250;
const LoginImage = styled.img`
  width: ${imageDimension}px;
  height: ${imageDimension}px;
`;

const Login = ({ onLogin }) => {
  const [loginInformation, setLoginInformation] = useState(DEFAULT_STATE);
  const [errors, setErrors] = useState(DEFAULT_ERROR_STATE);
  const [inFlight, setInFlight] = useState(false);
  const { toast, flavors } = useContext(ToastContext);
  const badLoginToast = () => {
    toast(
      'Bad login',
      'Please review your login information',
      flavors.error,
    );
  };
  const handleLogin = async () => {
    if (!loginInformation.username) {
      setErrors({
        ...errors,
        username: 'Username is required',
        form: '',
      });
      badLoginToast();
      return;
    }
    if (!loginInformation.password) {
      setErrors({
        ...errors,
        password: 'Password is required',
        form: '',
      });
      badLoginToast();
      return;
    }
    setInFlight(true);
    const response = await performAPIAction(API.login, loginInformation, null, toast);
    setInFlight(false);

    if (response.status === HTTP_SUCCESS) {
      toast(
        'Good login',
        'Now logging you in',
        flavors.success,
      );
      setTimeout(() => {
        onLogin(response.data.token);
      }, 1000);
    } else if (response.status === HTTP_BAD_SUBMISSION) {
      badLoginToast();
      setErrors({
        ...errors,
        form: response.data.detail,
      });
    }
  };
  return (
    <>
      <CMSNavbar />
      <Layout>
        <Card>
          <LoginForm>
            <LoginImage src={HeroImage} alt="A photo of Elspeth" />
            <FormInput
              type="text"
              label="Username"
              name="username"
              onChange={(value) => {
                setLoginInformation({ ...loginInformation, username: value });
                setErrors({ ...errors, username: '' });
              }}
              hasErrors={errors.username}
              errorMessage={errors.username}
              value={loginInformation.username}
            />
            <FormInput
              type="password"
              label="Password"
              name="password"
              onChange={(value) => {
                setLoginInformation({ ...loginInformation, password: value });
                setErrors({ ...errors, password: '' });
              }}
              hasErrors={errors.password}
              errorMessage={errors.password}
              value={loginInformation.password}
            />
            <PrimaryButton onClick={handleLogin} type="button" disabled={inFlight}>
              Login
            </PrimaryButton>
          </LoginForm>
        </Card>
      </Layout>
    </>
  );
};

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default Login;
