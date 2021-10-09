import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState, useContext } from 'react';
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
import EditableAffiliation from './EditableAffiliation';

const EditableAffiliations = styled(Affiliations)`
  min-width: 400px;
`;

export const EditablePageFooter = () => {
  const [footerData, setFooterData] = useState({
    stats: [],
    affiliations: [],
  });
  const [affiliations, setAffiliations] = useState([]);
  const [cachedAffiliations, setCachedAffiliations] = useState([]);
  const [inFlight, setInFlight] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { toast, flavors } = useContext(ToastContext);

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
        setAffiliations(response.affiliations);
        setCachedAffiliations(response.affiliations);
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
  const showStats = () => {
    if (inFlight || !loaded) {
      return (<FontAwesomeIcon size="6x" icon={faSpinner} pulse />);
    }
    if (loaded && !footerData?.stats?.length) {
      return (<FooterContent>Failed to load stats.</FooterContent>);
    }
    return footerData.stats.map((stat) => (
      <CircularLoadingBar label={stat.label} value={stat.value} percent={stat.percent} key={stat.id} />
    ));
  };

  const updateAffiliation = (id, key, value) => {
    const stateClone = JSON.parse(JSON.stringify(affiliations));
    const affiliationIndex = affiliations.findIndex((affiliation) => affiliation.id === id);
    affiliations[affiliationIndex][key] = value;
    setAffiliations(stateClone);
  };

  const resetAffiliation = (id) => {
    const affiliationIndex = affiliations.findIndex((affiliation) => affiliation.id === id);
    const stateClone = JSON.parse(JSON.stringify(affiliations));
    stateClone[affiliationIndex] = { ...cachedAffiliations[affiliationIndex] };
    setCachedAffiliations(stateClone);
  };

  const submitAffiliation = () => {
    // TODO implement
  };

  const deleteAffiliation = () => {
    // TODO implement
  };

  const addAffiliation = () => {
    // TODO implement
  };

  const showAffiliations = () => {
    if (inFlight || !loaded) {
      return (<FontAwesomeIcon size="lg" icon={faSpinner} pulse />);
    }
    return affiliations.map((affiliation) => (
      <EditableAffiliation
        onTextChange={(value) => updateAffiliation(affiliation.id, 'affiliation', value)}
        onLinkChange={(value) => updateAffiliation(affiliation.id, 'link', value)}
        onReset={resetAffiliation}
        onSubmit={submitAffiliation}
        onDelete={deleteAffiliation}
        affiliationText={affiliation.affiliation}
        affiliationLink={affiliation.link}
        key={affiliation.id}
      />
    ));
  };
  return (
    <StyledFooter>
      <FooterTitle>Interesting Facts</FooterTitle>
      <DisabledSectionContainer>
        <LoadingContainer key={footerData.stats.length}>
          {showStats()}
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
