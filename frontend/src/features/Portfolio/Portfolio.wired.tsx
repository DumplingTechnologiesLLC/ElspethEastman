import { Portfolio, type PortfolioSlots } from './Portfolio.presentational';
import { usePortfolioState, type PortfolioWiring } from './usePortfolioState';
export function PortfolioWired(props: PortfolioWiring & PortfolioSlots) {
  const state = usePortfolioState(props);
  return (
    <Portfolio
      {...state}
      pages={props.pages}
      login={props.login}
      editorDialog={props.editorDialog}
      notifications={props.notifications}
    />
  );
}
