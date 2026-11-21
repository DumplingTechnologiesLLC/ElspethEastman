import { Portfolio } from './Portfolio.presentational';
import { usePortfolioState, type PortfolioWiring } from './usePortfolioState';
import { PageKind } from '../../domain/models/Page';
import { HomePageWired } from '../HomePage/HomePage.wired';
import { VoiceoverPageWired } from '../VoiceoverPage/VoiceoverPage.wired';
import { MusicPageWired } from '../MusicPage/MusicPage.wired';
import { StreamingPageWired } from '../StreamingPage/StreamingPage.wired';
import { PressPageWired } from '../PressPage/PressPage.wired';
import { BioPageWired } from '../BioPage/BioPage.wired';
import { ContentEditorWired } from '../ContentEditor/ContentEditor.wired';
import { LoginWired } from '../Login/Login.wired';
import { NotificationsWired } from '../Notifications/Notifications.wired';
export function PortfolioWired(props: PortfolioWiring) {
  const state = usePortfolioState(props);
  return (
    <Portfolio
      {...state}
      pages={{
        [PageKind.Home]: (
          <HomePageWired
            services={props.services}
            pageId={state.pageId}
            editor={state.editor}
          />
        ),
        [PageKind.Voiceover]: (
          <VoiceoverPageWired
            services={props.services}
            pageId={state.pageId}
            editor={state.editor}
          />
        ),
        [PageKind.Music]: (
          <MusicPageWired
            services={props.services}
            pageId={state.pageId}
            editor={state.editor}
          />
        ),
        [PageKind.Streaming]: (
          <StreamingPageWired
            services={props.services}
            pageId={state.pageId}
            editor={state.editor}
          />
        ),
        [PageKind.Press]: (
          <PressPageWired
            services={props.services}
            pageId={state.pageId}
            editor={state.editor}
          />
        ),
        [PageKind.Bio]: (
          <BioPageWired
            services={props.services}
            pageId={state.pageId}
            editor={state.editor}
          />
        ),
      }}
      login={<LoginWired services={props.services} />}
      editorDialog={
        <ContentEditorWired
          key={state.pageId}
          services={props.services}
          pageId={state.pageId}
        />
      }
      notifications={<NotificationsWired services={props.services} />}
    />
  );
}
