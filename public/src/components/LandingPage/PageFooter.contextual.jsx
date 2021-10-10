import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, {
  useEffect, useState, useContext, useMemo,
} from 'react';
import styled, { css } from 'styled-components';
import CircularLoadingBar from '@Components/LandingPage/footer/CircularLoadingBar';
import StyledFooter, {
  FooterContent, FooterContentLink, FooterTitle, FooterSubTitle,
} from '@Components/Layout/StyledFooter';
import { ToastContext, DEFAULT_ERROR_MESSAGE_TITLE } from '@Components/ToastManager';
import API from '@App/api';
import Instagram from '@Assets/svg/Instagram.svg';
import Soundcloud from '@Assets/svg/Soundcloud.svg';
import Twitter from '@Assets/svg/Twitter.svg';
import Youtube from '@Assets/svg/Youtube.svg';
import { HTTP_SUCCESS, performAPIAction } from '@App/api/utils';

export const LoadingContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: space-evenly;
  width: 100%;
`;

export const AffiliationsAndLinks = styled.div`
  ${(props) => css`
    display: flex;
    padding-top: ${props.theme.spacing.xl};
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;
    width: 100%;
  `}
`;

export const Affiliations = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 200px;
`;
export const SocialMediaContainer = styled.div`
  display: flex;
  
  flex-direction: column;
  ${(props) => css`
    @media screen and (max-width: ${props.theme.breakpoints.heroSmall}) {
      margin-top: ${props.theme.spacing.md};
    }
  `}
`;
export const SocialMedia = styled.div`
  ${(props) => css`
    display: flex;
    flex-direction: row;
    padding-top: ${props.theme.spacing.sm};
    min-width: 200px;
    justify-content: space-between;
  `}
`;
export const SocialMediaIcon = styled.img`
  height: 40px;
`;

export const DEFAULT_STATE = {
  stats: [],
  affiliations: [],
};

export const ERROR_STATE = {
  ...DEFAULT_STATE,
  affiliations: ['Failed to load...'],
};

export const PageFooter = () => {
  const [footerData, setFooterData] = useState(DEFAULT_STATE);
  const [inFlight, setInFlight] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { toast, flavors } = useContext(ToastContext);

  useEffect(() => {
    const retrieveFooter = async () => {
      setInFlight(true);
      const response = await performAPIAction(API.retrieveFooterData, null, null, toast);
      setLoaded(true);
      setInFlight(false);

      if (response.status === HTTP_SUCCESS) {
        setFooterData(response.data);
      } else {
        setFooterData(ERROR_STATE);
        toast(
          DEFAULT_ERROR_MESSAGE_TITLE,
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
  }, [inFlight, loaded, footerData.stats]);
  const showAffiliations = () => {
    if (inFlight || !loaded) {
      return (<FontAwesomeIcon size="lg" icon={faSpinner} pulse />);
    }
    return footerData.affiliations.map((affiliation) => (
      <FooterContentLink key={affiliation.id} href={affiliation.link}>{affiliation.affiliation}</FooterContentLink>
    ));
  };
  return (
    <StyledFooter>
      <FooterTitle>Interesting Facts</FooterTitle>
      <LoadingContainer key={footerData.stats.length}>
        {showStats}
      </LoadingContainer>
      <AffiliationsAndLinks>
        <Affiliations>
          <FooterSubTitle>Affiliations</FooterSubTitle>
          {showAffiliations()}
        </Affiliations>
        <SocialMediaContainer>
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
        </SocialMediaContainer>
      </AffiliationsAndLinks>
    </StyledFooter>
  );
};

export default PageFooter;
