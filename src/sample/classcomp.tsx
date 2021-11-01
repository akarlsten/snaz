import * as React from 'react'
import { Callout, IButtonStyles, IconButton, IStackStyles, IStackTokens, Stack } from '@fluentui/react'
import { getRandomString, } from "@pnp/common"

export interface TvInfoProps {
  id: string
  desc: string
  label: string
}

export interface TvInfoState {
  isCalloutVisible: boolean
}
const stackTokens: IStackTokens = {
  childrenGap: 4,
}
const labelCalloutStackStyles: Partial<IStackStyles> = { root: { padding: 20, maxWidth: "300px" } }
const iconButtonStyles: Partial<IButtonStyles> = { root: { color: "#5bc0de", marginBottom: "-1px" } }
const iconProps = { iconName: 'Info' }

export default class TvInfo extends React.Component<TvInfoProps, TvInfoState> {
  private randId = getRandomString(5);
  constructor(props) {
    super(props)
    this.state = {
      isCalloutVisible: false,
    }
  }
  private toggleIsCalloutVisible() {
    this.setState({ isCalloutVisible: !this.state.isCalloutVisible })
  }
  public render(): React.ReactElement<TvInfoProps> {

    return (
      <>
        <Stack horizontal verticalAlign="center" tokens={stackTokens}>
          <span id={"icon" + this.props.id}>{this.props.label}</span>
          <IconButton
            id={"icon" + this.props.id + "infoIcon" + this.randId}
            iconProps={iconProps}
            title="Info"
            ariaLabel="Info"
            onClick={this.toggleIsCalloutVisible.bind(this)}
            styles={iconButtonStyles}
          />
        </Stack>
        {this.state.isCalloutVisible && (
          <Callout
            target={'#icon' + this.props.id + "infoIcon" + this.randId}
            setInitialFocus
            onDismiss={this.toggleIsCalloutVisible.bind(this)}
            ariaDescribedBy={"icon" + this.props.id + "infoDesc" + this.randId}
            role="alertdialog"
          >
            <Stack tokens={stackTokens} horizontalAlign="start" styles={labelCalloutStackStyles}>
              <span id={"icon" + this.props.id + "infoDesc" + this.randId}>{this.props.desc}</span>
            </Stack>
          </Callout>
        )}
      </>
    )
  }
}
