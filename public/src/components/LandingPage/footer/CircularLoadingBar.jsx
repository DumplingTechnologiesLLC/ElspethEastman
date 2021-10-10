import React, { useRef, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import { FooterContent } from '@Components/Layout/StyledFooter';

const canvasDimension = 200;
const circleDimension = 175;

const LoadingContainer = styled.div`
  position: relative;
  text-align: center;
`;
const LabelContainer = styled.div`
  ${(props) => css`
    ${props.theme.fixedOrAbsoluteFullCoverage}
  `}
  position: absolute;
  width: 100%;
  height: ${canvasDimension}px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
`;

const BottomLabel = styled(FooterContent)`
  margin: 0;
`;

export const CircularLoadingBar = ({ value, percent, label }) => {
  const canvasRef = useRef(null);

  const [shouldDraw, setShouldDraw] = useState(false);

  useEffect(() => {
    const target = canvasRef.current;
    const intersectionObserverOptions = {
      root: null,
      threshold: 1,
    };
    const onIntersection = (entries, opts) => {
      entries.forEach((entry) => {
        setShouldDraw(entry.intersectionRatio >= opts.thresholds[0]);
      });
    };
    const observer = new IntersectionObserver(onIntersection, intersectionObserverOptions);
    observer.observe(target);
    return () => {
      observer.unobserve(target);
    };
  }, []);
  useEffect(() => {
    const totalFramesForAnimation = 100;
    const drawBackgroundCircle = (ctx) => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.521)';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(canvasDimension / 2, canvasDimension / 2, circleDimension / 2, 0, 2 * Math.PI);
      ctx.stroke();
    };
    const radianPercent = (Math.PI / 180) * (360 * percent / 100);
    const twelveOClock = (Math.PI / 180) * 270;
    const drawLoadingCircle = (ctx, frameCount) => {
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(
        canvasDimension / 2,
        canvasDimension / 2,
        circleDimension / 2,
        twelveOClock,
        twelveOClock + (radianPercent * (frameCount / totalFramesForAnimation)),
      );
      ctx.stroke();
    };
    const draw = (ctx, frameCount) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      drawBackgroundCircle(ctx);
      if (shouldDraw) {
        drawLoadingCircle(ctx, frameCount);
      }
    };
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    let frameCount = 0;
    let animationFrameId;

    // Our draw came here
    const render = () => {
      frameCount += 1;
      draw(context, frameCount);
      if (frameCount === totalFramesForAnimation) {
        window.cancelAnimationFrame(animationFrameId);
      } else {
        animationFrameId = window.requestAnimationFrame(render);
      }
    };
    render();
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  });
  return (
    <LoadingContainer>
      <LabelContainer>
        <FooterContent>
          {value}
        </FooterContent>
      </LabelContainer>
      <canvas ref={canvasRef} width={canvasDimension} height={canvasDimension} />
      <BottomLabel>
        {label}
      </BottomLabel>
    </LoadingContainer>
  );
};

CircularLoadingBar.propTypes = {
  value: PropTypes.string.isRequired,
  percent: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
};

export default CircularLoadingBar;
