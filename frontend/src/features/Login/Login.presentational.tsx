import * as stylex from '@stylexjs/stylex';
import { Button, Field } from '../../ui/Primitives.presentational';
import { styles } from '../../ui/styles';
import Hero from '../../assets/hero2.webp';
import type { useLoginState } from './useLoginState';
const css = stylex.create({
  layout: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '0 50px',
    paddingRight: { default: 50, '@media (max-width: 760px)': 0 },
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 5,
    boxShadow: '0 0 2px 2px rgba(79,102,202,.36)',
    padding: '1em',
    minWidth: 400,
  },
  form: { alignItems: 'center' },
  image: { width: 250, height: 250 },
});
export function Login({
  username,
  password,
  submitting,
  change,
  login,
  errors,
}: ReturnType<typeof useLoginState>) {
  return (
    <div {...stylex.props(css.layout)}>
      <div {...stylex.props(css.card)}>
        <form {...stylex.props(styles.form, css.form)}>
          <img
            {...stylex.props(css.image)}
            src={Hero}
            alt="A photo of Elspeth"
          />
          <Field
            label="Username"
            name="username"
            value={username}
            onChange={(value) => change('username', value)}
            onEnter={() => void login()}
            error={errors.username}
          />
          <Field
            type="password"
            label="Password"
            name="password"
            value={password}
            onChange={(value) => change('password', value)}
            onEnter={() => void login()}
            error={errors.password}
          />
          <Button
            onClick={() => void login()}
            type="button"
            disabled={submitting}
          >
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}
