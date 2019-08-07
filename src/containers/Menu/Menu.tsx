import * as React from 'react';
import { compose, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Layout } from 'antd';

import { IReducers } from '../../redux';
import { CommonApi } from '../../redux/common/common.api';

import MenuEditList from '../../components/MenuEditList/MenuEditList';

const {Sider} = Layout;

interface IProps {
  getMenu?: () => void;
}

class Menu extends React.Component<IProps> {
  public componentDidMount() {
    this.props.getMenu();
  }

  public render(): JSX.Element {
    return (
      <Sider width={ 650 } style={ { background: '#fff', marginLeft: 185 } }>
        <MenuEditList />
      </Sider>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch<IReducers>) => {
  return {
    getMenu: () => dispatch(CommonApi.getMenu()),
  };
};

export default compose(
  withRouter,
  connect(null, mapDispatchToProps),
)(Menu);
