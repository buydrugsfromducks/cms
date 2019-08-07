import * as React from 'react';
import { connect } from 'react-redux';
import { Card } from 'antd';
import { IContainer } from 'react-cms';

import { IReducers } from '../../../redux';
import { getContainer } from '../../../redux/common/common.selector';

import ModuleURL from './ModuleURL';
import ModuleNews from './ModuleNews';
import ModulePage from './ModulePage';
import ModulePeopleList from './ModulePeopleList';
import ModuleCompanies from './ModuleCompanies';
import ModuleProgram from './ModuleProgram';
import ModulePoll from './ModulePoll';

interface IProps {
  container?: IContainer;
}

class ContentList extends React.Component<IProps> {
  public render(): JSX.Element {
    return this.getContent();
  }

  private getContent = (): JSX.Element => {
    const { container } = this.props;
    console.log(this.props);

    switch (container.module) {
      case 5:
        return <ModuleURL />;
      case 6:
        return <ModulePage />;
      case 7:
        return <ModuleNews />;
      case 8:
        return <ModuleProgram />;
      case 13:
        return <ModulePeopleList />;
      case 14:
        return <ModuleCompanies />;
      case 30:
        return <ModulePoll />;
      case null:
      default:
        return (
          <div style={ { width: '100%', height: '100%', textAlign: 'center' } }>
            <span style={ { fontSize: '14pt', fontWeight: 'bold' } }>Данный модуль не требует редактирования</span>
          </div>
        );
    }
  };
}

const mapStateToProps = (state: IReducers) => {
  return {
    container: getContainer(state),
  };
};

export default connect(mapStateToProps)(ContentList);
