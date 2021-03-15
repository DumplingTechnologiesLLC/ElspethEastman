import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import API from '../api';
import CircularLoadingBar from '../components/CircularLoadingBar';
import StyledFooter, { FooterContent, FooterTitle, FooterSubTitle } from '../components/Layout/StyledFooter';
import Instagram from '../assets/svg/Instagram.svg';
import Linkedin from '../assets/svg/Linkedin.svg';
import Soundcloud from '../assets/svg/Soundcloud.svg';
import Twitter from '../assets/svg/Twitter.svg';
import Youtube from '../assets/svg/Youtube.svg';

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  width: 100%;
`;

const AffiliationsAndLinks = styled.div`
  display: flex;
  padding-top: 2em;
  flex-direction: row;
  justify-content: space-evenly;
  width: 100%;
`;

const Affiliations = styled.div`
  display: flex;
  flex-direction: column;
`;
const SocialMediaContainer = styled.div`
  display: flex;
  
  flex-direction: column;
`;
const SocialMedia = styled.div`
  display: flex;
  flex-direction: row;
  padding-top: .5em;
  justify-content: space-between;
`;
const SocialMediaIcon = styled.img`
  height: 40px;
`;

export const PageFooter = () => {
  const [footerData, setFooterData] = useState({
    stats: [],
    affiliations: [],
  });
  const [inFlight, setInFlight] = useState(false);
  const [loaded, setLoaded] = useState(false);
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
        if (response.ok) {
          setFooterData(response);
        } else {
          setFooterData(errorState);
        }
      } catch (err) {
        setInFlight(false);
        setFooterData(errorState);
        setLoaded(true);
        // TODO Toast
      }
    };
    retrieveFooter();
  }, []);
  const showStats = () => {
    if (inFlight || !loaded) {
      return (<FontAwesomeIcon size="6x" icon={faSpinner} pulse />);
    }
    if (loaded && !footerData.stats.length) {
      return (<FooterContent>Failed to load stats.</FooterContent>);
    }
    return footerData.stats.map((stat) => (
      <CircularLoadingBar label={stat.label} value={stat.value} percent={stat.percent} key={stat.id} />
    ));
  };
  const showAffiliations = () => {
    if (inFlight || !loaded) {
      return (<FontAwesomeIcon size="lg" icon={faSpinner} pulse />);
    }
    return footerData.affiliations.map((affiliation) => (
      <FooterContent key={affiliation}>{affiliation}</FooterContent>
    ));
  };
  return (
    <StyledFooter>
      <FooterTitle>Interesting Facts</FooterTitle>
      <LoadingContainer key={footerData.stats.length}>
        {showStats()}
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
              href="https://www.instagram.com/elspetheastman/?hl=en"
              target="_blank"
              rel="noreferrer"
            >
              <SocialMediaIcon src={Instagram} alt="Instagram icon" />
            </a>
            <a href=""><SocialMediaIcon src={Linkedin} alt="Linkedin icon" /></a>
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
