import routes from '@App/router/routes';
import { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { AuthContext } from '@App/Auth';

const PrivateRoute = ({ children, ...rest }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return (
    <Route
      /**
       * This is meant to be a very generic component. We don't want to enumerate all possible props.
       */
      /* eslint-disable-next-line react/jsx-props-no-spreading */
      {...rest}
      render={({ location }) => (isAuthenticated ? (
        children
      ) : (
        <Redirect
          to={{
            pathname: routes.login,
            state: { from: location },
          }}
        />
      ))}
    />
  );
};

PrivateRoute.propTypes = {
  children: PropTypes.node,
};

export default PrivateRoute;
