import * as React from 'react';
import './Popup.scss';
import Button, { ButtonGroup } from '@atlaskit/button'
import ModalDialog, { ModalTransition } from '@atlaskit/modal-dialog';
import Setting from './container/Setting';
import CreateIssue from './container/CreateIssue';

interface AppProps {}

interface AppState {
    isLoggedIn : boolean,
    isOpen : boolean,
    currentContainer : ModalContainerList
}
interface IssueType {
    self : string,
    id  : string,
    description : string,
    iconUrl : string,
    name : string,
    subtask :boolean,
    avatarId : number,
    entityId : string,
    scope : object,
    expand : string,
    fields : object
}
interface ProjectIssueCreateMetadata {
    expand: string,
    self : string,
    id : string,
    key : string,
    name : string,
    avatarUrls : object,
    issuetypes : IssueType[]
}
interface CreateMetaJson {
    projects : ProjectIssueCreateMetadata[],
    expand? : string
}

interface CreateMetaProps {
    json : CreateMetaJson
}

export default class Popup extends React.Component<AppProps, AppState> {
    constructor(props: AppProps, state: AppState) {
        super(props, state);
        this.state = {
            isOpen : false,
            isLoggedIn : false,
            currentContainer : ModalContainerList.Setting
        };
        this.onModalClose = this.onModalClose.bind(this);
        this.onButtonClick = this.onButtonClick.bind(this);
    }

    componentDidMount() {
        // Example of how to send a message to eventPage.ts.
        chrome.runtime.sendMessage({ popupMounted: true });
    }

    changeModalState(isOpen) {
        this.setState({
            isOpen : isOpen
        })
    }

    onButtonClick(e) {
        chrome.runtime.sendMessage({ api: 'rest/api/3/issue/createmeta'}, function(response : CreateMetaProps) {
            console.log(response.json);
        });
    }

    onModalClose(e) {
        this.changeModalState(false);
    }


    render() {
        const { isLoggedIn, isOpen } = this.state;
        const currentContainer = () => {
            const {currentContainer} = this.state;
            switch(currentContainer) {
                case ModalContainerList.Setting:
                    return <Setting/>
                case ModalContainerList.CreateIssue:
                    return <CreateIssue/>
                default:
                    throw new Error('"currentContainer" value is Empty');
            }
        }

        const LoggedInUI =
            <React.Fragment>
                <Button className="floatButton" onClick={() => {this.changeModalState(true);}}>click</Button>
                <ModalTransition>
                    {isOpen && <ModalDialog
                        onClose={this.onModalClose}
                        autoFocus={true}
                        components={{
                            Container : ({ children, className }) => currentContainer()
                        }}>
                    </ModalDialog>}
                </ModalTransition>
            </React.Fragment>;

        const LoginUI =
            <Button className="floatButton" onClick={this.onButtonClick}>JIRA Login</Button>;

        return (
            <div className="popupContainer">
                {isLoggedIn ? LoggedInUI : LoginUI}
            </div>
        )
    }
}
