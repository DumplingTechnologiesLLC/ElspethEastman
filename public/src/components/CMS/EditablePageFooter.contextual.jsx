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
  DEFAULT_STATE,
  ERROR_STATE,
} from '@Components/LandingPage/PageFooter.contextual';
import { ToastContext } from '@Components/ToastManager';
import API from '@App/api';
import Instagram from '@Assets/svg/Instagram.svg';
import Soundcloud from '@Assets/svg/Soundcloud.svg';
import Twitter from '@Assets/svg/Twitter.svg';
import Youtube from '@Assets/svg/Youtube.svg';
import DisabledSectionContainer from '@Components/DisabledSectionContainer';
import styled from 'styled-components';
import PrimaryButton from '@Components/Buttons/PrimaryButton';
import { cloneDeep, toastMapFactory } from '@App/utils';
import Modal from '@Components/Modal/Modal';
import {
  HTTP_BAD_SUBMISSION, performAPIAction, performAPIDelete, toastBasedOnResponse, HTTP_SUCCESS,
} from '@App/api/utils';
import EditableAffiliation from './footer/EditableAffiliation';

const EditableAffiliations = styled(Affiliations)`
  min-width: 400px;
`;

const DEFAULT_NEW_AFFILIATION_STATE = {
  link: '',
  affiliation: '',
};

export const EditablePageFooter = () => {
  const [footerData, setFooterData] = useState(DEFAULT_STATE);
  const [affiliations, setAffiliations] = useState([]);
  const [cachedAffiliations, setCachedAffiliations] = useState([]);
  const [inFlight, setInFlight] = useState(false);
  const [inFlightAffiliations, setInFlightAffiliations] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const { toast, flavors } = useContext(ToastContext);
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [newAffiliation, setNewAffiliation] = useState(DEFAULT_NEW_AFFILIATION_STATE);

  const toastMap = toastMapFactory('Affiliation no longer exists. Perhaps it was already deleted?');

  useEffect(() => {
    const retrieveFooter = async () => {
      setInFlight(true);
      const response = await performAPIAction(API.retrieveFooterData, null, null, toast);
      setInFlight(false);
      setLoaded(true);

      if (response.status === HTTP_SUCCESS) {
        setFooterData(response.data);
        setAffiliations(cloneDeep(response.data.affiliations));
        setCachedAffiliations(cloneDeep(response.data.affiliations));
      } else {
        setFooterData(ERROR_STATE);
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

  const submitAffiliation = async (affiliation, idx) => {
    // clear out stale errors from last error state for this affiliation
    const affiliationToSubmit = cloneDeep(affiliation);
    const errorsClearedForAffiliation = cloneDeep(errors);
    delete errorsClearedForAffiliation[affiliation.id];
    setErrors(errorsClearedForAffiliation);

    setInFlightAffiliations([...inFlightAffiliations, affiliationToSubmit.id]);
    const response = await performAPIAction(
      typeof affiliationToSubmit.id !== 'undefined' ? API.updateAffiliation : API.createAffiliation,
      affiliationToSubmit,
      affiliationToSubmit.id,
      toast,
    );
    setInFlightAffiliations([inFlightAffiliations.filter((aff) => aff.id !== affiliationToSubmit.id)]);

    toastBasedOnResponse(response, toast, toastMap);
    if (response.status === HTTP_SUCCESS) {
      const updatedAffiliations = cloneDeep(affiliations);
      updatedAffiliations[idx] = response.data;
      setAffiliations(updatedAffiliations);
      setCachedAffiliations(cloneDeep(updatedAffiliations));
    } else if (response.status === HTTP_BAD_SUBMISSION) {
      setErrors({ ...errors, [affiliationToSubmit.id]: response.data });
    }
  };

  const deleteAffiliation = async (index) => {
    const affiliationToBeDeleted = affiliations[index];

    setInFlightAffiliations([...inFlightAffiliations, affiliationToBeDeleted.id]);
    const response = await performAPIDelete(API.deleteAffiliation, affiliationToBeDeleted.id, toast);
    setInFlightAffiliations(inFlightAffiliations.filter((id) => id !== affiliationToBeDeleted.id));

    if (response.status === HTTP_SUCCESS) {
      const newAffiliations = cloneDeep(affiliations);
      setAffiliations(newAffiliations);
      setCachedAffiliations(cloneDeep(newAffiliations));
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
