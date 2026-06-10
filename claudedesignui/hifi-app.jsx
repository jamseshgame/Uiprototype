/* global React, ReactDOM, DesignCanvas, DCSection, DCArtboard */
const {
  LobbyScreen, PerformMpScreen, StudioScreen,
  SoloResultScreen, BandResultScreen,
  BandIncompleteScreen, RewardsScreen, EosActionsScreen, QuestHandoffScreen,
} = window;

const HifiApp = () => (
  <DesignCanvas>
    <DCSection
      id="user-journey"
      title="User Journey"
      subtitle="Hi-fi · social lobby → invite → studio · entry to play"
    >
      <DCArtboard id="lobby"     label="01 · Social Lobby"       width={1920} height={1920}>
        <LobbyScreen />
      </DCArtboard>
      <DCArtboard id="perform-mp" label="02 · Perform · Multiplayer" width={1920} height={1920}>
        <PerformMpScreen />
      </DCArtboard>
      <DCArtboard id="studio"     label="03 · Personal Studio + Loadout HUD" width={1920} height={1920}>
        <StudioScreen />
      </DCArtboard>
    </DCSection>

    <DCSection
      id="end-of-session"
      title="End of Session"
      subtitle="Hi-fi · last note → results → rewards → what's next"
    >
      <DCArtboard id="solo-result"     label="05 · Solo · your score"           width={1920} height={1920}>
        <SoloResultScreen />
      </DCArtboard>
      <DCArtboard id="band-result"     label="06 · Band · your score + band score" width={1920} height={1920}>
        <BandResultScreen />
      </DCArtboard>
      <DCArtboard id="band-incomplete" label="07 · Band · member left early"    width={1920} height={1920}>
        <BandIncompleteScreen />
      </DCArtboard>
      <DCArtboard id="rewards"         label="08 · Rewards reveal"              width={1920} height={1920}>
        <RewardsScreen />
      </DCArtboard>
      <DCArtboard id="eos-actions"     label="09 · What's next · share / replay / new" width={1920} height={1920}>
        <EosActionsScreen />
      </DCArtboard>
      <DCArtboard id="quest-handoff"   label="10 · Quest system handoff · clip on headset" width={1920} height={1920}>
        <QuestHandoffScreen />
      </DCArtboard>
    </DCSection>
  </DesignCanvas>
);

ReactDOM.createRoot(document.getElementById('root')).render(<HifiApp />);
