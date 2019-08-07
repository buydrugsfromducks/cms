import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import styled from 'styled-components';

import Login from '../../containers/Login/Login';
import Registration from '../../containers/Registration/Registration';

import './Info.scss';

import b from '../../service/Utils/b';

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
`;

interface IProps extends RouteComponentProps<any> {
  type: 'Forbidden' | 'Development' | 'NotFound' | 'Error' | 'SignUp';
}

//const log = <Login />

class Info extends React.Component<IProps> {
  public render(): JSX.Element {
    const {type} = this.props;
    console.log(type);
    
    return (
      <Wrapper>
        <div>
          <div className={ b('info', 'text', {header: true, center: true}) }>{ this.getTextByType(type) }</div>
          { /* <img className='info__img' src={ require(`./imgs/${type}.svg`) } /> */ }
        </div>
      </Wrapper>
    );
  }
  
  private getTextByType(type: string) {
    switch (type) {
      case 'Forbidden':
        return <Login/>;
      case 'SignUp':
        return <Registration/>;
      case 'Development':
        return 'В разработке';
      case 'NotFound':
        return 'Страница не найдена';
      case 'Error':
        return 'Мы уже исправляем ошибку!';
      default:
        return '';
    }
  }
}

export default withRouter(Info);
