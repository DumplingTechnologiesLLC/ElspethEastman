import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import DangerButton from '@Components/Buttons/DangerButton';
import PrimaryButton from '@Components/Buttons/PrimaryButton';
import styled, { css } from 'styled-components';
import ContentParagraph from '@Components/Text/ContentParagraph';
import { ReactComponent as ExternalLink } from '@Assets/svg/ExternalLink.svg';
import { formatCredit } from '.';

const LineContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: .25em;
  height: 40px;
`;

export const ExperienceLine = styled(ContentParagraph)`
  ${({ theme }) => css`
    ${theme.text.mediumContentText};
    display: inline-block;
    text-decoration: none;
    svg {
      height: 1em;
    }
    fill: ${theme.flavors.baseTextColor};
  `}
`;
const miniButtonCss = css`
  display: inline;
  white-space: nowrap;
  width: auto;
  margin-right: .25em;
`;
export const DeleteButton = styled(DangerButton)`
  ${miniButtonCss}
`;

export const EditButton = styled(PrimaryButton)`
  ${miniButtonCss}
`;

const Experience = ({ onDelete, onEdit, experience }) => (
  <LineContainer>
    <DeleteButton onClick={onDelete}>
      <FontAwesomeIcon icon={faTrash} />
    </DeleteButton>
    <EditButton onClick={onEdit}>
      <FontAwesomeIcon icon={faEdit} />
    </EditButton>
    <ExperienceLine
      as={experience?.link ? 'a' : 'p'}
      href={experience?.link ? experience.link : undefined}
      target={experience?.link ? '_blank' : undefined}
      rel="noreferrer"
    >
      {formatCredit(experience)}
      {experience?.link ? <ExternalLink /> : ''}
    </ExperienceLine>
  </LineContainer>
);

Experience.propTypes = {
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  experience: PropTypes.shape({
    link: PropTypes.string,
    year: PropTypes.string,

  }),
};
export default Experience;
