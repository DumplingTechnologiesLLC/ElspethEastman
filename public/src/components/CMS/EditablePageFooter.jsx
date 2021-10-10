import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, {
  useEffect, useState, useContext, useMemo,
} from 'react';
import CircularLoadingBar from '@Components/LandingPage/CircularLoadingBar';
import StyledFooter, {
  FooterContent, FooterTitle, FooterSubTitle,
} from '@Components/Layout/StyledFooter';
import {
  LoadingContainer,
  AffiliationsAndLinks,
  Affiliations,
  SocialMediaContainer,
  SocialMedia,
  SocialMediaIcon,
} from '@Components/LandingPage/PageFooter';
import { ToastContext } from '@Components/ToastManager';
import API from '@App/api';
import Instagram from '@Assets/svg/Instagram.svg';
import Soundcloud from '@Assets/svg/Soundcloud.svg';
import Twitter from '@Assets/svg/Twitter.svg';
import Youtube from '@Assets/svg/Youtube.svg';
import DisabledSectionContainer from '@Components/DisabledSectionContainer';
import styled from 'styled-components';
import PrimaryButton from '@Components/Buttons/PrimaryButton';
import { cloneDeep } from '@App/utils';
import Modal from '@Components/Modal/Modal';
import EditableAffiliation from './EditableAffiliation';

const EditableAffiliations = styled(Affiliations)`
  min-width: 400px;
`;

const DEFAULT_UNSAVED_ID = -1;

const DEFAULT_NEW_AFFILIATION_STATE = {
  id: DEFAULT_UNSAVED_ID,
  link: '',
  affiliation: '',
};

export const EditablePageFooter = () => {
  const [footerData, setFooterData] = useState({
    stats: [],
    affiliations: [],
  });
  const [affiliations, setAffiliations] = useState([]);
  const [cachedAffiliations, setCachedAffiliations] = useState([]);
  const [inFlight, setInFlight] = useState(false);
  const [inFlightAffiliations, setInFlightAffiliations] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const { toast, flavors } = useContext(ToastContext);
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [newAffiliation, setNewAffiliation] = useState(DEFAULT_NEW_AFFILIATION_STATE);

  const toastMap = {
    404: {
      flavor: flavors.error,
      title: 'Error',
      content: 'Affiliation no longer exists. Perhaps it was already deleted?',
    },
    400: {
      flavor: flavors.error,
      title: 'Error',
      content: 'There was a problem with your submission',
    },
    200: {
      flavor: flavors.success,
      title: 'Success',
      content: 'Action submitted successfully.',
    },
  };

  useEffect(() => {
    const errorState = {
      stats: [],
      affiliations: ['Failed to load...'],
    };
    const retrieveFooter = async () => {
      setInFlight(true);
      try {
        const response = await API.retrieveFooterData();
        setLoaded(true);
        setInFlight(false);
        setFooterData(response);
        setAffiliations(cloneDeep(response.affiliations));
        setCachedAffiliations(cloneDeep(response.affiliations));
      } catch (err) {
        setInFlight(false);
        setFooterData(errorState);
        setLoaded(true);
        toast(
          'Error',
          'Failed to load footer details',
          flavors.error,
        );
      }
    };
    retrieveFooter();
  /**
   * We don't care about this hook firing every time toast references change. Not important.
   */
  /* eslint-disable react-hooks/exhaustive-deps */
  }, []);

  const showStats = useMemo(() => {
    if (inFlight || !loaded) {
      return (<FontAwesomeIcon size="6x" icon={faSpinner} pulse />);
    }
    if (loaded && !footerData?.stats?.length) {
      return (<FooterContent>Failed to load stats.</FooterContent>);
    }
    return footerData.stats.map((stat) => (
      <CircularLoadingBar label={stat.label} value={stat.value} percent={stat.percent} key={stat.id} />
    ));
  }, [inFlight, loaded, footerData]);

  const updateAffiliation = (idx, key, value) => {
    const stateClone = cloneDeep(affiliations);
    stateClone[idx][key] = value;
    setAffiliations(stateClone);
  };

  const updateNewAffiliation = (key, value) => {
    setNewAffiliation({ ...newAffiliation, [key]: value });
  };

  const resetAffiliation = (idx) => {
    const stateClone = cloneDeep(affiliations);
    stateClone[idx] = cloneDeep(cachedAffiliations[idx]);
    setAffiliations(stateClone);
  };

  const submitAffiliation = async (affiliation, idx, successCallback = () => {}, errorCallback = () => {}) => {
    const affiliationToSubmit = cloneDeep(affiliation);
    const errorsClearedForAffiliation = cloneDeep(errors);
    delete errorsClearedForAffiliation[affiliation.id];
    setErrors(errorsClearedForAffiliation);
    setInFlightAffiliations([...inFlightAffiliations, affiliationToSubmit.id]);
    if (affiliationToSubmit.id < 0) {
      // sentinel value indicating an unsaved new affiliationToSubmit
      delete affiliationToSubmit.id;
    }
    let response;
    if (typeof affiliationToSubmit.id !== 'undefined') {
      response = await API.updateAffiliation({ ...affiliationToSubmit }, affiliationToSubmit.id);
    } else {
      response = await API.createAffiliation({ ...affiliationToSubmit });
    }
    setInFlightAffiliations(inFlightAffiliations.filter((aff) => aff.id !== affiliationToSubmit.id));
    if (response === null) {
      toast(
        'Error',
        'Network error',
        flavors.error,
      );
      return;
    }
    const { title, content, flavor } = toastMap[response.status];
    toast(
      title,
      content,
      flavor,
    );
    if (response.status === 400) {
      setErrors({ ...errors, [affiliationToSubmit.id ?? DEFAULT_UNSAVED_ID]: response.data });
      errorCallback();
    }
    if (response.status === 200) {
      successCallback();
      const updatedAffiliations = cloneDeep(affiliations);
      updatedAffiliations[idx] = response.data;
      setAffiliations(updatedAffiliations);
      setCachedAffiliations(cloneDeep(updatedAffiliations));
    }
  };

  const deleteAffiliation = async (index) => {
    /**
     * Disabled because I don't want to be implementing an entire alert modal for this one off project.
     * The basic JS alert is sufficient.
     */
    /* eslint-disable-next-line no-alert, no-restricted-globals */
    const confirmed = confirm('Are you sure you want to delete this affiliation?');
    if (confirmed) {
      const affiliationToBeDeleted = affiliations[index];
      setInFlightAffiliations([...inFlightAffiliations, affiliationToBeDeleted.id]);
      const response = await API.deleteAffiliation(affiliationToBeDeleted.id);
      setInFlightAffiliations(inFlightAffiliations.filter((id) => id !== affiliationToBeDeleted.id));
      if (response === null) {
        toast(
          'Error',
          'Network error',
          flavors.error,
        );
        return;
      }
      const { title, content, flavor } = toastMap[response.status];
      toast(
        title,
        content,
        flavor,
      );
      if (response.status === 200) {
        const newAffiliations = cloneDeep(affiliations);
        newAffiliations.splice(index, 1);
        setAffiliations(newAffiliations);
        setCachedAffiliations(cloneDeep(newAffiliations));
      }
    }
  };

  const addAffiliation = () => {
    setNewAffiliation(DEFAULT_NEW_AFFILIATION_STATE);
    setShowModal(true);
  };

  const showAffiliations = () => {
    if (inFlight || !loaded) {
      return (<FontAwesomeIcon size="lg" icon={faSpinner} pulse />);
    }
    return affiliations.map((affiliation, idx) => (
      <EditableAffiliation
        onTextChange={(value) => updateAffiliation(idx, 'affiliation', value)}
        onLinkChange={(value) => updateAffiliation(idx, 'link', value)}
        onReset={() => resetAffiliation(idx)}
        onSubmit={() => submitAffiliation(affiliation, idx)}
        onDelete={() => deleteAffiliation(idx)}
        affiliationText={affiliation.affiliation}
        affiliationLink={affiliation.link}
        key={affiliation.id}
        disabled={inFlightAffiliations.includes(affiliation.id)}
        errors={errors[affiliation.id]}
      />
    ));
  };
  return (
    <StyledFooter>
      <Modal
        showModal={showModal}
        setShowModal={setShowModal}
        title={
          <span>Add new Affiliation</span>
      }
        content={(
          <EditableAffiliation
            onTextChange={(value) => updateNewAffiliation('affiliation', value)}
            onLinkChange={(value) => updateNewAffiliation('link', value)}
            onReset={() => setNewAffiliation(DEFAULT_NEW_AFFILIATION_STATE)}
            onSubmit={() => submitAffiliation(newAffiliation, affiliations.length, () => setShowModal(false))}
            affiliationText={newAffiliation.affiliation}
            affiliationLink={newAffiliation.link}
            disabled={inFlightAffiliations.includes(newAffiliation.id)}
            showDelete={false}
            errors={errors[newAffiliation.id]}
          />
        )}
      />
      <FooterTitle>Interesting Facts</FooterTitle>
      <DisabledSectionContainer>
        <LoadingContainer key={footerData.stats.length}>
          {showStats}
        </LoadingContainer>
      </DisabledSectionContainer>
      <AffiliationsAndLinks>
        <EditableAffiliations>
          <FooterSubTitle>Affiliations</FooterSubTitle>
          {showAffiliations()}
          <PrimaryButton type="buton" onClick={addAffiliation}>Create new affiliation</PrimaryButton>
        </EditableAffiliations>
        <SocialMediaContainer>
          <DisabledSectionContainer>
            <FooterSubTitle>Find me on social media</FooterSubTitle>
            <SocialMedia>
              <a
                tabIndex="0"
                href="https://www.instagram.com/elspetheastman/?hl=en"
                target="_blank"
                rel="noreferrer"
              >
                <SocialMediaIcon src={Instagram} alt="Instagram icon" />
              </a>
              <a
                href="https://soundcloud.com/elspetheastman"
                target="_blank"
                rel="noreferrer"
              >
                <SocialMediaIcon src={Soundcloud} alt="Soundcloud icon" />
              </a>
              <a
                href="https://twitter.com/elspetheastman"
                target="_blank"
                rel="noreferrer"
              >
                <SocialMediaIcon src={Twitter} alt="Twitter icon" />
              </a>
              <a
                href="https://www.youtube.com/user/ratedEwithElspeth"
                target="_blank"
                rel="noreferrer"
              >
                <SocialMediaIcon src={Youtube} alt="Youtube icon" />
              </a>
            </SocialMedia>
          </DisabledSectionContainer>
        </SocialMediaContainer>
      </AffiliationsAndLinks>
    </StyledFooter>
  );
};

export default EditablePageFooter;
